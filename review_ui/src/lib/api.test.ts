import { describe, expect, it, vi } from 'vitest';
import { ReviewApiClient, StaleStateError, type ApiEnvelope, type ImportManifestResponse, type JobState, type LibraryResponse, type SavedView } from './api';

function response<T>(status: number, envelope: ApiEnvelope<T>): Response {
  return new Response(JSON.stringify(envelope), { status, headers: { 'Content-Type': 'application/json' } });
}

function envelope<T>(data: T | null, generation = 4): ApiEnvelope<T> {
  return {
    meta: { api_version: 'v1', schema_version: 12, generation, request_id: 'request-test' },
    data,
    page: null,
    job: null,
    unavailable: [],
    error: null
  };
}

describe('ReviewApiClient', () => {
  it('reads and controls only persisted release-backfill state', async () => {
    const state = {
      id: 'job-backfill', kind: 'vault_backfill' as const, status: 'queued', phase: 'inventory',
      control_state: 'run', progress: { asset_total: null, asset_jobs_completed: 0 }, error: null
    };
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => response(202, envelope(state, 12)));
    const client = new ReviewApiClient(fetcher as typeof fetch);

    await client.backfill();
    await client.controlBackfill('pause', 12);

    expect(fetcher.mock.calls[0][0]).toBe('/api/v1/backfill');
    expect(fetcher.mock.calls[1][0]).toBe('/api/v1/backfill/control');
    expect(JSON.parse(String((fetcher.mock.calls[1][1] as RequestInit).body))).toEqual({
      generation: 12,
      action: 'pause',
      restart: false
    });
  });

  it('carries keyset cursors and records the latest generation', async () => {
    const view = { id: 'sv1', name: 'Morning', route: '/', state: {}, revision: 1, created_at: 'now', updated_at: 'now' };
    const fetcher = vi.fn(async (_input: RequestInfo | URL) => {
      const result = envelope<SavedView[]>([view], 9);
      result.page = { limit: 25, next_cursor: 'next' };
      return response(200, result);
    });
    const client = new ReviewApiClient(fetcher as typeof fetch);
    const result = await client.savedViews(25, 'cursor-value');

    expect(fetcher.mock.calls[0][0]).toBe('/api/v1/saved-views?limit=25&cursor=cursor-value');
    expect(result.page?.next_cursor).toBe('next');
    expect(client.generation).toBe(9);
  });

  it('turns stale application responses into a recoverable typed error', async () => {
    const result = envelope<null>(null, null as unknown as number);
    result.error = { code: 'stale_generation', message: 'Reload', details: { current: 8 } };
    const client = new ReviewApiClient(async () => response(409, result));

    await expect(client.putPreference('appearance', {}, 1, 7)).rejects.toBeInstanceOf(StaleStateError);
  });

  it('polls persisted job state until a terminal status', async () => {
    const running = envelope<JobState>({ id: 'job', kind: 'asset_preprocess', subject: { type: 'asset', id: 'a' }, phase: 'preprocessing', status: 'running', attempt: 1, max_attempts: 3, control_state: 'run', progress: {}, error: null, timestamps: {} });
    const complete = envelope<JobState>({ ...running.data!, status: 'completed' }, 5);
    const fetcher = vi.fn()
      .mockResolvedValueOnce(response(200, running))
      .mockResolvedValueOnce(response(200, complete));
    const updates: string[] = [];
    const client = new ReviewApiClient(fetcher as typeof fetch);

    const result = await client.pollJob('job', (value) => updates.push(value.data?.status ?? ''), { intervalMs: 1 });
    expect(result.data?.status).toBe('completed');
    expect(updates).toEqual(['running', 'completed']);
  });

  it('sends bounded manifest filters, safe multi-sort, and optimistic decision revisions', async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
      if (String(input).includes('/manifest?')) {
        return response(200, envelope<ImportManifestResponse>({ items: [], view: null, query: {} }, 12));
      }
      return response(200, envelope({ decisions: [] }, 13));
    });
    const client = new ReviewApiClient(fetcher as typeof fetch);
    await client.importManifest('batch one', {
      search: 'holiday card',
      classification: ['photo'],
      outcome: ['new_asset'],
      sort: ['size:desc', 'classification:asc'],
      limit: 250
    });
    const manifestUrl = String(fetcher.mock.calls[0][0]);
    expect(manifestUrl).toContain('/imports/batch%20one/manifest?');
    expect(manifestUrl).toContain('search=holiday+card');
    expect(manifestUrl).toContain('sort=size%3Adesc');
    expect(manifestUrl).toContain('sort=classification%3Aasc');

    await client.putImportDecisions('batch one', 4, [{ item_id: 'item', decision: 'exclude', expected_revision: 2 }], 12);
    const init = fetcher.mock.calls[1][1] as RequestInit;
    expect(init.method).toBe('PUT');
    expect(JSON.parse(String(init.body))).toEqual({
      generation: 12,
      batch_revision: 4,
      decisions: [{ item_id: 'item', decision: 'exclude', expected_revision: 2 }]
    });
  });

  it('threads keyset cursors through every bounded import evidence stream', async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL) => response(200, envelope([])));
    const client = new ReviewApiClient(fetcher as typeof fetch);
    await client.importFolders('batch', 25, 'folders-next');
    await client.importSamples('batch', 50, 'samples-next');
    await client.importEvents('batch', 75, 'events-next');
    await client.importErrors('batch', 100, 'errors-next');

    expect(fetcher.mock.calls.map((call) => call[0])).toEqual([
      '/api/v1/imports/batch/folders?limit=25&cursor=folders-next',
      '/api/v1/imports/batch/samples?limit=50&cursor=samples-next',
      '/api/v1/imports/batch/events?limit=75&cursor=events-next',
      '/api/v1/imports/batch/errors?limit=100&cursor=errors-next'
    ]);
  });

  it('sends bounded library facets, rejected defaults, compound sorts, and optimistic metadata state', async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
      if (String(input).includes('/library?')) {
        return response(200, envelope<LibraryResponse>({ items: [], query: {}, catalog: null }));
      }
      return response(200, envelope({ states: [], media_mutation: 'none' as const }));
    });
    const client = new ReviewApiClient(fetcher as typeof fetch);
    await client.library({
      mediaKind: ['image'], rejected: 'hide', sort: ['quality:desc', 'filename:asc'],
      randomSeed: 'morning', cursor: 'library-next', limit: 120
    });
    const url = String(fetcher.mock.calls[0][0]);
    expect(url).toContain('/library?');
    expect(url).toContain('limit=120');
    expect(url).toContain('rejected=hide');
    expect(url).toContain('cursor=library-next');
    expect(url).toContain('media_kind=image');
    expect(url).toContain('sort=quality%3Adesc');
    expect(url).toContain('sort=filename%3Aasc');

    await client.putLibraryState([{
      entity_id: 'entity', expected_revision: 3, favourite: true, rejected: false, rating: 5
    }], 4);
    const init = fetcher.mock.calls[1][1] as RequestInit;
    expect(init.method).toBe('PUT');
    expect(JSON.parse(String(init.body))).toEqual({
      generation: 4,
      states: [{ entity_id: 'entity', expected_revision: 3, favourite: true, rejected: false, rating: 5 }]
    });
  });

  it('uses bounded persisted organization pages and linked-library keys', async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL) => response(200, envelope([])));
    const client = new ReviewApiClient(fetcher as typeof fetch);
    await client.organizationCalendar({ limit: 40, year: 2024, month: 1, cursor: 'calendar-next' });
    await client.organizationFolders('folder-root', 50, 'folder-next');
    await client.organizationEquipment('camera', 60, 'camera-next');
    await client.organizationMap({ zoom: 8, south: -20, north: 20, west: 170, east: -170 }, 70, 'map-next');
    await client.library({ organizationKind: 'map', organizationKey: 'cluster one', limit: 80 });

    const urls = fetcher.mock.calls.map((call) => String(call[0]));
    expect(urls[0]).toBe('/api/v1/organize/calendar?limit=40&cursor=calendar-next&year=2024&month=1');
    expect(urls[1]).toBe('/api/v1/organize/folders?limit=50&parent_id=folder-root&cursor=folder-next');
    expect(urls[2]).toBe('/api/v1/organize/equipment/camera?limit=60&cursor=camera-next');
    expect(urls[3]).toContain('/api/v1/organize/map?zoom=8');
    expect(urls[3]).toContain('west=170&east=-170&limit=70&cursor=map-next');
    expect(urls[4]).toContain('organization_kind=map');
    expect(urls[4]).toContain('organization_key=cluster+one');
  });

  it('uses persisted Stack profiles, bounded member pages, and metadata-only cover mutations', async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => response(200, envelope({})));
    const client = new ReviewApiClient(fetcher as typeof fetch);
    const settings = {
      similarity: 0.81, time_proximity_seconds: 45, raw_jpeg_pairing_confidence: 0.9,
      exposure_preference: 'neutral' as const, sharpness_limit: 0.65,
      motion_preference: 'freeze' as const, order_direction: 'asc' as const
    };
    await client.stackProfiles(40, 'profile-next');
    await client.stackStatus('profile one');
    await client.createStackProfile({ name: 'Bursts', settings }, 7);
    await client.stacks('profile one', 60, 'stack-next');
    await client.stackDetail('profile one', 'stack one');
    await client.putStackCover('profile one', 'stack one', 'entity one', 3, 8);
    await client.library({ stackProfileId: 'profile one', sort: ['similarity:asc'] });

    const urls = fetcher.mock.calls.map((call) => String(call[0]));
    expect(urls[0]).toBe('/api/v1/stacks/profiles?limit=40&cursor=profile-next');
    expect(urls[1]).toBe('/api/v1/stacks/status?profile_id=profile+one');
    expect(urls[3]).toBe('/api/v1/stacks/profile%20one?limit=60&cursor=stack-next');
    expect(urls[4]).toBe('/api/v1/stacks/profile%20one/stack%20one');
    expect(urls[6]).toContain('stack_profile_id=profile+one');
    const createBody = JSON.parse(String((fetcher.mock.calls[2][1] as RequestInit).body));
    expect(createBody).toEqual({ generation: 7, name: 'Bursts', settings });
    const coverBody = JSON.parse(String((fetcher.mock.calls[5][1] as RequestInit).body));
    expect(coverBody).toEqual({ generation: 8, revision: 3, cover_entity_id: 'entity one' });
  });

  it('uses persisted junk pages, explicit feedback, reversible bulk actions, and Stack-rest confirmation', async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => response(200, envelope({})));
    const client = new ReviewApiClient(fetcher as typeof fetch);
    const settings = {
      confidence_threshold: 0.82,
      enabled_reasons: ['extreme_blur', 'camera_shake'],
      minimum_agreement: 2,
      protect_favourites: true
    };
    await client.junkProfiles(40, 'junk-next');
    await client.junkStatus('profile one');
    await client.createJunkProfile({ name: 'Strict', settings }, 7);
    await client.junkResults('profile one', { hiddenOnly: false, limit: 60, cursor: 'result-next' });
    await client.junkFeedback('profile one', 'entity one', 'false_positive', 8, 'Keep this');
    await client.bulkReject([{ entity_id: 'entity one', expected_revision: 3 }], 9, { confirmFavourites: true });
    await client.undoBulkReject('action one', 10);
    await client.rejectStackRest('stack profile', 'stack one', 4, 11, { confirmLargeSelection: true });

    const urls = fetcher.mock.calls.map((call) => String(call[0]));
    expect(urls[0]).toBe('/api/v1/junk/profiles?limit=40&cursor=junk-next');
    expect(urls[1]).toBe('/api/v1/junk/status?profile_id=profile+one');
    expect(urls[3]).toBe('/api/v1/junk/profile%20one?hidden_only=false&limit=60&cursor=result-next');
    expect(urls[4]).toBe('/api/v1/junk/profile%20one/feedback');
    expect(urls[5]).toBe('/api/v1/library/bulk-reject');
    expect(urls[6]).toBe('/api/v1/library/bulk-reject/undo');
    expect(urls[7]).toBe('/api/v1/stacks/stack%20profile/stack%20one/reject-rest');
    expect(JSON.parse(String((fetcher.mock.calls[2][1] as RequestInit).body))).toEqual({ generation: 7, name: 'Strict', settings });
    expect(JSON.parse(String((fetcher.mock.calls[5][1] as RequestInit).body))).toEqual({
      generation: 9,
      entities: [{ entity_id: 'entity one', expected_revision: 3 }],
      confirm: true,
      confirm_favourites: true,
      confirm_large_selection: false
    });
  });
});

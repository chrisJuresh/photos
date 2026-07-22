export type ApiError = {
  code: string;
  message: string;
  details: Record<string, unknown>;
};

export type UnavailableField = {
  field: string;
  reason: string;
};

export type ApiEnvelope<T> = {
  meta: {
    api_version: 'v1';
    schema_version: number;
    generation: number | null;
    request_id: string;
  };
  data: T | null;
  page: { limit: number; next_cursor: string | null } | null;
  job: { id: string; status: string; phase: string } | null;
  unavailable: UnavailableField[];
  error: ApiError | null;
};

export type SystemState = {
  service: string;
  tool_version: string;
  schema_version: number;
  generation: number;
  local_only: boolean;
};

export type Preference = {
  key: string;
  value: unknown;
  revision: number;
  created_at: string;
  updated_at: string;
};

export type SavedView = {
  id: string;
  name: string;
  route: string;
  state: Record<string, unknown>;
  revision: number;
  created_at: string;
  updated_at: string;
};

export type JobState = {
  id: string;
  kind: string;
  subject: { type: string; id: string };
  phase: string;
  status: string;
  attempt: number;
  max_attempts: number;
  control_state: string;
  progress: Record<string, unknown>;
  error: { message: string } | null;
  timestamps: Record<string, string | null>;
};

export type BackfillState = {
  id: string | null;
  kind: 'vault_backfill';
  status: string;
  phase: string;
  control_state: string;
  progress: {
    version?: string;
    message?: string;
    asset_total?: number | null;
    asset_jobs_enqueued?: number;
    asset_jobs_completed?: number;
    asset_jobs_failed?: number;
    asset_outputs_unavailable?: number;
    asset_timing_sample_count?: number;
    asset_current_rate_per_second?: number | null;
    asset_ewma_rate_per_second?: number | null;
    eta_seconds?: number | null;
    eta_confidence?: 'learning' | 'low' | 'medium' | 'high';
    eta_basis?: string;
    completed_phases?: string[];
    legacy_history_count?: number;
    throttle?: { asset_batch_size?: number; asset_job_priority?: number; reviewed_copy_priority?: number };
  };
  error: string | null;
};

export type ImportBatch = {
  id: string;
  name: string;
  status: string;
  revision: number;
  discovery_generation: number;
  traversal_complete: boolean;
  counts: Record<string, number>;
  bytes: { total: number; transferred: number; verified: number };
  classifications: Record<string, number>;
  match_outcomes: Record<string, number>;
  latest_metrics: Record<string, unknown>;
  current_job_id: string | null;
  active_approval_id: string | null;
  last_error: string | null;
  timestamps: Record<string, string | null>;
  approval?: { id: string; status: string; summary: Record<string, unknown>; approved_at: string; execute_authorized_at: string | null } | null;
  preflight_job?: Pick<JobState, 'id' | 'status' | 'progress' | 'error'> | null;
  job?: { job_id: string; status: string; phase: string; control_state: string } | null;
};

export type ImportFolder = {
  relative_path_text: string;
  phase: string;
  subtree_item_count: number;
  subtree_bytes: number;
  processed_count: number;
  copied_count: number;
  failed_count: number;
  remaining_bytes: number;
  warnings: string[];
  error_text: string | null;
};

export type ImportSample = {
  sample_id: number;
  recorded_at: string;
  phase: string;
  status: string;
  discovered_count: number;
  processed_count: number;
  failed_count: number;
  remaining_count: number;
  current_throughput_bps: number | null;
  ewma_throughput_bps: number | null;
  queue_depth: number;
  busy_workers: number;
  total_workers: number;
  metrics: Record<string, unknown>;
};

export type ImportEvent = {
  event_id: number;
  occurred_at: string;
  level: string;
  event_type: string;
  phase: string;
  message: string;
  evidence: Record<string, unknown>;
};

export type ImportError = {
  error_id: number;
  occurred_at: string;
  phase: string;
  code: string;
  cause_text: string;
  context: Record<string, unknown>;
  retryable: number;
  suggested_resolution: string;
  resolved_at: string | null;
};

export type ImportManifestItem = {
  id: string;
  relative_path: string;
  path: string;
  entry_kind: string;
  classification: string;
  media_kind: string | null;
  size_bytes: number | null;
  extension: string | null;
  signature_kind: string | null;
  mime_type: string | null;
  detected_format: string | null;
  unusual_extension: boolean;
  warnings: string[];
  error: string | null;
  hash_status: string;
  match_outcome: string;
  copy_status: string;
  copy_outcome: string | null;
  proposed_decision: string;
  effective_decision: string;
  decision_revision: number;
  associated_sidecar_of_item_id: string | null;
  preview: { status: string; url: string | null; error: string | null };
};

export type ManifestQuery = {
  classification?: string[];
  decision?: string[];
  entryKind?: string[];
  outcome?: string[];
  search?: string;
  sort?: string[];
  limit?: number;
  cursor?: string;
};

export type ImportManifestResponse = {
  items: ImportManifestItem[];
  view: { id: string; status: string; job_id: string; error: string | null } | null;
  query: Record<string, unknown>;
};

export type ApprovalResult = {
  approval_id: string;
  batch_id: string;
  batch_revision: number;
  decision_fingerprint: string;
  included_count: number;
  eligible_count: number;
  excluded_count: number;
  duplicate_count: number;
  sidecar_count: number;
  corrupt_count: number;
  projected_copy_bytes: number;
  destination_free_bytes: number;
  sufficient_free_space: boolean;
};

export type LibraryDerivative = {
  long_edge: number;
  kind: string;
  width: number | null;
  height: number | null;
  mime_type: string | null;
  status: string;
  error: string | null;
  url: string | null;
};

export type LibraryState = {
  favourite: boolean;
  rejected: boolean;
  rating: number;
  revision: number;
};

export type StackSettings = {
  similarity: number;
  time_proximity_seconds: number;
  raw_jpeg_pairing_confidence: number;
  exposure_preference: 'darker' | 'neutral' | 'brighter';
  sharpness_limit: number;
  motion_preference: 'freeze' | 'intentional_blur';
  order_direction: 'asc' | 'desc';
};

export type StackProfile = {
  id: string;
  name: string;
  settings: StackSettings;
  settings_sha256: string;
  catalog_generation: number;
  analyzer_version: string;
  feature_analyzer_version: string;
  status: string;
  is_default: boolean;
  is_current: boolean;
  replaces_profile_id: string | null;
  job_id: string;
  stack_count: number;
  member_count: number;
  candidate_edge_count: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  error: string | null;
};

export type StackSummary = {
  profile_id: string;
  id: string;
  member_count: number;
  cover_entity_id: string;
  ranked_cover_entity_id: string;
  cover_override_entity_id: string | null;
  cover_explanation: string;
  cover_method_version: string;
  cover_evidence: Record<string, unknown>;
  revision: number;
  is_cover: boolean;
  member_ordinal: number;
};

export type LibraryEntity = {
  id: string;
  anchor_asset_id: string;
  display_asset_id: string;
  entity_kind: string;
  media_kind: string;
  format: string;
  filename: string;
  primary_path: string | null;
  folder: string;
  capture: { time: string | null; source: string | null; ambiguous: boolean };
  import_time: string | null;
  equipment: { camera_make: string | null; camera_model: string | null; lens_model: string | null };
  exposure: {
    iso: number | null;
    aperture: number | null;
    time_seconds: number | null;
    focal_length_mm: number | null;
    compensation_ev: number | null;
    severity: number | null;
  };
  dimensions: { width: number | null; height: number | null };
  size_bytes: number;
  quality: number | null;
  counts: {
    members: number;
    raw_members: number;
    source_occurrences: number;
    exact_duplicates: number;
    near_duplicates: number;
  };
  state: LibraryState;
  indicators: { has_raw_companion: boolean; stack_member_count: number };
  derivatives: LibraryDerivative[];
  stack: StackSummary | null;
};

export type LibraryQuery = {
  mediaKind?: string[];
  format?: string[];
  camera?: string[];
  lens?: string[];
  folder?: string[];
  favourite?: boolean;
  rejected?: 'hide' | 'only' | 'include';
  ratingMin?: number;
  ratingMax?: number;
  search?: string;
  sort?: string[];
  randomSeed?: string;
  organizationKind?: 'calendar' | 'folder' | 'camera' | 'lens' | 'map';
  organizationKey?: string;
  stackProfileId?: string;
  limit?: number;
  cursor?: string;
};

export type LibraryView = {
  id: string;
  kind: string;
  status: string;
  job_id: string;
  source_generation: number;
  state_generation: number;
  item_count: number;
  error: string | null;
};

export type LibraryResponse = {
  items: LibraryEntity[];
  query: Record<string, unknown>;
  catalog: LibraryView | null;
  view?: LibraryView | null;
};

export type LibraryFacet = { key: string; label: string; count: number };

export type OrganizationFilter = {
  kind: 'calendar' | 'folder' | 'camera' | 'lens' | 'map';
  key: string;
};

export type OrganizationStatus = LibraryView & {
  progress: {
    catalog_generation?: number;
    entity_count?: number;
    calendar_bucket_count?: number;
    folder_node_count?: number;
    equipment_value_count?: number;
    map_cluster_count?: number;
    unknown_location_count?: number;
  };
};

export type CalendarBucket = {
  key: string;
  kind: 'date' | 'unknown' | 'ambiguous';
  date: string | null;
  year: number | null;
  month: number | null;
  day: number | null;
  label: string;
  count: number;
  library_filter: OrganizationFilter;
};

export type FolderNode = {
  id: string;
  source_root_id: string;
  parent_id: string | null;
  relative_path: string;
  label: string;
  depth: number;
  counts: {
    direct_logical: number;
    logical: number;
    direct_occurrences: number;
    occurrences: number;
  };
  library_filter: OrganizationFilter;
};

export type EquipmentBucket = {
  key: string;
  label: string;
  raw_values: Array<Record<string, string | null>>;
  count: number;
  library_filter: OrganizationFilter;
};

export type MapCluster = {
  id: string;
  zoom: number;
  geohash: string;
  center: { latitude: number; longitude: number };
  bounds: { south: number; north: number; west: number; east: number };
  count: number;
  library_filter: OrganizationFilter;
};

export type MapClusters = {
  clusters: MapCluster[];
  unknown_location_count: number;
  unknown_location_filter: OrganizationFilter;
  viewport: { zoom: number; south: number; north: number; west: number; east: number };
};

export type LibraryDetail = {
  entity: LibraryEntity;
  members: Array<Record<string, unknown>>;
  sources: Array<Record<string, unknown>>;
  destinations: Array<Record<string, unknown>>;
  relationships: Array<Record<string, unknown>>;
  raw_jpeg_evidence: Array<Record<string, unknown>>;
  warnings: Array<Record<string, unknown>>;
  metadata: Array<Record<string, unknown>>;
  features: Array<Record<string, unknown>>;
  state_events: Array<Record<string, unknown>>;
  stacks: Array<Record<string, unknown>>;
  stack_cover_events: Array<Record<string, unknown>>;
  junk: {
    profile: JunkProfile;
    result: Record<string, unknown> | null;
    signals: Array<Record<string, unknown>>;
  } | null;
  placeholders: { stacks: string; junk: string };
};

export type StackMember = {
  entity: LibraryEntity;
  ordinal: number;
  rank_score: number;
  rank_evidence: Record<string, unknown>;
  is_cover: boolean;
  is_override: boolean;
};

export type StackDetail = {
  profile: StackProfile;
  stack: StackSummary;
  members: StackMember[];
  cover_events: Array<Record<string, unknown>>;
};

export type StackPage = {
  profile: StackProfile;
  items: Array<{ stack: StackSummary; cover: LibraryEntity }>;
};

export type JunkSettings = {
  confidence_threshold: number;
  enabled_reasons: string[];
  minimum_agreement: number;
  protect_favourites: boolean;
};

export type JunkProfile = {
  id: string;
  name: string;
  settings: JunkSettings;
  settings_sha256: string;
  catalog_generation: number;
  analyzer_version: string;
  signal_analyzer_version: string;
  calibration_version: string;
  status: string;
  is_default: boolean;
  is_current: boolean;
  replaces_profile_id: string | null;
  calibration_parent_profile_id: string | null;
  job_id: string;
  result_count: number;
  effectively_hidden_count: number;
  favourite_protected_count: number;
  feedback_count: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  error: string | null;
};

export type JunkReason = {
  reason: string;
  label: string;
  confidence: number;
  method_threshold: number;
  method_version: string;
  evidence: Record<string, unknown>;
  better_alternative_entity_id: string | null;
};

export type JunkResult = {
  entity: LibraryEntity;
  ordinal: number;
  effective_hidden: boolean;
  favourite_protected: boolean;
  agreement_count: number;
  reasons: JunkReason[];
  explanation: string;
  better_alternative_entity_id: string | null;
  better_alternative: LibraryEntity | null;
};

export type JunkPage = { profile: JunkProfile; items: JunkResult[] };

export type BulkAction = {
  action_id: string;
  states: Array<{ entity_id: string } & LibraryState>;
  favourites_preserved?: boolean;
  undoable?: boolean;
  undone?: boolean;
  media_mutation: 'none';
};

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ApiError
  ) {
    super(problem.message);
    this.name = 'ApiClientError';
  }
}

export class StaleStateError extends ApiClientError {
  constructor(status: number, problem: ApiError) {
    super(status, problem);
    this.name = 'StaleStateError';
  }
}

type Fetcher = typeof fetch;

function idempotencyKey(): string {
  if (globalThis.crypto && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  return `request-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export class ReviewApiClient {
  generation: number | null = null;

  constructor(
    private readonly fetcher: Fetcher = fetch,
    private readonly base = '/api/v1'
  ) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<ApiEnvelope<T>> {
    const response = await this.fetcher(`${this.base}${path}`, init);
    let envelope: ApiEnvelope<T>;
    try {
      envelope = (await response.json()) as ApiEnvelope<T>;
    } catch {
      throw new ApiClientError(response.status, {
        code: 'invalid_response',
        message: 'The review service returned an invalid response.',
        details: {}
      });
    }
    if (envelope.meta.generation !== null) {
      this.generation = envelope.meta.generation;
    }
    if (!response.ok || envelope.error) {
      const problem = envelope.error ?? {
        code: 'request_failed',
        message: `Request failed with status ${response.status}`,
        details: {}
      };
      if (problem.code === 'stale_generation' || problem.code === 'stale_revision') {
        throw new StaleStateError(response.status, problem);
      }
      throw new ApiClientError(response.status, problem);
    }
    return envelope;
  }

  system(): Promise<ApiEnvelope<SystemState>> {
    return this.request('/system');
  }

  preferences(): Promise<ApiEnvelope<Preference[]>> {
    return this.request('/preferences');
  }

  putPreference(key: string, value: unknown, revision: number, generation: number): Promise<ApiEnvelope<Preference>> {
    return this.request(`/preferences/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey()
      },
      body: JSON.stringify({ value, revision, generation })
    });
  }

  savedViews(limit = 50, cursor?: string): Promise<ApiEnvelope<SavedView[]>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return this.request(`/saved-views?${params.toString()}`);
  }

  imports(limit = 100, cursor?: string, statuses: string[] = []): Promise<ApiEnvelope<ImportBatch[]>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    for (const status of statuses) params.append('status', status);
    return this.request(`/imports?${params.toString()}`);
  }

  importDetail(batchId: string): Promise<ApiEnvelope<ImportBatch>> {
    return this.request(`/imports/${encodeURIComponent(batchId)}`);
  }

  discoverImports(generation: number, reuseUnchanged = false): Promise<ApiEnvelope<{ job_id: string }>> {
    return this.mutation('/imports/discover', 'POST', { generation, reuse_unchanged: reuseUnchanged });
  }

  importFolders(batchId: string, limit = 100, cursor?: string): Promise<ApiEnvelope<ImportFolder[]>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return this.request(`/imports/${encodeURIComponent(batchId)}/folders?${params.toString()}`);
  }

  importSamples(batchId: string, limit = 200, cursor?: string): Promise<ApiEnvelope<ImportSample[]>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return this.request(`/imports/${encodeURIComponent(batchId)}/samples?${params.toString()}`);
  }

  importEvents(batchId: string, limit = 200, cursor?: string): Promise<ApiEnvelope<ImportEvent[]>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return this.request(`/imports/${encodeURIComponent(batchId)}/events?${params.toString()}`);
  }

  importErrors(batchId: string, limit = 200, cursor?: string): Promise<ApiEnvelope<ImportError[]>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return this.request(`/imports/${encodeURIComponent(batchId)}/errors?${params.toString()}`);
  }

  importManifest(batchId: string, query: ManifestQuery = {}): Promise<ApiEnvelope<ImportManifestResponse>> {
    const params = new URLSearchParams({ limit: String(query.limit ?? 200) });
    if (query.cursor) params.set('cursor', query.cursor);
    if (query.search) params.set('search', query.search);
    for (const value of query.classification ?? []) params.append('classification', value);
    for (const value of query.decision ?? []) params.append('decision', value);
    for (const value of query.entryKind ?? []) params.append('entry_kind', value);
    for (const value of query.outcome ?? []) params.append('outcome', value);
    for (const value of query.sort ?? ['relative_path:asc']) params.append('sort', value);
    return this.request(`/imports/${encodeURIComponent(batchId)}/manifest?${params.toString()}`);
  }

  putImportDecisions(
    batchId: string,
    batchRevision: number,
    decisions: Array<{ item_id: string; decision: 'include' | 'exclude'; expected_revision: number; reason?: string }>,
    generation: number
  ): Promise<ApiEnvelope<{ decisions: Array<{ item_id: string; decision: string; revision: number; batch_revision: number }> }>> {
    return this.mutation(`/imports/${encodeURIComponent(batchId)}/decisions`, 'PUT', {
      generation,
      batch_revision: batchRevision,
      decisions
    });
  }

  approvalPreflight(batchId: string, batchRevision: number, generation: number): Promise<ApiEnvelope<{ job_id: string }>> {
    return this.mutation(`/imports/${encodeURIComponent(batchId)}/approval-preflight`, 'POST', {
      generation,
      batch_revision: batchRevision
    });
  }

  approveImport(
    batchId: string,
    batchRevision: number,
    preflightJobId: string,
    generation: number
  ): Promise<ApiEnvelope<ApprovalResult>> {
    return this.mutation(`/imports/${encodeURIComponent(batchId)}/approve`, 'POST', {
      generation,
      batch_revision: batchRevision,
      preflight_job_id: preflightJobId,
      confirm: true
    });
  }

  executeImport(batchId: string, approvalId: string, generation: number): Promise<ApiEnvelope<{ job_id: string; approval_id: string }>> {
    return this.mutation(`/imports/${encodeURIComponent(batchId)}/execute`, 'POST', {
      generation,
      approval_id: approvalId,
      execute: true
    });
  }

  controlImport(batchId: string, action: 'pause' | 'resume' | 'cancel', generation: number): Promise<ApiEnvelope<{ job_id: string; action: string; control_state: string }>> {
    return this.mutation(`/imports/${encodeURIComponent(batchId)}/control`, 'POST', { generation, action });
  }

  compareImports(batchIds: string[]): Promise<ApiEnvelope<ImportBatch[]>> {
    const params = new URLSearchParams();
    for (const id of batchIds) params.append('batch_id', id);
    return this.request(`/imports/compare?${params.toString()}`);
  }

  library(query: LibraryQuery = {}): Promise<ApiEnvelope<LibraryResponse>> {
    const params = new URLSearchParams({
      limit: String(query.limit ?? 120),
      rejected: query.rejected ?? 'hide'
    });
    if (query.cursor) params.set('cursor', query.cursor);
    if (query.search) params.set('search', query.search);
    if (query.favourite !== undefined) params.set('favourite', String(query.favourite));
    if (query.ratingMin !== undefined) params.set('rating_min', String(query.ratingMin));
    if (query.ratingMax !== undefined) params.set('rating_max', String(query.ratingMax));
    if (query.randomSeed) params.set('random_seed', query.randomSeed);
    if (query.organizationKind) params.set('organization_kind', query.organizationKind);
    if (query.organizationKey) params.set('organization_key', query.organizationKey);
    if (query.stackProfileId) params.set('stack_profile_id', query.stackProfileId);
    for (const value of query.mediaKind ?? []) params.append('media_kind', value);
    for (const value of query.format ?? []) params.append('format', value);
    for (const value of query.camera ?? []) params.append('camera', value);
    for (const value of query.lens ?? []) params.append('lens', value);
    for (const value of query.folder ?? []) params.append('folder', value);
    for (const value of query.sort ?? ['capture_time:desc']) params.append('sort', value);
    return this.request(`/library?${params.toString()}`);
  }

  libraryDetail(entityId: string): Promise<ApiEnvelope<LibraryDetail>> {
    return this.request(`/library/entities/${encodeURIComponent(entityId)}`);
  }

  libraryFacets(facet: string, limit = 100, cursor?: string): Promise<ApiEnvelope<LibraryFacet[]>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return this.request(`/library/facets/${encodeURIComponent(facet)}?${params.toString()}`);
  }

  prepareLibrary(generation: number): Promise<ApiEnvelope<LibraryView>> {
    return this.mutation('/library/prepare', 'POST', { generation, refresh: true });
  }

  putLibraryState(
    states: Array<{
      entity_id: string;
      expected_revision: number;
      favourite: boolean;
      rejected: boolean;
      rating: number;
    }>,
    generation: number
  ): Promise<ApiEnvelope<{ states: Array<{ entity_id: string } & LibraryState>; media_mutation: 'none' }>> {
    return this.mutation('/library/state', 'PUT', { generation, states });
  }

  openLibraryFolder(entityId: string, generation: number): Promise<ApiEnvelope<{ entity_id: string; opened: boolean; path_source: string }>> {
    return this.mutation(`/library/entities/${encodeURIComponent(entityId)}/open-folder`, 'POST', { generation });
  }

  stackProfiles(limit = 100, cursor?: string): Promise<ApiEnvelope<StackProfile[]>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return this.request(`/stacks/profiles?${params.toString()}`);
  }

  stackStatus(profileId?: string): Promise<ApiEnvelope<StackProfile>> {
    const params = new URLSearchParams();
    if (profileId) params.set('profile_id', profileId);
    return this.request(`/stacks/status${params.size ? `?${params.toString()}` : ''}`);
  }

  createStackProfile(
    value: { name: string; settings: StackSettings; replaces_profile_id?: string },
    generation: number
  ): Promise<ApiEnvelope<StackProfile>> {
    return this.mutation('/stacks/profiles', 'POST', { generation, ...value });
  }

  stacks(profileId: string, limit = 120, cursor?: string): Promise<ApiEnvelope<StackPage>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return this.request(`/stacks/${encodeURIComponent(profileId)}?${params.toString()}`);
  }

  stackDetail(profileId: string, stackId: string): Promise<ApiEnvelope<StackDetail>> {
    return this.request(`/stacks/${encodeURIComponent(profileId)}/${encodeURIComponent(stackId)}`);
  }

  putStackCover(
    profileId: string,
    stackId: string,
    coverEntityId: string,
    revision: number,
    generation: number
  ): Promise<ApiEnvelope<{
    profile_id: string;
    stack_id: string;
    cover_entity_id: string;
    ranked_cover_entity_id: string;
    cover_override_entity_id: string | null;
    cover_explanation: string;
    revision: number;
    media_mutation: 'none';
  }>> {
    return this.mutation(
      `/stacks/${encodeURIComponent(profileId)}/${encodeURIComponent(stackId)}/cover`,
      'PUT',
      { generation, revision, cover_entity_id: coverEntityId }
    );
  }

  rejectStackRest(
    profileId: string,
    stackId: string,
    stackRevision: number,
    generation: number,
    options: { confirmFavourites?: boolean; confirmLargeSelection?: boolean } = {}
  ): Promise<ApiEnvelope<BulkAction & { profile_id: string; stack_id: string; preserved_cover_entity_id: string }>> {
    return this.mutation(
      `/stacks/${encodeURIComponent(profileId)}/${encodeURIComponent(stackId)}/reject-rest`,
      'POST',
      {
        generation,
        stack_revision: stackRevision,
        confirm: true,
        confirm_favourites: options.confirmFavourites ?? false,
        confirm_large_selection: options.confirmLargeSelection ?? false
      }
    );
  }

  junkProfiles(limit = 100, cursor?: string): Promise<ApiEnvelope<JunkProfile[]>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return this.request(`/junk/profiles?${params.toString()}`);
  }

  junkStatus(profileId?: string): Promise<ApiEnvelope<JunkProfile>> {
    const params = new URLSearchParams();
    if (profileId) params.set('profile_id', profileId);
    return this.request(`/junk/status${params.size ? `?${params.toString()}` : ''}`);
  }

  createJunkProfile(
    value: { name: string; settings: JunkSettings; replaces_profile_id?: string },
    generation: number
  ): Promise<ApiEnvelope<JunkProfile>> {
    return this.mutation('/junk/profiles', 'POST', { generation, ...value });
  }

  junkResults(
    profileId: string,
    options: { hiddenOnly?: boolean; limit?: number; cursor?: string } = {}
  ): Promise<ApiEnvelope<JunkPage>> {
    const params = new URLSearchParams({
      hidden_only: String(options.hiddenOnly ?? true),
      limit: String(options.limit ?? 120)
    });
    if (options.cursor) params.set('cursor', options.cursor);
    return this.request(`/junk/${encodeURIComponent(profileId)}?${params.toString()}`);
  }

  junkFeedback(
    profileId: string,
    entityId: string,
    feedbackKind: 'false_positive' | 'false_negative',
    generation: number,
    comment?: string
  ): Promise<ApiEnvelope<{
    feedback_id: number;
    profile_id: string;
    entity_id: string;
    feedback_kind: string;
    calibration_job_id: string | null;
    media_mutation: 'none';
  }>> {
    return this.mutation(`/junk/${encodeURIComponent(profileId)}/feedback`, 'POST', {
      generation,
      entity_id: entityId,
      feedback_kind: feedbackKind,
      comment
    });
  }

  bulkReject(
    entities: Array<{ entity_id: string; expected_revision: number }>,
    generation: number,
    options: { confirmFavourites?: boolean; confirmLargeSelection?: boolean } = {}
  ): Promise<ApiEnvelope<BulkAction>> {
    return this.mutation('/library/bulk-reject', 'POST', {
      generation,
      entities,
      confirm: true,
      confirm_favourites: options.confirmFavourites ?? false,
      confirm_large_selection: options.confirmLargeSelection ?? false
    });
  }

  undoBulkReject(actionId: string, generation: number): Promise<ApiEnvelope<BulkAction>> {
    return this.mutation('/library/bulk-reject/undo', 'POST', { generation, action_id: actionId });
  }

  organizationStatus(): Promise<ApiEnvelope<OrganizationStatus>> {
    return this.request('/organize/status');
  }

  prepareOrganization(generation: number, refresh = false): Promise<ApiEnvelope<LibraryView>> {
    return this.mutation('/organize/prepare', 'POST', { generation, refresh });
  }

  organizationCalendar(
    options: { limit?: number; cursor?: string; year?: number; month?: number } = {}
  ): Promise<ApiEnvelope<CalendarBucket[]>> {
    const params = new URLSearchParams({ limit: String(options.limit ?? 120) });
    if (options.cursor) params.set('cursor', options.cursor);
    if (options.year !== undefined) params.set('year', String(options.year));
    if (options.month !== undefined) params.set('month', String(options.month));
    return this.request(`/organize/calendar?${params.toString()}`);
  }

  organizationFolders(parentId?: string, limit = 120, cursor?: string): Promise<ApiEnvelope<FolderNode[]>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (parentId) params.set('parent_id', parentId);
    if (cursor) params.set('cursor', cursor);
    return this.request(`/organize/folders?${params.toString()}`);
  }

  organizationEquipment(
    kind: 'camera' | 'lens',
    limit = 120,
    cursor?: string
  ): Promise<ApiEnvelope<EquipmentBucket[]>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return this.request(`/organize/equipment/${kind}?${params.toString()}`);
  }

  organizationMap(
    viewport: { zoom: number; south: number; north: number; west: number; east: number },
    limit = 200,
    cursor?: string
  ): Promise<ApiEnvelope<MapClusters>> {
    const params = new URLSearchParams({
      zoom: String(viewport.zoom),
      south: String(viewport.south),
      north: String(viewport.north),
      west: String(viewport.west),
      east: String(viewport.east),
      limit: String(limit)
    });
    if (cursor) params.set('cursor', cursor);
    return this.request(`/organize/map?${params.toString()}`);
  }

  backfill(): Promise<ApiEnvelope<BackfillState>> {
    return this.request('/backfill');
  }

  controlBackfill(
    action: 'start' | 'pause' | 'resume',
    generation: number,
    restart = false
  ): Promise<ApiEnvelope<BackfillState>> {
    return this.mutation('/backfill/control', 'POST', { generation, action, restart });
  }

  createSavedView(
    value: { name: string; route: string; state: Record<string, unknown> },
    generation: number
  ): Promise<ApiEnvelope<SavedView>> {
    return this.request('/saved-views', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey()
      },
      body: JSON.stringify({ ...value, generation })
    });
  }

  private mutation<T>(path: string, method: 'POST' | 'PUT' | 'DELETE', body: Record<string, unknown>): Promise<ApiEnvelope<T>> {
    return this.request(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey()
      },
      body: JSON.stringify(body)
    });
  }

  job(id: string, signal?: AbortSignal): Promise<ApiEnvelope<JobState>> {
    return this.request(`/jobs/${encodeURIComponent(id)}`, { signal });
  }

  async pollJob(
    id: string,
    onUpdate: (value: ApiEnvelope<JobState>) => void,
    options: { intervalMs?: number; signal?: AbortSignal } = {}
  ): Promise<ApiEnvelope<JobState>> {
    const interval = options.intervalMs ?? 2_000;
    while (true) {
      const value = await this.job(id, options.signal);
      onUpdate(value);
      const status = value.data?.status;
      if (!status || ['completed', 'failed', 'cancelled'].includes(status)) return value;
      await new Promise<void>((resolve, reject) => {
        const abort = () => {
          globalThis.clearTimeout(timer);
          reject(new DOMException('Polling aborted', 'AbortError'));
        };
        const timer = globalThis.setTimeout(() => {
          options.signal?.removeEventListener('abort', abort);
          resolve();
        }, interval);
        options.signal?.addEventListener('abort', abort, { once: true });
      });
    }
  }
}

export const reviewApi = new ReviewApiClient();

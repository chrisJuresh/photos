"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const state = {
  activeView: "overview",
  live: null,
  overview: null,
  latestRuns: [],
  rateSamples: [],
  previousProgress: null,
  previousProgressAt: 0,
  pollTimer: null,
  lists: {
    assets: { items: [], cursor: null },
    sources: { items: [], cursor: null },
    duplicates: { items: [], cursor: null },
    relationships: { items: [], cursor: null },
    raw: { items: [], cursor: null },
    warnings: { items: [], cursor: null },
  },
  loaded: new Set(),
};

const viewMeta = {
  overview: ["Vault status", "Overview"],
  assets: ["Inventory", "Assets"],
  sources: ["Discovery", "Source paths"],
  duplicates: ["Deduplication", "Exact duplicates"],
  relationships: ["Analysis", "Relationships"],
  "raw-jpeg": ["Pairing", "RAW + JPEG"],
  warnings: ["Exceptions", "Warnings"],
  runs: ["Audit history", "Runs"],
  schema: ["Manifest", "Data contract"],
};

function esc(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[char]);
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? new Intl.NumberFormat().format(number) : "—";
}

function formatBytes(value, decimals = 1) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  if (number === 0) return "0 B";
  const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
  const index = Math.min(Math.floor(Math.log(Math.abs(number)) / Math.log(1024)), units.length - 1);
  return `${(number / (1024 ** index)).toFixed(index === 0 ? 0 : decimals)} ${units[index]}`;
}

function formatDuration(value) {
  if (value === null || value === undefined || value === "") return "—";
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return "—";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = Math.round(seconds % 60);
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}` : `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function formatDate(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return String(value);
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function relativeAge(value) {
  if (!value) return "no snapshot";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).valueOf()) / 1000));
  if (!Number.isFinite(seconds)) return "unknown age";
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s ago`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ago`;
}

function shortId(value, count = 12) {
  const text = String(value ?? "");
  return text.length > count ? `${text.slice(0, count)}…` : text || "—";
}

function titleCase(value) {
  return String(value ?? "unknown").replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function safeJson(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  try { return JSON.stringify(value); } catch { return String(value); }
}

function prettyJson(value) {
  if (value === null || value === undefined || value === "") return "No structured evidence recorded.";
  let normalized = value;
  if (typeof value === "string") {
    try { normalized = JSON.parse(value); } catch { return value; }
  }
  try { return JSON.stringify(normalized, null, 2); } catch { return String(normalized); }
}

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
}

function showError(message) {
  const banner = $("#global-error");
  banner.textContent = message;
  banner.hidden = false;
}

function clearError() {
  $("#global-error").hidden = true;
}

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.hidden = false;
  window.clearTimeout(element._hideTimer);
  element._hideTimer = window.setTimeout(() => { element.hidden = true; }, 3500);
}

async function api(path) {
  const response = await fetch(path, { headers: { Accept: "application/json" }, cache: "no-store" });
  let body;
  try { body = await response.json(); } catch { body = null; }
  if (!response.ok) throw new Error(body?.detail || `${response.status} ${response.statusText}`);
  return body;
}

function mediaGlyph(kind) {
  if (kind === "video") return ["video", "▶"];
  if (kind === "raw_image") return ["raw", "R"];
  return ["", "▧"];
}

function statusPill(status) {
  const normalized = String(status || "unknown").toLowerCase();
  return `<span class="status-pill ${esc(normalized)}">${esc(titleCase(normalized))}</span>`;
}

function confidencePill(label) {
  const normalized = String(label || "unknown").toLowerCase();
  return `<span class="confidence-pill ${esc(normalized)}">${esc(titleCase(normalized))}</span>`;
}

function sourceKindLabel(kind) {
  return kind === "raw_image" ? "RAW image" : titleCase(kind || "media");
}

function assetCell(item) {
  const [className, glyph] = mediaGlyph(item.media_kind);
  return `<div class="asset-cell"><span class="media-glyph ${className}">${glyph}</span><div><strong title="${esc(item.asset_id)}">${esc(shortId(item.asset_id, 15))}</strong><small>${esc(sourceKindLabel(item.media_kind))}</small></div></div>`;
}

function setConnection(mode, text) {
  const connection = $("#connection");
  connection.className = `connection ${mode ? `is-${mode}` : ""}`;
  $("span", connection).textContent = text;
}

function updateRate(progress) {
  if (!progress) return;
  const now = performance.now();
  const current = Number(progress.enumerated_files || 0);
  if (state.previousProgress && progress.run_id === state.previousProgress.run_id && current >= state.previousProgress.enumerated) {
    const seconds = (now - state.previousProgressAt) / 1000;
    if (seconds >= 1) {
      const rate = Math.max(0, (current - state.previousProgress.enumerated) / seconds);
      state.rateSamples.push({ at: Date.now(), rate });
      state.rateSamples = state.rateSamples.filter((sample) => sample.at > Date.now() - 15 * 60 * 1000).slice(-180);
    }
  } else if (state.previousProgress && progress.run_id !== state.previousProgress.run_id) {
    state.rateSamples = [];
  }
  state.previousProgress = { run_id: progress.run_id, enumerated: current };
  state.previousProgressAt = now;
  renderRateChart();
}

function renderRateChart() {
  const samples = state.rateSamples;
  if (!samples.length) {
    $("#rate-area").setAttribute("d", "M0,120 L900,120 Z");
    $("#rate-line").setAttribute("d", "M0,120 L900,120");
    setText("#rate-caption", "Collecting local samples…");
    return;
  }
  const max = Math.max(1, ...samples.map((sample) => sample.rate));
  const denominator = Math.max(1, samples.length - 1);
  const points = samples.map((sample, index) => {
    const x = (index / denominator) * 900;
    const y = 116 - (sample.rate / max) * 100;
    return [x, y];
  });
  const line = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  $("#rate-line").setAttribute("d", line);
  $("#rate-area").setAttribute("d", `${line} L900,120 L0,120 Z`);
  const latest = samples.at(-1).rate;
  setText("#rate-caption", `${latest.toFixed(1)} paths/s now · peak ${max.toFixed(1)}`);
  setText("#metric-rate", `${latest.toFixed(1)} paths/s observed`);
}

function renderLive(data) {
  state.live = data;
  const progress = data.progress;
  const copying = Boolean(progress && progress.copy_total_assets !== undefined);
  const activity = data.activity;
  const writerAlive = Boolean(data.writer?.alive);
  const ageSeconds = progress ? Math.max(0, (Date.now() - new Date(progress.updated_at).valueOf()) / 1000) : Infinity;
  const activityAgeSeconds = activity ? Math.max(0, (Date.now() - new Date(activity.updated_at).valueOf()) / 1000) : Infinity;
  const freshCheckpoint = ageSeconds < 180;
  const recentActivity = activityAgeSeconds < 300;
  const live = writerAlive && (freshCheckpoint || recentActivity);
  const stale = writerAlive && !live;
  const connectionText = freshCheckpoint ? "Scanner live" : recentActivity ? `Writer active · event ${relativeAge(activity.updated_at)}` : stale ? "Writer active · no recent checkpoint" : "Scanner stopped";
  setConnection(live ? "live" : stale ? "stale" : "", connectionText);
  setText("#snapshot-age", progress ? `Checkpoint ${relativeAge(progress.updated_at)}${activity ? ` · activity ${relativeAge(activity.updated_at)}` : ""}` : "No checkpoint");
  $("#scan-dot").className = `state-dot ${live ? "is-live" : stale ? "is-stale" : ""}`;
  $(".scan-track").className = `scan-track ${copying ? "is-copying" : live ? "is-running" : ""}`;
  $("#stage-badge").className = `stage-badge ${live ? "is-live" : ""}`;
  setText("#stage-badge", progress ? titleCase(progress.stage) : writerAlive ? "Starting" : "Stopped");
  setText("#scan-subtitle", progress
    ? `${progress.source || "Source"} · count checkpoint ${relativeAge(progress.updated_at)}${activity ? ` · log activity ${relativeAge(activity.updated_at)}` : ""}${stale ? " · inspect writer activity" : ""}`
    : writerAlive ? "Writer detected; waiting for its first lightweight checkpoint." : "No active writer was detected. Saved results remain available below.");
  setText("#hero-copy", live
    ? "Watching the immutable source scan and building an auditable record of every discoverable media file."
    : "Explore the durable manifest already collected. The dashboard never changes source media or vault records.");
  setText("#metric-paths", progress ? formatNumber(progress.enumerated_files) : "—");
  setText("#metric-reused", progress ? formatNumber(progress.unchanged_files) : "—");
  setText("#metric-changed", progress ? formatNumber(progress.changed_or_new_files) : "—");
  setText("#metric-media", progress ? formatNumber(progress.media_files) : "—");
  setText("#metric-bytes", progress ? formatBytes(progress.bytes_hashed) : "—");
  setText("#metric-warnings", progress ? formatNumber(progress.warnings) : "—");
  setText("#metric-errors", progress ? `${formatNumber(progress.errors)} errors` : "— errors");
  if (progress && live && !copying) updateRate(progress); else renderRateChart();

  if (copying) {
    const processedAssets = Number(progress.copy_assets_processed || 0);
    const totalAssets = Number(progress.copy_total_assets || 0);
    const processedBytes = Number(progress.copy_bytes_processed || 0);
    const verifiedBytes = Number(progress.copy_bytes_verified || 0);
    const totalBytes = Number(progress.copy_total_bytes || 0);
    const ratio = totalBytes ? Math.min(1, processedBytes / totalBytes) : 1;
    setText("#live-heading", "Verified object copy");
    setText("#hero-copy", "Copying distinct media into the content-addressed vault with full-hash and byte-for-byte verification.");
    setText("#scan-subtitle", `${progress.source || "Immutable source"} · durable copy checkpoint ${relativeAge(progress.updated_at)}`);
    $("#scan-track-fill").style.width = `${(ratio * 100).toFixed(3)}%`;
    $("#scan-track-fill").style.transform = "none";
    $(".live-metrics > div:nth-child(1) > span").textContent = "Objects processed";
    setText("#metric-paths", `${formatNumber(processedAssets)} / ${formatNumber(totalAssets)}`);
    setText("#metric-rate", `${(ratio * 100).toFixed(2)}% of bytes attempted`);
    $(".live-metrics > div:nth-child(2) > span").textContent = "Objects verified";
    setText("#metric-reused", formatNumber(progress.copy_assets_verified || 0));
    $(".live-metrics > div:nth-child(2) > small").textContent = "full hashes + byte comparison";
    $(".live-metrics > div:nth-child(3) > span").textContent = "Newly copied";
    setText("#metric-changed", formatNumber(progress.copied || 0));
    $(".live-metrics > div:nth-child(3) > small").textContent = `${formatNumber(progress.existing_verified || 0)} already verified`;
    $(".live-metrics > div:nth-child(4) > span").textContent = "Verified bytes";
    setText("#metric-media", formatBytes(verifiedBytes));
    setText("#metric-bytes", `${formatBytes(totalBytes)} planned`);
    $(".live-metrics > div:nth-child(5) > span").textContent = "Sidecar warnings";
    setText("#metric-warnings", formatNumber(progress.sidecar_errors || 0));
    setText("#metric-errors", `${formatNumber(progress.errors || 0)} copy errors`);
    setText("#rate-caption", "Copy checkpoints are published at most every 10 seconds");
  } else {
    $("#scan-track-fill").style.width = "26%";
    $("#scan-track-fill").style.transform = "translateX(-105%)";
  }

  const storage = data.storage || {};
  const total = Number(storage.total || 0);
  const used = Number(storage.used || 0);
  const free = Number(storage.free || 0);
  const usedRatio = total ? used / total : 0;
  setText("#storage-free", formatBytes(free));
  setText("#storage-total", formatBytes(total));
  setText("#storage-used", formatBytes(used));
  setText("#storage-percent", total ? `${(usedRatio * 100).toFixed(1)}% used` : "—");
  $("#storage-visual").style.setProperty("--storage-angle", `${usedRatio * 360}deg`);
  renderPipeline();
}

function renderPipeline() {
  const writer = state.live?.writer;
  const runs = state.latestRuns;
  const done = new Set(runs.filter((run) => run.status === "completed").map((run) => run.command));
  const active = writer?.alive ? writer.command : null;
  const steps = {
    discover: done.has("preflight") || done.has("import") ? "done" : ["preflight", "import"].includes(active) ? "active" : "pending",
    capacity: done.has("preflight") || done.has("import") ? "done" : "pending",
    copy: done.has("import") ? "done" : active === "import" ? "active" : "pending",
    relate: done.has("analyze") ? "done" : active === "analyze" ? "active" : "pending",
    validate: done.has("validate") && done.has("export") ? "done" : ["validate", "export"].includes(active) ? "active" : "pending",
  };
  for (const [key, value] of Object.entries(steps)) {
    const item = $(`[data-step="${key}"]`);
    item.classList.toggle("is-active", value === "active");
    item.classList.toggle("is-done", value === "done");
    $("em", item).textContent = value === "done" ? "Complete" : value === "active" ? "Active" : "Pending";
  }
}

function renderOverview(data) {
  state.overview = data;
  if (data.deferred) {
    setText("#inventory-note", `${data.reason}. Loading it is optional and may briefly compete for HDD/database time.`);
    $("#load-aggregates").hidden = false;
    return;
  }
  $("#load-aggregates").hidden = true;
  const incomplete = Number(data.incomplete_relationships || 0);
  setText("#inventory-note", `Manifest snapshot loaded at ${new Date().toLocaleTimeString()}. Counts can grow during an active scan.${incomplete ? ` ${formatNumber(incomplete)} relationship candidates belong to interrupted/incomplete runs and are excluded from the authoritative count.` : ""}`);
  setText("#inventory-assets", formatNumber(data.assets?.count));
  setText("#inventory-bytes", formatBytes(data.assets?.bytes));
  setText("#known-bytes", formatBytes(data.assets?.bytes));
  setText("#inventory-duplicates", formatNumber(data.duplicate_source_copies));
  const relationships = (data.relationships || []).reduce((sum, row) => sum + Number(row.count || 0), 0);
  setText("#inventory-relations", formatNumber(relationships));
  setText("#inventory-raw", formatNumber(data.raw_jpeg_groups));

  const kinds = data.kinds || [];
  const maxKind = Math.max(1, ...kinds.map((row) => Number(row.bytes || 0)));
  $("#kind-bars").innerHTML = kinds.length ? kinds.map((row) => `<div class="bar-item"><span>${esc(titleCase(row.label))}</span><span class="mini-bar"><i style="width:${Math.max(2, Number(row.bytes || 0) / maxKind * 100).toFixed(1)}%"></i></span><strong>${esc(formatNumber(row.count))}</strong></div>`).join("") : '<p class="empty-inline">No assets are committed yet.</p>';
  const formats = data.formats || [];
  $("#format-cloud").innerHTML = formats.length ? formats.map((row) => `<span class="format-chip">${esc(row.label)}<strong>${esc(formatNumber(row.count))}</strong></span>`).join("") : '<p class="empty-inline">No format evidence is committed yet.</p>';
}

async function loadOverview(heavy = false) {
  try {
    const data = await api(`/api/overview${heavy ? "?allow_heavy=true" : ""}`);
    renderOverview(data);
  } catch (error) {
    showError(`Could not load inventory overview: ${error.message}`);
  }
}

function queryFromForm(form) {
  const query = new URLSearchParams();
  for (const [key, value] of new FormData(form).entries()) if (String(value).trim()) query.set(key, String(value).trim());
  return query;
}

async function loadAssets(reset = false) {
  const list = state.lists.assets;
  if (reset) Object.assign(list, { items: [], cursor: null });
  const query = queryFromForm($("#asset-filters"));
  query.set("limit", "50");
  if (list.cursor) query.set("cursor", list.cursor);
  const data = await api(`/api/assets?${query}`);
  list.items.push(...data.items);
  list.cursor = data.next_cursor;
  renderAssets();
}

function renderAssets() {
  const list = state.lists.assets;
  $("#assets-body").innerHTML = list.items.map((item) => `<tr class="is-clickable" tabindex="0" data-asset-id="${esc(item.asset_id)}"><td>${assetCell(item)}</td><td>${esc(sourceKindLabel(item.media_kind))}</td><td>${esc(item.detected_format || item.mime_type || "Unknown")}</td><td>${esc(formatBytes(item.size_bytes))}</td><td>${esc(item.capture_time_text || "Unknown")}</td><td>${item.width ? `${esc(formatNumber(item.width))} × ${esc(formatNumber(item.height))}` : item.duration_seconds ? esc(formatDuration(item.duration_seconds)) : "—"}</td><td>${statusPill(item.object_status)}</td></tr>`).join("");
  $("#assets-empty").hidden = list.items.length > 0;
  $("#assets-more").hidden = !list.cursor;
  setText("#assets-count", `${formatNumber(list.items.length)} loaded${list.cursor ? " · more available" : ""}`);
  bindAssetRows($("#assets-body"));
}

async function loadSources(reset = false) {
  const list = state.lists.sources;
  if (reset) Object.assign(list, { items: [], cursor: null });
  const query = queryFromForm($("#source-filters"));
  query.set("limit", "50");
  if (list.cursor) query.set("cursor", list.cursor);
  const data = await api(`/api/sources?${query}`);
  list.items.push(...data.items);
  list.cursor = data.next_cursor;
  renderSources();
}

function renderSources() {
  const list = state.lists.sources;
  $("#sources-body").innerHTML = list.items.map((item) => `<tr><td><div class="source-path-cell"><strong title="${esc(item.path_text)}">${esc(item.path_text)}</strong><small title="${esc(item.source_file_id)}">${esc(shortId(item.source_file_id, 18))}</small></div></td><td>${esc(titleCase(item.discovery_status))}</td><td>${esc(item.media_kind ? sourceKindLabel(item.media_kind) : "Non-media / unknown")}</td><td>${esc(formatBytes(item.size_bytes))}</td><td>${statusPill(item.present ? "present" : "historical")}</td><td>${item.asset_id ? `<button class="link-button" type="button" data-asset-id="${esc(item.asset_id)}">${esc(shortId(item.asset_id, 14))}</button>` : "—"}</td><td>${esc(formatDate(item.last_seen_at))}</td></tr>`).join("");
  $("#sources-empty").hidden = list.items.length > 0;
  $("#sources-more").hidden = !list.cursor;
  setText("#sources-count", `${formatNumber(list.items.length)} paths loaded${list.cursor ? " · more available" : ""}`);
  bindAssetRows($("#sources-body"));
}

async function loadDuplicates(reset = false) {
  const list = state.lists.duplicates;
  if (reset) Object.assign(list, { items: [], cursor: null });
  const query = new URLSearchParams({ limit: "50" });
  if (list.cursor) query.set("cursor", list.cursor);
  const data = await api(`/api/duplicates?${query}`);
  list.items.push(...data.items); list.cursor = data.next_cursor;
  $("#duplicates-body").innerHTML = list.items.map((item) => `<tr class="is-clickable" tabindex="0" data-asset-id="${esc(item.asset_id)}"><td>${assetCell(item)}</td><td><strong>${esc(formatNumber(item.source_count))}</strong></td><td>${esc(item.detected_format || "Unknown")}</td><td>${esc(formatBytes(item.size_bytes))}</td><td>${esc(formatBytes(Number(item.size_bytes) * Math.max(0, Number(item.source_count) - 1)))}</td><td>${statusPill(item.object_status)}</td></tr>`).join("");
  $("#duplicates-empty").hidden = list.items.length > 0;
  $("#duplicates-more").hidden = !list.cursor;
  setText("#duplicates-count", `${formatNumber(list.items.length)} groups loaded${list.cursor ? " · more available" : ""}`);
  bindAssetRows($("#duplicates-body"));
}

async function loadRelationships(reset = false) {
  const list = state.lists.relationships;
  if (reset) Object.assign(list, { items: [], cursor: null });
  const query = queryFromForm($("#relationship-filters")); query.set("limit", "50");
  if (list.cursor) query.set("cursor", list.cursor);
  const data = await api(`/api/relationships?${query}`);
  list.items.push(...data.items); list.cursor = data.next_cursor;
  $("#relationships-list").innerHTML = list.items.map((item) => `<article class="relationship-row"><div class="relationship-node" tabindex="0" role="button" data-asset-id="${esc(item.left_asset_id)}"><strong>${esc(shortId(item.left_asset_id, 18))}</strong><small>${esc(item.left_format || sourceKindLabel(item.left_kind))}</small></div><div class="relationship-connector"><span class="type-pill">${esc(titleCase(item.relationship_type))}</span></div><div class="relationship-node" tabindex="0" role="button" data-asset-id="${esc(item.right_asset_id)}"><strong>${esc(shortId(item.right_asset_id, 18))}</strong><small>${esc(item.right_format || sourceKindLabel(item.right_kind))}</small></div><div class="relationship-evidence">${confidencePill(item.confidence_label)}<small>${esc(item.method)} · score ${esc(Number(item.confidence_score).toFixed(3))}</small><details class="evidence-details"><summary>Evidence</summary><pre>${esc(prettyJson(item.evidence_json))}</pre></details></div></article>`).join("");
  $$(".relationship-evidence", $("#relationships-list")).forEach((node, index) => {
    const item = list.items[index];
    if (item && !item.authoritative) node.insertAdjacentHTML("afterbegin", `<span class="status-pill historical">${esc(titleCase(item.origin_run_status))} run · non-authoritative</span>`);
  });
  $("#relationships-empty").hidden = list.items.length > 0;
  $("#relationships-more").hidden = !list.cursor;
  setText("#relationships-count", `${formatNumber(list.items.length)} relationships loaded${list.cursor ? " · more available" : ""}`);
  bindAssetRows($("#relationships-list"));
}

async function loadRawGroups(reset = false) {
  const list = state.lists.raw;
  if (reset) Object.assign(list, { items: [], cursor: null });
  const query = new URLSearchParams({ limit: "50" }); if (list.cursor) query.set("cursor", list.cursor);
  const data = await api(`/api/raw-jpeg-groups?${query}`);
  list.items.push(...data.items); list.cursor = data.next_cursor;
  $("#raw-groups").innerHTML = list.items.map((item) => `<article class="group-card"><header><h3 title="${esc(item.raw_jpeg_group_id)}">${esc(shortId(item.raw_jpeg_group_id, 21))}</h3>${confidencePill(item.confidence_label)}</header><p>Anchored to RAW asset <button class="link-button" type="button" data-asset-id="${esc(item.anchor_raw_asset_id)}">${esc(shortId(item.anchor_raw_asset_id, 15))}</button></p><div class="group-meta"><div><span>Members</span><strong>${esc(formatNumber(item.member_count))}</strong></div><div><span>Ambiguous</span><strong>${esc(formatNumber(item.ambiguous_members))}</strong></div><div><span>Score</span><strong>${esc(Number(item.confidence_score).toFixed(3))}</strong></div></div><details class="evidence-details"><summary>Group evidence</summary><pre>${esc(prettyJson(item.evidence_json))}</pre></details><button class="secondary-button group-detail-button" type="button" data-group-id="${esc(item.raw_jpeg_group_id)}">View all members</button></article>`).join("");
  $$(".group-card header", $("#raw-groups")).forEach((node, index) => {
    const item = list.items[index];
    if (item && !item.authoritative) node.insertAdjacentHTML("beforeend", `<span class="status-pill historical">${esc(titleCase(item.origin_run_status))} run · non-authoritative</span>`);
  });
  $("#raw-empty").hidden = list.items.length > 0;
  $("#raw-more").hidden = !list.cursor;
  setText("#raw-count", `${formatNumber(list.items.length)} groups loaded${list.cursor ? " · more available" : ""}`);
  bindAssetRows($("#raw-groups"));
  $$('[data-group-id]', $("#raw-groups")).forEach((button) => button.addEventListener("click", () => openRawGroup(button.dataset.groupId)));
}

async function loadWarnings(reset = false) {
  const list = state.lists.warnings;
  if (reset) Object.assign(list, { items: [], cursor: null });
  const query = queryFromForm($("#warning-filters")); query.set("limit", "50");
  if (list.cursor) query.set("cursor", list.cursor);
  const data = await api(`/api/warnings?${query}`);
  list.items.push(...data.items); list.cursor = data.next_cursor;
  $("#warnings-list").innerHTML = list.items.map((item) => `<article class="warning-row"><div>${statusPill(item.severity)}</div><div class="warning-code">${esc(item.code)}</div><div class="warning-message"><strong>${esc(item.message)}</strong><small>${esc(item.path_text || (item.asset_id ? `Asset ${item.asset_id}` : `Run ${item.run_id}`))}</small><details class="evidence-details"><summary>Evidence</summary><pre>${esc(prettyJson(item.evidence_json))}</pre></details></div><time class="warning-time">${esc(formatDate(item.created_at))}</time></article>`).join("");
  $("#warnings-empty").hidden = list.items.length > 0;
  $("#warnings-more").hidden = !list.cursor;
  setText("#warnings-count", `${formatNumber(list.items.length)} warnings loaded${list.cursor ? " · more available" : ""}`);
}

async function loadRuns() {
  const data = await api("/api/runs?limit=50");
  state.latestRuns = data.items;
  $("#runs-list").innerHTML = data.items.map((run) => {
    const summary = run.summary_json ? safeJson(run.summary_json) : run.status === "running" ? "In progress; durable checkpoints are committed throughout the run." : "No summary recorded.";
    return `<article class="run-card is-${esc(run.status)}"><span class="run-marker" aria-hidden="true"></span><div><strong>${esc(titleCase(run.command))}</strong><small class="run-id" title="${esc(run.run_id)}">${esc(run.run_id)}</small></div><div><strong>${esc(formatDate(run.started_at))}</strong><small>${run.completed_at ? `Ended ${esc(formatDate(run.completed_at))}` : "In progress"}</small></div>${statusPill(run.status)}<details class="run-json evidence-details"><summary>Run parameters and outcome</summary><div class="run-json-grid"><div><h3>Arguments</h3><pre>${esc(prettyJson(run.arguments_json))}</pre></div><div><h3>Summary</h3><pre>${esc(prettyJson(run.summary_json))}</pre></div></div></details></article>`;
  }).join("");
  $("#runs-empty").hidden = data.items.length > 0;
  renderPipeline();
}

async function loadSchema() {
  const data = await api("/api/schema");
  setText("#schema-version", `v${data.schema_version ?? "—"}`);
  setText("#schema-db", data.authoritative_store);
  setText("#schema-jsonl", data.portable_export);
  setText("#schema-records", data.asset_records);
  $("#schema-tables").innerHTML = data.tables.map((table) => `<span class="table-chip">${esc(table)}</span>`).join("");
}

function bindAssetRows(root) {
  $$('[data-asset-id]', root).forEach((element) => {
    const activate = () => openAsset(element.dataset.assetId);
    element.addEventListener("click", activate);
    element.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
  });
}

function detailItem(label, value, options = {}) {
  return `<div class="${options.full ? "full" : ""}"><dt>${esc(label)}</dt><dd class="${options.mono ? "mono" : ""}">${esc(value ?? "—")}</dd></div>`;
}

async function openAsset(assetId) {
  const dialog = $("#asset-dialog");
  $("#asset-detail").innerHTML = '<div class="loading-state"><span></span>Loading evidence…</div>';
  dialog.showModal();
  try {
    const data = await api(`/api/assets/${encodeURIComponent(assetId)}`);
    const asset = data.asset;
    setText("#asset-dialog-title", shortId(asset.asset_id, 28));
    const sources = data.sources || [];
    const destinations = data.destinations || [];
    const relationships = data.relationships || [];
    const rawGroups = data.raw_jpeg_groups || [];
    $("#asset-detail").innerHTML = `<div class="asset-detail-grid"><div><div class="preview-pane"><div class="loading-state"><span></span>Generating safe preview…</div><img alt="Preview for asset ${esc(shortId(asset.asset_id))}" hidden></div><p class="preview-note">Preview is generated on demand in the UI cache outside both the immutable source and the vault.</p></div><div class="detail-stack"><section class="detail-section"><h3>Identity</h3><dl class="detail-dl">${detailItem("Asset ID", asset.asset_id, { full: true, mono: true })}${detailItem("Exact group", asset.exact_group_id, { full: true, mono: true })}${detailItem("Size", formatBytes(asset.size_bytes))}${detailItem("Media", sourceKindLabel(asset.media_kind))}${detailItem("SHA-256", asset.sha256, { full: true, mono: true })}${detailItem("BLAKE3", asset.blake3, { full: true, mono: true })}${detailItem("SHA-512", asset.sha512, { full: true, mono: true })}${detailItem("Verification", data.exact_group?.verification_method || "—", { full: true })}</dl></section><section class="detail-section"><h3>Media evidence</h3><dl class="detail-dl">${detailItem("Format", asset.detected_format || asset.mime_type)}${detailItem("Dimensions", asset.width ? `${formatNumber(asset.width)} × ${formatNumber(asset.height)}` : "—")}${detailItem("Duration", formatDuration(asset.duration_seconds))}${detailItem("Orientation", asset.orientation_text)}${detailItem("Camera", [asset.camera_make, asset.camera_model].filter(Boolean).join(" ") || "—")}${detailItem("Lens", asset.lens_model)}${detailItem("Captured", asset.capture_time_text, { full: true })}${detailItem("Capture evidence", asset.capture_time_source, { full: true })}</dl><details class="evidence-details"><summary>Complete extracted metadata</summary><pre>${esc(prettyJson(asset.metadata_json))}</pre></details><details class="evidence-details"><summary>Hash algorithm versions</summary><pre>${esc(prettyJson(asset.hash_algorithm_versions_json))}</pre></details></section><section class="detail-section"><h3>Source history · ${esc(formatNumber(sources.length))}</h3><div class="source-list">${sources.length ? sources.map((source) => `<div class="source-record"><strong>${esc(source.path_text)}</strong><small>${source.present ? "Present" : "Historical"} · ${esc(source.exact_verification_method)} · seen ${esc(formatDate(source.observed_at))}</small><details class="evidence-details"><summary>Version evidence</summary><pre>${esc(prettyJson({discovery_basis: source.discovery_basis, extension_mismatch: source.extension_mismatch, hash_status: source.hash_status, metadata_status: source.metadata_status, normalized_metadata: source.normalized_metadata_json, warnings: source.warnings_json, error: source.error_text}))}</pre></details></div>`).join("") : '<p class="empty-inline">No source records.</p>'}</div></section><section class="detail-section"><h3>Destination + relationships</h3><dl class="detail-dl">${detailItem("Copy status", asset.object_status)}${detailItem("Verified", asset.object_verified_at ? formatDate(asset.object_verified_at) : "Not yet")}${detailItem("Destination records", formatNumber(destinations.length))}${detailItem("Related assets", formatNumber(relationships.length))}${detailItem("RAW/JPEG groups", formatNumber(rawGroups.length))}${detailItem("Warnings", formatNumber((data.warnings || []).length))}${detailItem("Object path", asset.object_relpath, { full: true, mono: true })}</dl></section></div></div>`;
    const image = $(".preview-pane img", $("#asset-detail"));
    const loading = $(".preview-pane .loading-state", $("#asset-detail"));
    image.addEventListener("load", () => { loading.remove(); image.hidden = false; });
    image.addEventListener("error", () => { loading.className = "preview-fallback"; loading.innerHTML = "Preview unavailable for this format or current source state.<br>The asset record is still preserved."; image.remove(); });
    image.src = data.preview_url;
  } catch (error) {
    $("#asset-detail").innerHTML = `<div class="empty-state"><span>!</span><h3>Could not load asset</h3><p>${esc(error.message)}</p></div>`;
  }
}

async function openRawGroup(groupId) {
  const dialog = $("#group-dialog");
  $("#group-detail").innerHTML = '<div class="loading-state"><span></span>Loading group evidence…</div>';
  dialog.showModal();
  try {
    const data = await api(`/api/raw-jpeg-groups/${encodeURIComponent(groupId)}`);
    setText("#group-dialog-title", shortId(data.group.raw_jpeg_group_id, 30));
    $("#group-detail").innerHTML = `<section class="detail-section"><div class="group-detail-head"><div>${confidencePill(data.group.confidence_label)}<strong> Score ${esc(Number(data.group.confidence_score).toFixed(3))}</strong></div><small>Created ${esc(formatDate(data.group.created_at))}</small></div><details class="evidence-details" open><summary>Group evidence</summary><pre>${esc(prettyJson(data.group.evidence_json))}</pre></details></section><section class="detail-section"><h3>Every member · ${esc(formatNumber(data.members.length))}</h3><div class="member-list">${data.members.map((member) => `<article><span class="media-glyph ${esc(mediaGlyph(member.media_kind)[0])}">${esc(mediaGlyph(member.media_kind)[1])}</span><div><strong>${esc(member.role === "raw_anchor" ? "RAW anchor" : titleCase(member.role))}</strong><button class="link-button member-asset-button" type="button" data-member-asset="${esc(member.asset_id)}">${esc(member.asset_id)}</button><small>${esc(member.detected_format || sourceKindLabel(member.media_kind))} · ${esc(formatBytes(member.size_bytes))} · ${esc(member.capture_time_text || "unknown capture time")}</small></div><div>${confidencePill(member.confidence_label)}${member.ambiguous ? '<span class="status-pill historical">Ambiguous</span>' : ""}</div><details class="evidence-details"><summary>Member evidence</summary><pre>${esc(prettyJson({evidence: member.evidence_json, alternative_group_ids: member.alternative_group_ids_json}))}</pre></details></article>`).join("")}</div></section>`;
    $$('[data-member-asset]', $("#group-detail")).forEach((button) => button.addEventListener("click", () => { dialog.close(); openAsset(button.dataset.memberAsset); }));
  } catch (error) {
    $("#group-detail").innerHTML = `<div class="empty-state"><span>!</span><h3>Could not load group</h3><p>${esc(error.message)}</p></div>`;
  }
}

async function ensureViewLoaded(view, force = false) {
  if (!force && state.loaded.has(view)) return;
  try {
    if (view === "assets") await loadAssets(true);
    if (view === "sources") await loadSources(true);
    if (view === "duplicates") await loadDuplicates(true);
    if (view === "relationships") await loadRelationships(true);
    if (view === "raw-jpeg") await loadRawGroups(true);
    if (view === "warnings") await loadWarnings(true);
    if (view === "runs") await loadRuns();
    if (view === "schema") await loadSchema();
    state.loaded.add(view);
  } catch (error) {
    showError(`Could not load ${viewMeta[view]?.[1] || view}: ${error.message}`);
  }
}

function navigate(view) {
  if (!viewMeta[view]) view = "overview";
  state.activeView = view;
  $$("[data-view-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.viewPanel === view));
  $$("[data-view]").forEach((button) => button.classList.toggle("is-active", button.dataset.view === view));
  setText("#page-eyebrow", viewMeta[view][0]); setText("#page-title", viewMeta[view][1]);
  history.replaceState(null, "", view === "overview" ? location.pathname : `#${view}`);
  closeMenu(); clearError(); ensureViewLoaded(view);
  $("#main").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMenu() {
  $("#sidebar").classList.remove("is-open");
  $("#menu-button").setAttribute("aria-expanded", "false");
  $("#mobile-scrim").hidden = true;
}

async function pollLive() {
  window.clearTimeout(state.pollTimer);
  try {
    const data = await api("/api/live");
    renderLive(data); clearError();
  } catch (error) {
    setConnection("error", "Dashboard disconnected");
    showError(`Live status is unavailable: ${error.message}`);
  } finally {
    state.pollTimer = window.setTimeout(pollLive, document.hidden ? 30000 : 5000);
  }
}

function bindEvents() {
  $("#nav-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]"); if (button) navigate(button.dataset.view);
  });
  $("#menu-button").addEventListener("click", () => { const open = !$("#sidebar").classList.contains("is-open"); $("#sidebar").classList.toggle("is-open", open); $("#menu-button").setAttribute("aria-expanded", String(open)); $("#mobile-scrim").hidden = !open; });
  $("#mobile-scrim").addEventListener("click", closeMenu);
  $("#refresh-button").addEventListener("click", async () => { await pollLive(); await ensureViewLoaded(state.activeView, true); toast("Dashboard refreshed"); });
  $("#load-aggregates").addEventListener("click", async () => { const button = $("#load-aggregates"); button.disabled = true; button.textContent = "Loading…"; await loadOverview(true); button.disabled = false; button.textContent = "Load snapshot"; });
  $("#asset-filters").addEventListener("submit", async (event) => { event.preventDefault(); await loadAssets(true); });
  $("#source-filters").addEventListener("submit", async (event) => { event.preventDefault(); await loadSources(true); });
  $("#relationship-filters").addEventListener("submit", async (event) => { event.preventDefault(); await loadRelationships(true); });
  $("#warning-filters").addEventListener("submit", async (event) => { event.preventDefault(); await loadWarnings(true); });
  $("#assets-more").addEventListener("click", () => loadAssets());
  $("#sources-more").addEventListener("click", () => loadSources());
  $("#duplicates-more").addEventListener("click", () => loadDuplicates());
  $("#relationships-more").addEventListener("click", () => loadRelationships());
  $("#raw-more").addEventListener("click", () => loadRawGroups());
  $("#warnings-more").addEventListener("click", () => loadWarnings());
  $("#dialog-close").addEventListener("click", () => $("#asset-dialog").close());
  $("#asset-dialog").addEventListener("click", (event) => { if (event.target === $("#asset-dialog")) $("#asset-dialog").close(); });
  $("#group-dialog-close").addEventListener("click", () => $("#group-dialog").close());
  $("#group-dialog").addEventListener("click", (event) => { if (event.target === $("#group-dialog")) $("#group-dialog").close(); });
  $("#theme-button").addEventListener("click", () => { const current = document.documentElement.dataset.theme; const next = current === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = next; localStorage.setItem("vault-theme", next); });
  document.addEventListener("visibilitychange", () => { window.clearTimeout(state.pollTimer); pollLive(); });
}

async function initialize() {
  const savedTheme = localStorage.getItem("vault-theme");
  if (savedTheme === "dark" || savedTheme === "light") document.documentElement.dataset.theme = savedTheme;
  bindEvents();
  const initialView = location.hash.slice(1) || "overview";
  navigate(initialView);
  const results = await Promise.allSettled([pollLive(), loadOverview(), loadRuns(), loadSchema()]);
  results.filter((result) => result.status === "rejected").forEach((result) => showError(result.reason?.message || "Dashboard initialization failed"));
}

initialize();

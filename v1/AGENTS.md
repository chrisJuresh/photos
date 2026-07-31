# Repository safety rules

- Treat source media and canonical vault objects as permanently immutable. Never modify, move, rename, overwrite, or delete them.
- Reject, favourite, rate, exclude, group, and similar actions by changing application metadata only. Never translate those actions into destructive media operations.
- Never take, generate, save, compare, or inspect screenshots. Do not use screenshot-based tests, browser video, or traces that capture screenshots.
- Never decode, hash, copy, inspect, analyse, rank, group, or generate media in frontend code or during an HTTP request. HTTP handlers may serve existing derivatives, query persisted data, update application metadata, or enqueue background jobs only.
- Preprocess and persist metadata, derivatives, similarity and quality measurements, grouping results, junk signals, rollups, and map clusters before the frontend requests them.
- Keep the new review interface completely separate from the existing read-only dashboard, and preserve all existing CLI behavior, safety checks, recovery guarantees, and tests.
- Keep generated derivatives clearly separate from original/canonical media. Derivatives may be rebuilt; originals and canonical objects may not.
- Use isolated synthetic test corpora outside the real source and vault. Verify source and canonical-object hashes and filesystem metadata around any operation that could affect them.
- Refuse schema migration or other exclusive maintenance while a live vault writer is active. Test migrations on a copied database before applying them to the live vault.

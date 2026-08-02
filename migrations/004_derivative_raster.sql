-- The regression check Phase 2a needs cannot be a DB-only assertion against
-- what v1 recorded. `derivatives.source_width/height` holds the size *after*
-- v1's `exif_transpose` call -- which for `.arw` was a silent no-op -- so it is
-- consistent with both a correctly rotated derivative and a wrongly rotated
-- one, in 103,207 of 103,207 rows. No column anywhere holds the raster that is
-- actually on disk.
--
-- These three are that column, measured rather than inherited. `deriv_w` and
-- `deriv_h` are the 1536px derivative's real pixel dimensions as read from the
-- file *before* this build rotated anything, and `deriv_rot` is the rotation
-- this build then applied, in degrees counter-clockwise. Together they let the
-- assertion be stated over persisted evidence: applied rotation equals what the
-- container's orientation demanded, and the published shape agrees with the
-- orientation-corrected metadata.
--
-- NULL `deriv_rot` means no pass has looked at this row yet, which is also what
-- makes the ARW repair restartable: the derivative and the thumbnail are both
-- written before it is set, so a kill in between simply redoes them.
ALTER TABLE main.file ADD COLUMN deriv_w   INTEGER;  -- stored raster, pre-rotation
ALTER TABLE main.file ADD COLUMN deriv_h   INTEGER;
ALTER TABLE main.file ADD COLUMN deriv_rot INTEGER;  -- degrees CCW applied here: 0/90/180/270

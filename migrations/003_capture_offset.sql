-- `taken_at` is authoritative LOCAL time. This is the offset that pins it to a
-- UTC instant, and it is NULLABLE on purpose.
--
-- v1 had a DateTimeOriginal for 38,767 assets and published 6,451 dates, because
-- DateTimeOriginal carries no timezone and v1 would not accept a local time it
-- could not pin. Requiring the offset is what produced that outcome. Here the
-- offset is extra precision when a camera recorded one (OffsetTimeOriginal is
-- present for 3,574 of 146,034) and absent otherwise, and absence never
-- downgrades or discards the timestamp beside it.
ALTER TABLE main.file ADD COLUMN taken_offset TEXT;   -- '+01:00', 'Z' normalised, or NULL

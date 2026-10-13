-- Apply once to a database created from an earlier XWADDA schema.
ALTER TABLE deals
  ADD COLUMN fee_minor BIGINT UNSIGNED NOT NULL DEFAULT 0 AFTER amount_minor;

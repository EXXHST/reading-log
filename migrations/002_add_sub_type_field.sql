-- Rename kind to type
ALTER TABLE books RENAME COLUMN kind TO type;

-- Rename genre to sub_type
ALTER TABLE books RENAME COLUMN genre TO sub_type;

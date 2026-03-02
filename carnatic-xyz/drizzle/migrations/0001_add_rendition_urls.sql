-- Add rendition_urls to compositions (JSON array of { url, label? })
ALTER TABLE compositions ADD COLUMN rendition_urls text;

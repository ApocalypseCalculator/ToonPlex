-- THIS IS A CUSTOM MIGRATION
-- CUSTOM SQL STATEMENTS FOR CREATING A GIN INDEX FOR FULL TEXT SEARCH
-- we weight title as A, alttitle as B, and summary as the default D

ALTER TABLE "Toon" ADD search tsvector GENERATED ALWAYS AS 
    (setweight(to_tsvector('english', title), 'A') || ' ' || 
    setweight(to_tsvector('english', alttitle), 'B') || ' ' ||
    to_tsvector('english', summary)) STORED;

CREATE INDEX idx_search ON "Toon" USING GIN(search);

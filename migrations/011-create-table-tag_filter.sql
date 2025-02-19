CREATE TABLE tag_filter (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    tag_id BIGINT NOT NULL REFERENCES tag(id),
    filter_id BIGINT NOT NULL REFERENCES filter(id)
);
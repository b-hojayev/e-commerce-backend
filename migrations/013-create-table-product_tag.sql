CREATE TABLE product_tag (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product(id),
    tag_id BIGINT NOT NULL REFERENCES tag(id)
);
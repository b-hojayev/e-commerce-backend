CREATE TABLE product_info (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    text TEXT NOT NULL,
    product_id BIGINT NOT NULL REFERENCES product(id)
);
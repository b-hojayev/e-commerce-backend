CREATE TABLE basket_product (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    basket_id BIGINT NOT NULL REFERENCES basket(id),
    product_id BIGINT NOT NULL REFERENCES product(id)
);
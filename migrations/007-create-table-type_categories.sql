CREATE TABLE type_categories(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES category(id),
    type_id BIGINT NOT NULL REFERENCES type(id)
);
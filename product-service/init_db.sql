create table products (
  id uuid primary key default uuid_generate_v4(),
  title text,
  description text,
  price integer
)

create table stocks (
  product_id uuid primary key,
  count integer,
  foreign key ("product_id") references "products" ("id")
)

insert into products (title, description, price) values
('Tesla Model S', 'Ilon''s favorite baby', 70000),
('BMW M5', 'Fast load dangerous car', 60000),
('VW Tiguan', 'Optimal city/countryside car', 30000)

insert into stocks (product_id, count) values
(
    (
        select id from products
        where title = 'Tesla Model S'
    ),
    3000
),
(
    (
        select id from products
        where title = 'BMW M5'
    ),
    12000
),
(
    (
        select id from products
        where title = 'VW Tiguan'
    ),
    32000
)
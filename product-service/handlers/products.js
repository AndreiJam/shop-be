'use strict';
const { Client } = require('pg');
const getSecret = require('../auth');

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME } = secret;
const dbOptions = {
    host: PG_HOST,
    port: PG_PORT,
    database: PG_DATABASE,
    user: PG_USERNAME,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000
};

module.exports.invoke = async event => {
    dbOptions.password = await getSecret();
    const client = new Client(dbOptions);
    await client.connect();

    try {
        const ddlResult = await client.query(`
            create table if not exists products(
                id uuid primary key default uuid_generate_v4(),
                title text,
                description text,
                price integer
            )`);

        const ddlResult2 = await client.query(`
            create table if not exists stocks(
                product_id uuid primary key,
                count integer,
                foreign key ("product_id") references "products" ("id")
            )`);

        const dmlResult = await client.query(`
            insert into products (title, description, price) values
            ('Tesla Model S', 'Ilon''s favorite baby', 70000),
            ('BMW M5', 'Fast load dangerous car', 60000),
            ('VW Tiguan', 'Optimal city/countryside car', 30000)
        `);

        const dmlResult2 = await client.query(`
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
        `);

        const { rows: products } = await client.query('select * from products');
        console.log(products);
    } catch (e) {
        console.log('Error during DB request: ', e);
    } finally {
        client.end();
    }
}

module.exports.getProductsList = async event => {
    dbOptions.password = await getSecret();
    const client = new Client(dbOptions);
    await client.connect();
    try {
        const { rows: products } = await client.query('select * from products');
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(products, null, 2),
        };
    } finally {
        client.end();
    }
};

module.exports.getProductById = async event => {
    dbOptions.password = await getSecret();
    const client = new Client(dbOptions);
    await client.connect();
    try {
        if (event.pathParameters) {
            const { id } = event.pathParameters;
            console.log('id: ', id);
            const response = await client.query(`select * from products where id = '${id}'`);
            console.log('response: ', response);
            const item = response.rows.length == 1 ? response.rows[0] : response.rows;
            if (item) {
                return {
                    statusCode: 200,
                    headers: {
                        "Access-Control-Allow-Origin": "*"
                    },
                    body: JSON.stringify(item, null, 2),
                };
            }
        }
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'Not found'
            }, null, 2),
        }
    } finally {
        client.end();
    }
};
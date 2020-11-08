'use strict';
const data = require('./products.json');

module.exports.getProductsList = async event => {
    return {
        statusCode: 200,
        body: JSON.stringify(data, null, 2),
    };
};

module.exports.getProductById = async event => {
    if (event.pathParameters) {
        const { id } = event.pathParameters;
        const item = data.find(i => i.id == id);
        if (item) {
            return {
                statusCode: 200,
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
};
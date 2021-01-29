var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');


var app = express();

// create application/json parser
var jsonParser = bodyParser.json()

const hostPort = 5001;
const prefix = 'http://';
const addressList = {
    dev: '172.16.7.84:5000/es_api',
    prod: '172.16.7.83:5000',
    local: 'localhost:5000',
    jun: '192.168.1.22:5000'
};
var arguments = process.argv.pop();
const address = addressList[arguments];
console.log(`Transfering to: ${address}`);

function setHeaders(res, response) {
    let resp = response;
    if (response.toJson && typeof response.toJson === 'function') {
        resp = response.toJson();
    }
    for (const key in resp.headers) {
        if (Object.hasOwnProperty.call(resp.headers, key)) {
            res.setHeader(key, resp.headers[key])
        }
    }
}

app.use('/', jsonParser, function (req, res) {
    var url = `${prefix}${address}${req.url}`;

    const param = {
        url: url,
        method: req.method,
        json: true,
        headers: req.headers,
        body: req.body
    }
    request(param, function (error, response, body) {
        if (!error) {
            res.status(response.statusCode);
            setHeaders(res, response);
            res.json(response.body);
        } else {
            res.json(error);
        }
    });
})

app.listen(hostPort);
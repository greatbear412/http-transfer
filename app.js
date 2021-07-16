var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');

var app = express();

// create application/json parser
var jsonParser = bodyParser.json()

const hostPort = 5001;
const prefix = 'http://';
const addressList = {
    dev: '172.16.7.84/es_api',
    prod: '172.16.7.83/es_api',
    local: 'localhost:5000',
    jun: '192.168.1.22:5000',
    fa: '192.168.1.146:5000'
};
const gzipList = {
    dev: true,
    prod: true,
    local: false,
    jun: false,
    fa: false
}
var site = process.argv.pop();
let address = addressList[site];
if (address == null) {
    console.error('Wrong argument!');
    address = addressList.local;
}

console.log(`Transfering from: ${hostPort} to: ${address}`);

function setHeaders(res, response) {
    let resp = response;
    if (response.toJson && typeof response.toJson === 'function') {
        resp = response.toJson();
    }
    const headers = Object.assign({}, resp.headers);
    const gzipHeaders = ['content-encoding', 'transfer-encoding'];
    for (const key in headers) {
        if (Object.hasOwnProperty.call(headers, key) && !gzipHeaders.includes(key)) {
            res.setHeader(key, headers[key])
        }
    }
}

app.use('/es_api/', jsonParser, function (req, res) {
    var url = `${prefix}${address}${req.url}`;

    const param = {
        url: url,
        method: req.method,
        json: true,
        headers: req.headers,
        body: req.body,
        gzip: gzipList[site]
    }
    console.log(`Accept: ${req.url}`)
    request(param, function (error, response, body) {
        if (!error) {
            res.status(response.statusCode);
            setHeaders(res, response);
            console.log(`Receive: ${url}`)
            res.json(response.body);
        } else {
            console.log(`ReceiveError: ${url}`)
            res.json(error);
        }
    });
})

app.listen(hostPort);
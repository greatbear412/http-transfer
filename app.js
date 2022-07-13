var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var chalk = require('chalk');
const inquirer = require('inquirer');

var app = express();

// create application/json parser
var jsonParser = bodyParser.json()

const hostPort = 8000;
const prefix = 'http://';
const addressList = {
    dev: '10.141.23.18',
    // prod: '172.16.7.83/es_api',
    // local: 'localhost:5000',
    wqq: '10.137.3.216:8000',
    dc: '10.137.1.30:8000',
    ws: '10.137.0.186:8000',
    wx: '10.137.3.153:8000'
};
const gzipList = {
    dev: false,
    prod: true,
    local: false,
    wqq: false
}
var site = process.argv.pop();
let address = '';
// if (address == null) {
//     console.error(chalk.red('Wrong argument!'));
//     address = addressList.local;
// }

getProxyTarget().then(({
    add
}) => {
    address = add.split('-')[1].trim();
    init();
})
console.log('------------');
console.log('Transfering from ' + chalk.blue(`localhost: ${hostPort}`) + ' to ' + chalk.green(`${address}`));

// 复制请求头数据
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

// 选择代理地址
async function getProxyTarget() {
    const addressList = [
        `dev - 10.141.23.18`,
        `王钦钦 - 10.137.3.216:8000`,
        `董冲 - 10.137.1.30:8000`,
        `吴申 - 10.137.0.186:8000`,
        `王星 - 10.137.3.153:8000`
    ];
    questions = [{
        type: "list",
        message: `选择代理地址：`,
        name: 'add',
        choices: addressList
    }];
    return inquirer.prompt(questions).then(answers => {
        return answers;
    })
}

function init() {
    console.log('');
    // 代理接口prefix
    // 如遇Vite等已有前缀代理的，考虑用'/'
    app.use('/', jsonParser, function (req, res) {
        var url = `${prefix}${address}${req.url}`;

        const param = {
            url: url,
            method: req.method,
            json: true,
            headers: req.headers,
            body: req.body,
            gzip: gzipList[site]
        }
        console.log(chalk.blue(`Accept: ${req.url}`));
        request(param, function (error, response, body) {
            if (!error) {
                res.status(response.statusCode);
                setHeaders(res, response);
                console.log(chalk.green(`Receive: ${url}`));
                res.json(response.body);
            } else {
                console.log(chalk.red(`ReceiveError: ${url}`))
                res.json(error);
            }
        });
    })
    app.listen(hostPort);
}
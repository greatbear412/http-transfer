var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var chalk = require('chalk');
const inquirer = require('inquirer');
const addressList = require('./config');

var app = express();
var log = console.log;

// create application/json parser
var jsonParser = bodyParser.json()

const hostPort = 8000;
const prefix = 'http://';

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
    address = add.split('<>')[1].trim();
    init();
})

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
    const list = Object.keys(addressList).map(key => {
        return `${key} <> ${addressList[key]}`
    })
    questions = [{
        type: "list",
        message: `选择代理地址：`,
        name: 'add',
        choices: list
    }];
    return inquirer.prompt(questions).then(answers => {
        return answers;
    })
}

function init() {
    log('');
    log('------Transfering------');
    log('from: ' + chalk.blue(`localhost: ${hostPort}`))
    log('to: ' + chalk.green(`${address}`));
    log('-----------------------');
    log('');

    // 代理接口prefix
    // 如遇Vite等已有前缀代理的，考虑用'/'
    app.use('/', jsonParser, function (req, res) {
        var url = `${prefix}${address}${req.url}`;

        const param = {
            url,
            method: req.method,
            json: true,
            headers: req.headers,
            body: req.body,
            gzip: gzipList[site]
        }
        log(chalk.blue(`Accept: ${req.url}`));
        request(param, function (error, response, body) {
            if (!error) {
                res.status(response.statusCode);
                setHeaders(res, response);
                log(chalk.green(`Receive: ${url}`));
                res.json(response.body);
            } else {
                log(chalk.red(`ReceiveError: ${url}`))
                res.json(error);
            }
        });
    })
    app.listen(hostPort);
}
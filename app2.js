var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');


var app = express();

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use('/', jsonParser, function (req, res) {
    console.log(123);
    res.json({
        name: 123
    })
})
app.listen(5001);

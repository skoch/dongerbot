const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const sheetrock = require('sheetrock');

const app = express();

app.set('port', (process.env.PORT || 3000));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
    // GET where ssl_check set to 1 from Slack
    if (req.query.ssl_check == 1) {
        return res.sendStatus(200);
    }
    return res.sendStatus(403);
});

app.get('/slack-auth', function(req, res) {
    let data = {form: {
        client_id: '2151820749.109274070033',
        client_secret: '414896e4aff009e444bbc1a07b0c10a2',
        code: req.query.code
    }};

    request.post('https://slack.com/api/oauth.access', data, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.redirect('https://s-media-cache-ak0.pinimg.com/originals/b7/7b/8c/b77b8ceaa61f60b6d96cae2e92a3e83e.gif');
        }
    });
});

app.post('/', function(req, res) {
    if (!req.body) {
        return res.sendStatus(400);
    }

    if (req.body.token == 'hAfjfpjE1BJsyeTQnjECTL53') {
        console.log('req.body.text', req.body.text);

        var donger = req.body.text ? req.body.text : 'excuseme';

        sheetrock({
            // url: "https://docs.google.com/spreadsheets/d/1QO5dyK6EgIP81SGZMlHMk8xn88u_budzF2Td3OoOZzY/edit#gid=0",
            url: "https://docs.google.com/spreadsheets/d/1j1l5VS4R326U2QLmC_7ZY3MZWbL-S1ETN7JVtyX2ALg/edit?usp=sharing",
            query: "Select A where B contains'"+ donger +"'",
            reset: true,
            callback: function (error, options, response) {
                console.log('>>', response.rows.cellsArray[0]);

                var response = {
                    "response_type": "in_channel",
                    "text": response.rows.cellsArray[0],
                }
                res.json(response);
            }
        });
    }
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

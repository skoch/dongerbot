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
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code: req.query.code
    }};

    request.post('https://slack.com/api/oauth.access', data, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.redirect(process.env.THANK_YOU_REDIRECT);
        }
    });
});

app.post('/', function(req, res) {
    if (!req.body) {
        return res.sendStatus(400);
    }

    if (req.body.token == process.env.SLACK_AUTH_TOKEN) {

        let text = req.body.text ? req.body.text : 'excuseme';

        sheetrock({
            // url: "https://docs.google.com/spreadsheets/d/1QO5dyK6EgIP81SGZMlHMk8xn88u_budzF2Td3OoOZzY/edit#gid=0",
            url: `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SPREADSHEET_ID}/edit?usp=sharing`,
            query: `Select A where B = ${text}`,
            reset: true,
            callback: function (error, options, response) {
                console.log('>>', response);

                let donger = response.rows.cellsArray[0] ? response.rows.cellsArray[0] : 'no donger';
                var response = {
                    "response_type": "in_channel",
                    "text": donger,
                }
                res.json(response);
            }
        });
    }
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

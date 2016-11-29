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
        let channel = req.body.channel_id ? req.body.channel_id : '#general';

        console.log('channel', channel);

        sheetrock({
            // url: "https://docs.google.com/spreadsheets/d/1QO5dyK6EgIP81SGZMlHMk8xn88u_budzF2Td3OoOZzY/edit#gid=0",
            // url: `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SPREADSHEET_ID}/edit?usp=sharing`,
            url: `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SPREADSHEET_ID}/edit#gid=0`,
            query: `Select B where A = "${text}"`,
            reset: true,
            callback: function (error, options, response) {
                // console.log('>>', response.rows);
                // console.log('attributes', response.attributes.labels[0]);

                // let donger = response.rows.cellsArray[0] ? response.rows.cellsArray[0] : 'no donger';
                let donger = response.attributes ? response.attributes.labels[0] : 'ヽ| ͡☉ ︿ ͡☉ |ノ⌒.';

                var response = {
                    // dongerbot token
                    "token": "xoxb-111099496950-DcPmvvpn544CTx2OapnNzxSC",
                    // testing token generated on Slack
                    // "token": "xoxp-2151820749-2304102342-13165708866-92ad67edf7",
                    "username": text,
                    "channel": channel,
                    "text": donger,
                    "as_user": true,
                }

                console.log('response', response);

                request.post('https://slack.com/api/chat.postMessage', response, function (error, response, body) {
                    console.log('chat.postMessage response', body.ok);

                    if (!body.ok) {
                        console.log('bad');
                        console.log('body.error', body.error);
                    } else {
                        console.log('good');
                        if (body.warning) {
                            console.log('BUT body.warning', body.warning);
                        }
                    }

                    // if (!error && response.statusCode == 200) {
                    //     console.log('allgood?');
                    // }

                    // if (error) {
                    //     console.log('error', error);
                    // }
                });
                // res.json(response);

                // var response = {
                //     "response_type": "in_channel",
                //     "text": donger,
                // }
                // res.json(response);
                res.json({"text": "working..."});
            }
        });
    }
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

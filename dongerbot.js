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
        client_id: '2151820749.106696824658',
        client_secret: '1cd19097e7623950824df98bb5321c05',
        code: req.query.code
    }};

    request.post('https://slack.com/api/oauth.access', data, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // You are done.
            // If you want to get team info, you need to get the token here
            let token = JSON.parse(body).access_token; // Auth token

            // Get the team domain name to redirect to the team URL after auth
            request.post('https://slack.com/api/team.info', {form: {token: token}}, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    if(JSON.parse(body).error == 'missing_scope') {
                        res.send('Phteven has been added to your team!');
                    } else {
                        let team = JSON.parse(body).team.domain;
                        res.redirect('http://' +team+ '.slack.com');
                    }
                }
            });
        }
    });
});

app.post('/', function(req, res) {
    // token
    // B8ii7NIl0AHV4FoH21XvgRg5
    if (!req.body) {
        return res.sendStatus(400);
    }

    if (req.body.token == 'B8ii7NIl0AHV4FoH21XvgRg5') {
        console.log('req.body.text', req.body.text);

        if (req.body.text) {
            console.log('we have text');

            sheetrock({
                url: "https://docs.google.com/spreadsheets/d/1QO5dyK6EgIP81SGZMlHMk8xn88u_budzF2Td3OoOZzY/edit#gid=0",
                query: "Select A",
                callback: function (error, options, response) {
                    console.log('callback');
                    var urls = [];
                    for (let entry of response.rows) {
                        urls.push(entry.cellsArray[0]);
                    }
                    var url = urls[Math.floor(Math.random()*urls.length)];
                    console.log('url', url);

                    var response = {
                        "response_type": "in_channel",
                        "attachments": [
                            {
                                "image_url": url
                            }
                        ]
                    }
                    res.json(response);
                },
                reset: true
            });

        }
    }
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const sheetrock = require('sheetrock');
// const fs = require('fs');
// const http = require('http');
// const https = require('https');
const dongles = require('./dongles');
const _ = require('lodash');

const app = express();

// const privateKey = fs.readFileSync('ssl/key.pem');
// const certificate = fs.readFileSync('ssl/cert.pem');
// const credentials = {key: privateKey, cert: certificate};

// app.set('port', (process.env.PORT || 3000));
app.set('port', (process.env.PORT || 8443));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.get('/secure', function(req, res) {
//     res.writeHead(200);

//     var rando = _.sample(dongles);
//     console.log('rando', rando);

//     res.end("hello world\n");
// });

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

        // let bot_access_token = JSON.parse(body).bot.bot_access_token;
        // console.log('bot_access_token', bot_access_token);

        let token = JSON.parse(body).access_token; // Auth token
        console.log('access_token', token);

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

        let channel = req.body.channel_id ? req.body.channel_id : '#general';
        // console.log('channel', channel);
        // let text = req.body.text ? req.body.text : 'giveup';

        // we are attempting to search for something...
        let entry;
        if (req.body.text) {
            entry = _.find(dongles, {'name': req.body.text});
            if (!entry) {
               // entry = _.sample(dongles);
               // we didn't find one, so let's give up
               entry = _.find(dongles, {'name': 'giveup'});
            }
        } else {
            // we are asking for a random one since we didn't supply some text
            entry = _.sample(dongles);
        }

        console.log('entry', entry);
        // let dongle = JSON.parse(entry).dongle;
        let donger = entry.dongle;
        console.log('donger', donger);
        // {"name":"giveup","dongle":"ヽ| ͡☉ ︿ ͡☉ |ノ⌒."}
        var response = {
            "response_type": "in_channel",
            "text": donger,
        }
        res.json(response);

    }
});

// // var httpServer = http.createServer(app);
// var httpsServer = https.createServer(credentials, app);

// // httpServer.listen(8080);
// httpsServer.listen(app.get('port'), function(){
//     console.log('Node app is running on port', app.get('port'));
// });

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

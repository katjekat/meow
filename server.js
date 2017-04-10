// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

var Masto = require('mastodon')

var M = new Masto({
  access_token: process.env.ACCESS_TOKEN,
  timeout_ms: 60*1000,  // optional HTTP request timeout to apply to all requests.
  api_url: process.env.API_URL, // optional, defaults to https://mastodon.social/api/v1/
})

var ram = require('random-access-memory')
var memoryStore = function (file) {
  return ram()
}

var LogFeed = require('./log-feed')

const startTime = new Date()

var feed = new LogFeed(memoryStore, process.env.FEED_KEY)

feed.open(function () {
  feed.on('log', meowAtKatje)
})

function meowAtKatje (message) {
  var random
  if (new Date(message.created_at) < startTime) return
  console.log('message', message)
  if (message.account.id === 943 || message.account.id === 1911) {
    random = Math.random()
    console.log('meow probability', random)
    if (random > .6) {
      console.log('meowing')
      M.post('statuses', {
        // visibility: 'unlisted',
        status: '@katje@witches.town meow',
        in_reply_to_id: message.id
      }).then(resp => {
        console.log(resp.data)
        console.log('meowed!')
      })
    }
  }
}



// http://expressjs.com/en/starter/basic-routing.html

app.get("/", function (request, response) {
  response.send({
    discoveryKey: feed.feed.discoveryKey.toString('hex'),
    connections: feed.swarm.totalConnections,
    length: feed.feed.byteLength
  });
});
// Here are the original express routes for public/index.html
/*
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});



app.get("/dreams", function (request, response) {
  response.send(dreams);
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];
*/

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

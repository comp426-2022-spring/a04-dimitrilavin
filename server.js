const fs = require('fs')
const morgan = require('morgan')
const express = require('express')
const app = express()
const args = require('minimist')(process.argv.slice(2))

const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)

if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

const db = require('./database.js')
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

args['port']
const port = args.port || process.env.PORT || 5000

const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
});

if (args.log == 'false') {
  console.log("Nothing")
} else {
  const accessLog = fs.createWriteStream('access.log', { flags: 'a' })
  app.use(morgan('combined', { stream: accessLog }))
}

app.use((req, res, next) => {
  let logdata = {
      remoteaddr: req.ip,
      remoteuser: req.user,
      time: Date.now(),
      method: req.method,
      url: req.url,
      protocol: req.protocol,
      httpversion: req.httpVersion,
      status: res.statusCode,
      referrer: req.headers['referer'],
      useragent: req.headers['user-agent']
  };
  const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referrer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referrer, logdata.useragent)
  next();
})

if (args.debug || args.d) {
  app.get('/app/log/access/', (req, res, next) => {
      const stmt = db.prepare("SELECT * FROM accesslog").all();
    res.status(200).json(stmt);
  })

  app.get('/app/error/', (req, res, next) => {
      throw new Error('Error test')
  })
}

app.use(function(req, res) {
  res.status(404).send("404 NOT FOUND")
  res.type("text/plain")  
})
function coinFlip() {
    return Math.random() > .5 ? ("heads") : ("tails")
}

function coinFlips(flips) {
    var temp = new Array();
    if (flips < 1 || typeof flips == 'undefined') {
      flips = 1;
    }
    for (var i = 0; i < flips; i++) {  
      temp.push(coinFlip());
    }
    return temp;
}

function countFlips(array) {
    let h = 0;
    let t = 0;
    for (let i  = 0; i < array.length; i++) {
      if (array[i] == 'heads') {
        h++;
      }
      if (array[i] == 'tails') {
        t++;
      }
    }
    return {heads: h, tails: t};
}

function flipACoin(call) {
    let flip = coinFlip()
    let result = '';
    if (flip == call) {
      result = 'win';
    } else {
      result = 'lose';
    }
    return {call: call, flip: flip, result: result}
}

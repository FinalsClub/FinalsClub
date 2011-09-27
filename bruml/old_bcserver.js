/**
 *  bcserver.js; ruml; May 6, 2011;
 *  based on example from socket.io.node repo: server.js
 */

/**
 *  FLASH: Firefox 4 ships with websockets enables but unavailable because
 *         of a security firewall; use "about:config" to set
 *         network.websocket.override-security-block to true;
 *         Safari 5.0.5 works out of the box; 
 *
 *  NOW: some transport other than websocket:
 *       - client disconnects after about 15 seconds;
 *       - connecting with flashsocket"; there's an error in socket.io.js:
 *           self.__flash.getReadyState is not a function  line 1651
 *
 */
 
// messages are objects with one property whose value is the
// type of message:
//   { "post":        { "objtype": "post", <other Post properties> } }
//   { "topPosts":    [ <array of Post objects> ] }
//   { "recentPosts": [ <array of Post objects> ] }
//   { "vote":        { "objtype": "vote", "postid": <string>, "direction": <"up"|"down"> } }
// unique postid assigned at the server when post arrives; format: <meetingid>-<serial-starting-at-1>;
// although voting changes the vote total displayed locally, this is cosmetic only;
 
var 
  http = require('http'),
  url  = require('url'),
  // var qstr = require('querystring');
  fs   = require('fs'),
  util = require('util'),
  // require.path.unshift('./lib');
  io   = require('socket.io'),
  // path is used by paperboy;
  path     = require('path'),
  paperboy = require('./lib/paperboy'),
  // could be used for uniqueId(); probably should be part of any project;
  _        = require('./lib/underscore'),
  
  GLOBALS = { "meetingID": "888", "nextPostID": 1, "username": "notyetset" },
  PORT = 8080,
  STATIC = path.join(path.dirname(__filename), 'static');
    
var server = http.createServer(function(request, response){
  var ip = request.connection.remoteAddress;
  var pathname = url.parse(request.url).pathname;
  var query    = url.parse(request.url, true).query;
  switch (pathname){
    /*
    case '/':
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(
        '<h1>Welcome to the backchan.nl clone on node.js</h1>' +
        '<div style="margin: 3em auto; padding: 4em; ' +
        '            border: 3px solid blue; ' +
        '            width: 25em; text-align: center;">' +
        // we actually might prefer POST but I don't know how to extract params;
        '<form action="/bcmodule.html" method="get">' +
        '  <label for="username">User handle: </label>' +
        '    <input type="text" id="username" value="bruml2" /><br /><br />' +
        '    <input type="submit" value="Send" />' +
        '</form></div>'
      );
      response.end();
    break;
    */

    default:
      /* Bypassing initial form
      if (pathname == '/bcmodule.html') {
        if (typeof(GLOBALS['username']) != 'undefined') {
          GLOBALS['username'] = query['username'];    
          console.log('Captured username: "' + GLOBALS['username'] + '"');
        } else {
          console.log('NO USERNAME found');
        }
      } 
      */
      paperboy
      .deliver(STATIC, request, response)
      // second arg is milliseconds!!
      .addHeader('Expires', 300)
      .addHeader('X-PaperRoute', 'Node')
      .before(function() {
        // can cancel delivery by returning false;
        // console.log('Received Request');
      })
      .after(function(statCode) {
        log(statCode, request.url, ip);
      })
      .error(function(statCode, msg) {
        response.writeHead(statCode, {'Content-Type': 'text/plain'});
        response.end("Error " + statCode);
        log(statCode, request.url, ip, msg);
      })
      .otherwise(function(err) {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('404 - file "' + pathname + '" not found on chat server');
        log(404, request.url, ip, err);
      });
    } // switch;
}); // http.createServer();

// for paperboy;
function log(statCode, url, ip, err) {
  var logStr = statCode + ' - ' + url + ' - ' + ip;
  if (err)
    logStr += ' - ' + err;
  console.log(logStr);
}

server.listen(PORT);
console.log("==============================");
console.log("Server listening on port " + PORT + "!");

// crete socket to listen to socket.io traffic on same port as http traffic;
var socket = io.listen(server);

function getNextUniquePostID() {
  var nextID = GLOBALS["nextPostID"];
  GLOBALS["nextPostID"] += 1;
  return GLOBALS["meetingID"] + "-" + nextID;
}
function sortPostsByVoteRankDescending(a, b) {
  aRank = a.posvotes - (a.negvotes * 0.5);
  bRank = b.posvotes - (b.negvotes * 0.5);
  // for descending, reverse usual order; 
  return bRank - aRank;
}
function sortPostsByCreatedDescending(a, b) {
  // for descending, reverse usual order; 
  return b.created - a.created;
}
function tallyVote(postid, direction) {
  allPosts.forEach(function(el) {
    if (el.postid == postid) {
      switch (direction) {
        case "up":   el.posvotes += 1; break;
        case "down": el.negvotes += 1; break;
        default: console.log("Bad direction on vote: " + el.direction);
      }
      // terminate iteration here?
    }
  });
}

// temporary: for testing;
var dummyPosts = [ { 
  objtype: "post",
  meetingid: GLOBALS["meetingID"],
  userid: 12345,
  username: "Bill Jones",
  useraffil: "student",
  postid: getNextUniquePostID(),
  body: "This is dummy post one: 1111111.",
  posvotes: 1,
  negvotes: 1,
  isdeleted: false,
  ispromoted: false,
  isdemoted: false,
  created: (new Date).getTime() 
}, {
  objtype: "post",
  meetingid: GLOBALS["meetingID"],
  userid: 12345,
  username: "George Smith",
  useraffil: "student",
  postid: getNextUniquePostID(),
  body: "This is dummy post two: 2222222.",
  posvotes: 5,
  negvotes: 2,
  isdeleted: false,
  ispromoted: false,
  isdemoted: false,
  created: (new Date).getTime() + 10000
} ];
// allPosts collects all the messages since the start of the server; when a
// new client connects, the buffer is sent immediately (it's the current state).
// would need to be per school, per class and per lecture;
var allPosts = [];
// prime the pump a little;
allPosts = dummyPosts;
  
socket.on('connection', function(client){
  // ====> we're in the connection callback: executes once;
  // NB: when the sorting occurred outside the callback, it was not reflected in
  //     the actual order sent;  this way works!  [Why is this?]
  console.log("======== sending topPosts and recentPosts on connection event =======");
  var topPosts = allPosts.sort(sortPostsByVoteRankDescending);
  console.log("Top Posts:");
  topPosts.forEach(function(el) {
    console.log(el.postid + ": " + el.posvotes + "/" + el.negvotes + " - " + el.created) 
  });
  client.json.send( { posts: allPosts } );

  var recentPosts = allPosts.sort(sortPostsByCreatedDescending);
  console.log("Recent Posts:");
  recentPosts.forEach(function(el) { console.log(el.postid + " - " + el.posvotes + " - " + el.created) });
  //client.send( { "recentPosts": recentPosts } );

  console.log("Sent " + topPosts.length + " accumulated topPosts.");
  console.log("Sent " + recentPosts.length + " accumulated recentPosts.");
  console.log("======== done =======");
  client.broadcast({ "announcement": 'Hey! ' + client.sessionId + ' connected' });
  
  // create callbacks for this client;
  /*
  client.on('message', function(message, fn){
    if ("post" in message) {
      message.post.postid = getNextUniquePostID();
      console.log("POST " + message.postid + " received from client: " + client.sessionId);
      allPosts.push(message.post);
      console.log("Now have " + allPosts.length + " posts in all");
      fn(message.post.postid);
      var topPosts = allPosts.sort(sortPostsByVoteRankDescending);
      client.broadcast( { "topPosts": topPosts } );
      client.send(      { "topPosts": topPosts } );
      var recentPosts = allPosts.sort(sortPostsByCreatedDescending);
      client.broadcast( { "recentPosts": recentPosts } );
      client.send(      { "recentPosts": recentPosts } );
    } else if ("vote" in message) {
      console.log("VOTE received from client: " + client.sessionId);
      console.log(message);
      tallyVote(message.vote.postid, message.vote.direction);
      // only the order of topPosts might change; could check whether it
      // has before sending traffic; could send a vote message to clients
      // and display could be changed locally;
      var topPosts = allPosts.sort(sortPostsByVoteRankDescending);
      client.broadcast( { "topPosts": topPosts } );
      client.send(      { "topPosts": topPosts } );
      var recentPosts = allPosts.sort(sortPostsByCreatedDescending);
      client.broadcast( { "recentPosts": recentPosts } );
      client.send(      { "recentPosts": recentPosts } );
    } else {
      console.log("UNKNOWN message type (" + message + "); client: " + client.sessionId);
    }
  });
  */
  client.on('post', function(msg) {
    var post = msg.post;
    post.postid = getNextUniquePostID();
    console.log("POST " + post.postid + " received from client: " + client.sessionId);
    allPosts.push(post);
    console.log("Now have " + allPosts.length + " posts in all");
    socket.emit('post', post);
  });
  client.on('vote', function(msg) {
    console.log("VOTE received from client: " + client.sessionId);
    console.log(message);
    tallyVote(msg.vote.postid, msg.vote.direction);
    socket.emit('vote', msg.vote);
  })
  client.on('disconnect', function(){
    console.log("Client: " + client.sessionId + " disconnected");
    client.broadcast({ announcement: client.sessionId + ' disconnected' });
  });
}); // connection callback;

var express  = require('express');
var fs       = require('fs');
var app      = express.createServer();
var io       = require('socket.io').listen(app);
var mongoose = require('../db.js').mongoose;

app.configure(function() {
  app.use(express.static(__dirname+'/static'));
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
  app.set('dbUri', 'mongodb://localhost/fc');
});

mongoose.connect(app.set('dbUri'));
mongoose.connection.db.serverConfig.connection.autoReconnect = true;

var Post = mongoose.model('Post');

var clients = {};

var posts = {};

app.listen('8080');

io.sockets.on('connection', function(socket) {
  socket.on('subscribe', function(lecture) {
    var id = socket.id;
    clients[id] = {
      socket: socket,
      lecture: lecture
    }
    Post.find({'lecture': lecture}, function(err, res) {
      posts[lecture] = res ? res : [];
      socket.json.send({posts: res});
    })
  })
  socket.on('post', function(res) {
    var post = new Post;
    var _post = res.post;
    var lecture = res.lecture;
    post.lecture = lecture;
    if ( _post.anonymous ) {
      post.userid    = 0;
      post.userName  = 'Anonymous';
      post.userAffil = 'N/A';
    } else {
      post.userName = _post.userName;
      post.userAffil = _post.userAffil;
    }
    post.date = new Date();
    post.body = _post.body;
    post.votes = 0;
    post.save(function(err) {
      if (err) {
        // XXX some error handling
        console.log(err)
      } else {
        posts[lecture].push(post);
        publish({post: post}, lecture);
      }
    })
  });

  socket.on('vote', function(res) {
    var vote = res.vote;
    var lecture = res.lecture;
    posts[lecture] = posts[lecture].map(function(post) {
      if(post._id == vote.parentid) {
        post.votes++;
        post.save(function(err) {
          if (err) {
            // XXX error handling
          } else {
            publish({vote: vote}, lecture);
          }
        })
      }
      return post;
    });
  })

  socket.on('comment', function(res) {
    var comment = res.comment;
    var lecture = res.lecture;
    console.log('anon', comment.anonymous)
    if ( comment.anonymous ) {
      comment.userid    = 0;
      comment.userName  = 'Anonymous';
      comment.userAffil = 'N/A';
    }
    posts[lecture] = posts[lecture].map(function(post) {
      if(post._id == comment.parentid) {
        post.comments.push(comment);
        post.date = new Date();
        post.save(function(err) {
          if (err) {
            console.log(err)
          } else {
            publish({comment: comment}, lecture);
          }
        })
      }
      return post;
    });
  })
  
  socket.on('disconnect', function() {
    delete clients[socket.id];
  })
});

function publish(data, lecture) {
  Object.getOwnPropertyNames(clients).forEach(function(id) {
    if (clients[id].lecture === lecture) {
      clients[id].socket.json.send(data)
    }
  })
}

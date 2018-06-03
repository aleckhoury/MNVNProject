// Express setup and other middleware
const express = require("express");
const path = require('path');
const bodyParser = require("body-parser");
const config = require("../config/database")
const cors = require("cors");
const morgan = require("morgan");
const { User, Post } = require("../models/models");
const mongoose = require("mongoose");
var passport = require('passport');

mongoose.connect(config.database);
var db = mongoose.connection;

// On successful Connection
db.on('connected', () => {
  console.log("Connected to database: " + config.database)
});

// On connection error
db.on('error', (err) => {
  console.log("Database error: " + config.database)
});

const users = require("../routes/users");
const app = express();

//Logging output
app.use(morgan("combined"));

// CORS Middleware
app.use(cors());

// Parse incoming request
app.use(bodyParser.json());
app.use('/users', users);

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session())
require("../config/passport")(passport);

app.get("/posts", passport.authenticate('jwt', {session: false }), (req, res) => {
  Post.find({}, "title description", function(error, posts) {
    if (error) {
      console.error(error);
    }
    res.send({
      posts: posts
    });
  }).sort({ _id: -1 });
});

mongoose.connect(config.database);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback) {
  console.log("Connection Succeeded");
});

// Add a Post
app.post("/posts", (req, res) => {
  var db = req.db;
  var title = req.body.title;
  var description = req.body.description;
  var new_post = new Post({
    title: title,
    description: description
  });

  new_post.save(function(error) {
    if (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error: Post was not saved"
      });
      return;
    }
    res.send({
      success: true,
      message: "Post saved successfully!"
    });
  });
});

// Fetch single post
app.get("/post/:id", (req, res) => {
  var db = req.db;
  Post.findById(req.params.id, "title description", function(error, post) {
    if (error) {
      console.error(error);
    }
    res.send(post);
  });
});

// Update a post
app.put("/posts/:id", (req, res) => {
  var db = req.db;
  Post.findById(req.params.id, "title description", function(error, post) {
    if (error) {
      console.error(error);
    }

    post.title = req.body.title;
    post.description = req.body.description;
    post.save(function(error) {
      if (error) {
        console.log(error);
      }
      res.send({
        success: true
      });
    });
  });
});

// Delete a post
app.delete("/posts/:id", (req, res) => {
  var db = req.db;
  Post.remove(
    {
      _id: req.params.id
    },
    function(err, post) {
      if (err) res.send(err);
      res.send({
        success: true
      });
    }
  );
});

app.get("/users", (req, res) => {
  User.find({}, "firstName lastName username password summary", function(error, users) {
    if (error) {
      console.error(error);
    }
    res.send({
      users: users
    });
  }).sort({ _id: -1 });
});
//
// mongoose.connect("mongodb://localhost:27017/users");
// // var db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error"));
// db.once("open", function(callback) {
//   console.log("Connection Succeeded");
// });
//
// Add a User
app.post("/users", (req, res) => {
  var db = req.db;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var username = req.body.username;
  var password = req.body.password;
  var summary = req.body.summary;
  var new_user = new User({
    firstName: firstName,
    lastName: lastName,
    username: username,
    password: password,
    summary: summary
  });

  new_user.save(function(error) {
    if (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error: User was not saved"
      });
      return;
    }
    res.send({
      success: true,
      message: "User saved successfully!"
    });
  });
});

// Fetch single post
app.get("/user/:id", (req, res) => {
  var db = req.db;
  User.findById(req.params.id, "firstName lastName username password summary", function(error, user) {
    if (error) {
      console.error(error);
    }
    res.send(user);
  });
});

// Update a post
app.put("/users/:id", (req, res) => {
  var db = req.db;
  User.findById(req.params.id, "firstName lastName username password summary", function(error, user) {
    if (error) {
      console.error(error);
    }

    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.username = req.body.username;
    user.password = req.body.password;
    user.summary = req.body.summary;
    user.save(function(error) {
      if (error) {
        console.log(error);
      }
      res.send({
        success: true
      });
    });
  });
});

// Delete a post
app.delete("/users/:id", (req, res) => {
  var db = req.db;
  User.remove(
    {
      _id: req.params.id
    },
    function(err, user) {
      if (err) res.send(err);
      res.send({
        success: true
      });
    }
  );
});

app.listen(process.env.PORT || 8081);
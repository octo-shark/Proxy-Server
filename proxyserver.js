const express = require('express');
const bodyparser = require('body-parser');
const request = require('request');

const {mongoURL} = require('./config');
const {postgresURL} = require('./config');

const app = express();
const port = 80;

const URL = 'localhost';

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
 });

// Postgres
app.get('/:userID', (req, res) => {
  request.get(`http://${postgresURL}/users/${req.params.userID}`, (err, data) => {
    if(err){
      console.log(err);
      res.status(500).send(err);
    } else {
      res.status(200).send(JSON.parse(data.body));
    }
  })
})

app.post('/newUser', (req, res) => {
  request.post({
    url: `http://${postgresURL}/users/newUser`,
    form: {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    }
  },
  (err, data) => {
    if(err){
      console.log(err);
      res.status(500).send(err);
    } else {
      res.status(200).send(JSON.parse(data.body));
    }
  })
})

// MongoDB
app.get('/:userID/timestamps', (req, res) => {
  request.get(`http://${mongoURL}/api/db/${req.params.userID}`, (err, data) => {
    if(err){
      console.log(err);
      res.status(500).send(err);
    } else {
      res.status(200).send(JSON.parse(data.body));
    }
  })
})

app.post('/:userID/timestamps', (req, res) => {
  request.post({
    url: `http://${mongoURL}/api/db`,
    form: {
      user_id: req.body.user_id,
      activity_id: req.body.activity_id,
      timestamp_start: req.body.timestamp_start,
      timestamp_end: req.body.timestamp_end
    }
  },
  (err, data) => {
    if(err){
      res.status(500).send(err);
    } else {
      res.status(200).send(JSON.parse(data.body));
    }
  })
})

app.listen(port, () => {console.log(`Listening on port ${port}`)});
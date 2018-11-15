const express = require('express');
const bodyparser = require('body-parser');
const request = require('request');

const app = express();
const port = 80;

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json())

app.get('/:userID/timestamps', (req, res) => {
  request.get(`http://127.0.0.1:4898/api/db/${req.params.userID}`, (err, data) => {
    if(err){
      res.status(500).send(err);
    } else {
      res.status(200).send(JSON.parse(data.body));
    }
  })
})

app.post('/:userID/timestamps', (req, res) => {
  // console.log(req)
  request.post({
    url: `http://127.0.0.1:4898/api/db`,
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
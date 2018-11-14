const express = require('express');
const bodyparser = require('body-parser');
const axios = require('axios')
const app = express();

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json())


//postgres db acceess
app.get('/postgres/users', (req, res) => {
  res.send('Idk man.')

})

app.post('/postgres/users', (req, res) => {
  res.send('posting idk man');

})
//

//Mongodb access
app.post('/mongo/time_stamps', (req,res) => {
  res.send('posting idk man');
})

app.get('/mongo/time_stamps', (req, res) => {
  res.send('Idk man.')
})

app.listen(1128, () => {
  console.log('Server listening on port 1128')
})
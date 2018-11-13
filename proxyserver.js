const express = require('express');
const bodyparser = require('body-parser');
const app = express();

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json())


app.listen(1128, () => {
  console.log('Server listening on port 1128')
})
const express = require("express");
const bodyparser = require("body-parser");
const request = require("request");
const cookieSession = require('cookie-session');
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cors = require('cors');

const authRoutes = require('./routes/auth-routes')
const profileRoutes = require('./routes/profile-routes')
const token = require("./config.js");

const {mongoURL} = require('./config');
const {postgresURL} = require('./config');

const app = express();
const port = 80;

app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: ['TimeShark'],
  resave: false,
  secret: 'TimeShark',
  name: 'session'
}))
app.use(cors());

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(passport.initialize())
app.use(passport.session());

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

passport.use(
  new GoogleStrategy({
      clientID: token.TOKEN.id,
      clientSecret: token.TOKEN.secret,
      callbackURL: "/auth/google/return"
    },
    function(accessToken, refreshToken, profile, done) {
      request.get({
        url: `http://${postgresURL}/users/${profile.id}`,
        form: {
          googleID: profile.id,
          username: profile.displayName,
        }
      }, (err, user) =>{
        if(err){
            done(err, null)
        }
        done(null, user)
      })
    })
);

passport.serializeUser((user, cb) => {
  // console.log("UserBody",user.body);
  cb(null, JSON.parse(user.body)); 
});

passport.deserializeUser((id, cb) => {
  cb(null, id);
});

app.use('/auth', authRoutes);
app.use('/profile', require("connect-ensure-login").ensureLoggedIn(),profileRoutes);

app.post("/newUser", (req, res) => {
//request.get, see if the profile.id (user googleID) is in the db, 
  //get and return profile and activity set
//else it isnt then execute the post request.
  //create new user, create new defualt set of activities [0,1,2,3,4,5,6,7]
  request.post({
      url: `http://${postgresURL}/users/newUser`,
      form: {
        googleID: req.body.googleID,
        username: req.body.username,
      }
    },
    (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.status(200).send(JSON.parse(data.body));
      }
    }
  );
});

app.get('/login', (req, res) =>{
  res.redirect('/auth/meme')
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

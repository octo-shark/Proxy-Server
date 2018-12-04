const express = require("express");
const bodyparser = require("body-parser");
const request = require("request");
const cookieSession = require('cookie-session');
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cors = require('cors');


const { mongoURL } = require("./config");
const { postgresURL } = require("./config");
const authRoutes = require('./routes/auth-routes')
const profileRoutes = require('./routes/profile-routes')
const token = require("./config.js");

const app = express();
const port = 4321;

app.set('view engine', 'ejs')

app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: ['TimeShark']
}))
app.use(cors());

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(passport.initialize())
app.use(passport.session());

// passport.use(
//   new GoogleStrategy({
//       clientID: token.TOKEN.id,
//       clientSecret: token.TOKEN.secret,
//       callbackURL: "/auth/google/return"
//     },
//     function(accessToken, refreshToken, profile, done) {
//       console.log('lmao Function')
//     request.get({
//       url: `http://localhost:5588/users/${profile.id}`,
//       form: {
//         googleID: profile.id,
//         username: profile.displayName,
//       }
//     }, (err, user) =>{
//       if(err){
//           done(err, null)
//       }
//       done(null, user)
//     })
//   })
// );

// passport.serializeUser((user, cb) => {
//   cb(null, JSON.parse(user.body)); 
// });

// passport.deserializeUser((id, cb) => {
//   cb(null, id);
// });



app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

// Postgres-userDB    
app.get("/:userID", (req, res) => {
  request.get(
    `http://${postgresURL}/users/${req.params.userID}`,        
    (err, data) => {
      if (err) {
        console.log('error in function app.get("/:userID") ',err)
        res.status(500).send(err);
      } else {
        res.status(200).send(JSON.parse(data.body));
      }
    }
  );
});

app.post("/newUser", (req, res) => {
//request.get, see if the profile.id (user googleID) is in the db, 
  //get and return profile and activity set
//else it isnt then execute the post request.
  //create new user, create new defualt set of activities [0,1,2,3,4,5,6,7]
  request.post(
    {
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

// MongoDB-TimestampDB
app.get("/:userID/timestamps",
require("connect-ensure-login").ensureLoggedIn(),
  (req, res) => {
    request.get(
      `http://${mongoURL}/api/db/${req.params.userID}`,
      (err, data) => {
        if (err) {
          console.log('error in app.get("/:userID/timestamps")',err);
          res.status(500).send(err);
        } else {
          res.status(200).send(JSON.parse(data.body));
        }
      }
    );
  }
);

app.post(
  "/:userID/timestamps",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res) => {
    request.post(
      {
        url: `http://${mongoURL}/api/db`,
        form: {
          user_id: req.body.user_id,
          activity_id: req.body.activity_id,
          timestamp_start: req.body.timestamp_start,
          timestamp_end: req.body.timestamp_end
        }
      },
      (err, data) => {
        if (err) {
          console.log('error in app.post("/:userID/timestamps"): ', err);
          res.status(500).send(err);
        } else {
          res.status(200).send(JSON.parse(data.body));
        }
      }
    );
  }
);
//

app.get(
  "/:userID/activities",
  require("connect-ensure-login").ensureLoggedIn(),   //Empty get request??
  (req, res) => {
    //Put stuff
  }
);

app.get('/', (req, res) => {
  res.render('home', { user: req.user })
})


app.listen(3000, () => {
  console.log(`Listening on port 3000`);
});

const express = require("express");
const bodyparser = require("body-parser");
const request = require("request");
const cookieSession = require('cookie-session');

const { mongoURL } = require("./config");
const { postgresURL } = require("./config");
const profileRoutes = require('./routes/profile-routes')
const authRoutes = require('./routes/auth-routes')

const app = express();
const port = 3000;

const URL = "localhost";

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const token = require("./config.js");

app.set('view engine', 'ejs')

app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: ['Memes are cool']
}))

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(passport.initialize())
app.use(passport.session());

passport.use(
  new GoogleStrategy({
      clientID: token.TOKEN.id,
      clientSecret: token.TOKEN.secret,
      callbackURL: "/auth/google/return"
    },
    function(accessToken, refreshToken, profile, done) {
    request.get({
      url: `http://localhost:5588/users/${profile.id}`,
      form: {
        googleID: profile.id,
        username: profile.displayName,
      }
    }, (err, user) =>{
      if(err){
        console.log('Didnt find user when trying to login: ', err);
          done(err, null)
      }
      // console.log('found User!: ', user)
      done(null, user)
    })
  })
);

passport.serializeUser((user, cb) => {
  // console.log('Serializeing User: ',JSON.parse(user.body).user.googleID)
  cb(null, JSON.parse(user.body)); // Fix Me // Hook up to DB?
});

passport.deserializeUser((id, cb) => {
  // console.log("deserializeUser: ", id)

  cb(null, id);
});



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

app.get('/meme', (req, res) =>{
  res.render("home", {user: req.user})
})

// Postgres         
app.get("/:userID", (req, res) => {
  request.get(
    `http://${postgresURL}/users/${req.params.userID}`,        
    (err, data) => {
      if (err) {
        //console.log(err);
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
// MongoDB

app.get(
  "/:userID/timestamps",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res) => {
    request.get(
      `http://${mongoURL}/api/db/${req.params.userID}`,
      (err, data) => {
        if (err) {
          console.log(err);
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
          res.status(500).send(err);
        } else {
          res.status(200).send(JSON.parse(data.body));
        }
      }
    );
  }
);

app.get(
  "/:userID/activities",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res) => {}
);

// app.get(
//   "/auth/google/return",
//   passport.authenticate("google", { failureRedirect: "/auth/login" }),
//   (req, res) => {
//     res.redirect("/home");
//   }
// );


// app.get('/auth/google', passport.authenticate('google', {
//   scope: ['profile']
// }));

app.get('/', (req, res) => {
  res.render('home', { user: req.user })
})


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

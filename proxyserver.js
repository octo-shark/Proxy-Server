const express = require("express");
const bodyparser = require("body-parser");
const request = require("request");

const { mongoURL } = require("./config");
const { postgresURL } = require("./config");

const app = express();
const port = 3000;

const URL = "localhost";

const passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;
const token = require("./config.js");

app.set('view engine', 'ejs')

passport.use(
  new GoogleStrategy({
      clientID: token.TOKEN.id,
      clientSecret: token.TOKEN.secret,
      callbackURL: "http://localhost:3000/auth/google/return"
    },
    function(accessToken, refreshToken, profile, done) {
    request.get({
      url: `http://localhost:5588/users/${profile.id}`,
      form: {
        googleID: profile.id,
        username: profile.displayName,
        password: 'default'
      }
    }, (err, data) =>{
      if(err){
        console.log('Didnt find user when trying to login: ', err);
          done(err, null)
      }
      console.log('found User!: ', data)
      done(null, data)  
    })
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user); // Fix Me // Hook up to DB
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());


app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Postgres         
app.get("/:userID", (req, res) => {
  request.get(
    `http://${postgresURL}/users/${req.params.userID}`,        //FIX ME, uncomment this
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
        password: req.body.password
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

app.get(
  "/auth/google/return",
  passport.authenticate("google", { failureRedirect: "/auth/login" }),
  (req, res) => {
    res.redirect("/home");
  }
);

app.get("/login", (req, res) => {
  res.render('login', {user: req.user})
});

app.get('/home', require("connect-ensure-login").ensureLoggedIn(), (req,res) => {
  res.render('home', { user: req.user })
})

app.get('/profile', require("connect-ensure-login").ensureLoggedIn(), (req, res) => {
  res.render("profile", {user: req.user})
})

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile']
}));

app.get('/logout', (req, res) =>{
  req.logout();
  res.redirect('/');
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

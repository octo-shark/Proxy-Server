const router = require('express').Router();
const passport = require('passport');
const cors = require('cors');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const token = require("../config.js");


passport.use(
  new GoogleStrategy({
      clientID: token.TOKEN.id,
      clientSecret: token.TOKEN.secret,
      callbackURL: "/auth/google/return"
    },
    function(accessToken, refreshToken, profile, done) {
      console.log('lmao Function')
    request.get({
      url: `http://localhost:5588/users/${profile.id}`,
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
  cb(null, JSON.parse(user.body)); 
});

passport.deserializeUser((id, cb) => {
  cb(null, id);
});



// auth login
router.get('/login', (req, res) => {
    res.render('login', { user: req.user });
});

// auth logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// auth with google+
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));



// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/google/return', passport.authenticate('google', {failureRedirect: '/'}), (req, res) => {
    res.redirect('/profile');
});

module.exports = router;






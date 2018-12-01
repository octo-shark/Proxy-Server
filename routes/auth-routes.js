const router = require('express').Router();
const passport = require('passport');

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
    // res.send(req.user);
    // console.log('Inside the callback route: ',req.user)
    res.redirect('/profile');
});

module.exports = router;






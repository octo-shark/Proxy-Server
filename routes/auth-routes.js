const router = require('express').Router();
const passport = require('passport');
const uuid=require('uuid/v3');

let authKeys={};

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

router.get('/initLogin/:type',function(req,res) {
    const id=uuid(req.params.type||'google.com',uuid.DNS);
    req.session.authId=id;
    res.send(id);
});
router.get('/wait', function(req,res){
    // console.log("Using ID:",req.query.id);
    new Promise((res,rej)=>{
        authKeys[req.session.authId]=res;
    }).then(response=>{
        res.status(200).end("Login ok",JSON.stringify(response));
    }).catch(err=>{
        res.status(500)
        .end("Error:"+JSON.stringify(err));
    });
})
// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/google/return', passport.authenticate('google') );
router.get('/google/return',function(req, res,next) {
    // console.log("SessionID:",req.session);
    // console.log("Response from google:",{query:req.query})
    authKeys[req.session.authId]({params:req.body,query:req.query});
    res.end('<script>window.close()</script>');
    next();
});

module.exports = router;






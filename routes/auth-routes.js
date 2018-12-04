const router = require('express').Router();
const passport = require('passport');
const uuid=require('uuid/v3');



let authKeys={};
let user

// auth logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) =>{
        console.log('redirecting')
        res.redirect('/')
        res.end()
    })
    // res.redirect('/');
    // res.end();
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
        console.log('Response: ', response)
        res.status(200).end(user);
        user = null;
    }).catch(err=>{
        res.status(500)
        .end("Error:"+JSON.stringify(err));
    });
})
// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/google/return', passport.authenticate('google'));
router.get('/google/return',function(req, res, next) {
    // console.log("SessionID:",req.session);
    // console.log("Response from google:",{query:req.query})
    authKeys[req.session.authId]({params:req.body,query:req.query});
    res.end('<script>window.close()</script>');
    user=JSON.stringify(req.session.passport.user)
    next();
});

module.exports = router;






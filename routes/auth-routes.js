const router = require('express').Router();
const passport = require('passport');
const uuid=require('uuid/v3');
const { postgresURL } = require("../config");
const request = require('request')



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
        .end("Error in /wait:"+JSON.stringify(err));
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

router.post('/update_activity', (req, res) => {
    console.log('Req in route update_activity: ',req)

    request.post({
     url: `http://localhost:5588/users/updateActivity`,
     form: {
       activity_id: req.body.id,
       activity_name: req.body.name,
       activity_color: req.body.color
     }

   }, (err, data) => {
     if(err){
       console.log('an Error has occurred!: ', err)
       res.status(500).send(err)
     }
     res.status(200).send(data);

   })
 })

module.exports = router;






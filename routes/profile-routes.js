const router = require('express').Router();


//Not used, left for reference
// const authCheck = (req, res, next) => {
//     if(!req.user){
//         res.redirect('/auth/login');
//     } else {
//         next();
//     }
// };

router.get('/', require("connect-ensure-login").ensureLoggedIn(),
(req, res) => {
    res.render('profile', { user: req.user });
});

module.exports = router;
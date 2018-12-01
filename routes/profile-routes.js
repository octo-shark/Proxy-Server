const router = require('express').Router();

const authCheck = (req, res, next) => {
  console.log('Auth Check')
    if(!req.user){
        res.redirect('/auth/login');
    } else {
        next();
    }
};

router.get('/', authCheck, (req, res) => {
  console.log('Lmao getting profile boi: ', req.user)
    res.render('profile', { user: req.user });
});

module.exports = router;
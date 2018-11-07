let express = require('express');
let router = express.Router();

router.get('/',ensureAutenticated,(req,res)=> {
    res.render('index');
});

function ensureAutenticated(req,res ,next)  {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users/login');
};

module.exports = router;
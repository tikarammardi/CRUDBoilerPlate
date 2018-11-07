let express = require('express');
let router = express.Router();

//Login Page - GET REQUEST
router.get('/login',(req,res)=> {
    res.send('Login Page');
})


//Register Page - GET REQUEST
router.get('/register',(req,res)=> {
    res.send('Register Page');
});


module.exports = router;
let express = require('express');
let router = express.Router();
let mongojs = require('mongojs');
let db = mongojs('passportapp',['users']);
let bcrypt = require('bcryptjs');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

//Login Page - GET REQUEST
router.get('/login',(req,res)=> {
    res.render('login');
})


//Register Page - GET REQUEST
router.get('/register',(req,res)=> {
    res.render('register');
});


//Register Page - POST REQUEST
router.post('/register',(req,res)=> {
  
    // Get Form Values
	let name     		= req.body.name;
	let email    		= req.body.email;
	let username 		= req.body.username;
	let password 		= req.body.password;
    let password2 		= req.body.password2;
    
    //Validation
    req.checkBody('name','Name field is required').notEmpty();
    req.checkBody('email','Email field is required').notEmpty();
    req.checkBody('email','Name field is required').isEmail();
    req.checkBody('username','Username field is required').notEmpty();
    req.checkBody('password','Name field is required').notEmpty();
    req.checkBody('password2','Password Do not match').equals(req.body.password);

    //check for errors
    let errors = req.validationErrors();
    if(errors) {
        console.log("Form has errors...........")
        res.render('register',{
            errors: errors,
            name: name,
            email: email,
            username: username,
            password: password,
            password2: password2
        })
    }else{
       let newUser = {
        name: name,
        email: email,
        username: username,
        password: password
       }
       bcrypt.genSalt(10,(err,salt)=> {
           bcrypt.hash(newUser.password, salt,(err,hash)=> {
               newUser.password = hash;
               db.users.insert(newUser,(err,doc)=> {
                if(err) {
                    res.send(err);
                }else {
                    console.log("User added .........")
                    //Our success message
                    req.flash('success', 'Your are registered and can now log in');
                 
                    //REdiredt after user registeration
                    res.location('/');
                    res.redirect('/');
                }
            });
           });
       });
   
    }

});

passport.serializeUser((user, done) =>{
    done(null, user._id);
  });
  
  passport.deserializeUser((id, done)=> {
   db.users.findOne({_id: mongojs.ObjectId(id)}, (err, user)=>{
       done(err, user);
   });
  });

//Sign in by grabbing username and password from the sign in page AND
//finding our the user by the username from the database and then
//Matching it's enctypted password with entered password
passport.use(new LocalStrategy(
    (username,password,done)=> {
        db.users.findOne({username: username},(err, user)=> {
            if(err) return done(err);

            if(!user) {
                return done(null,false,{message: 'Incorrect Username'});
            }
            bcrypt.compare(password, user.password,(err,isMatch)=> {
                if(err) return done(err);
                if(isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false,{message: 'Incorrect Password'});
                }
            });

        });
    }
));

//Login-POST
router.post('/login',
 passport.authenticate('local', { successRedirect: '/',
                                  failureRedirect: '/users/login',
                                  failureFlash:'Invalid Username or Password' }),
(req,res)=> {
console.log('Authentication Successful');
res.redirect('/');
});

router.get('/logout',(req,res)=> {
    req.logout();
    req.flash('success','You have Logged Out')
    res.redirect('/users/login');
    
})

module.exports = router;
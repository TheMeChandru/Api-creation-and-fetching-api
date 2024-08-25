const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');


const JWT_SECRET = 'karthik@good'

// Route 1: Create a User Using : POST "/api/auth/createuser"
router.post('/createuser', [
    body('name','Enter a valid Name').isLength({min :3}),
    body('email', 'Enter a valid Email').isEmail(),
    body('password','Password must be at least 5 character').isLength({min :5}),
] , async (req, res)=>{
    let success=false;

    // If there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({success, errors: errors.array()})
    }

    // check weather the user with this  email  exists already

    try{
    let user = await User.findOne({email: req.body.email});
    if(user){
        return res.status(400).json({success,error :"Sorry a User with this email already exists"})
    }

    const salt = await bcrypt.genSalt(10);
    const secPass= await bcrypt.hash(req.body.password, salt) 

    // create new User
     user= await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email
    }); 
    
    // .then(user => res.json(user))
    // .catch(err=> {console.log(err)
    //     res.json({error:'please enter a Unique value for email', message : err.message})
    // })

    const data ={
        user:{
            id: user.id
        }
    }

    const authToken = jwt.sign(data,JWT_SECRET)
    

    // res.json({"successful":"succes"})
    success = true;
    res.json({success,authToken})

} catch (error){
    console.error(error.message);
    res.status(500) .send("Some Error Occured");
}

})



// Route 2: Authenticate a user using POST "/api/auth/login" , no login required
router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password can not be Blank').exists(),

] , async (req, res)=>{
    let success=false;

// If there are errors return bad request and the errors
const errors = validationResult(req);
if (!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
}


const {email , password} = req.body;
try {
    
    let user = await User.findOne({email});
    if(!user){
        success=false;
        return res.status(400).json({error :"Please try to login with correct login credentials "});    
    }

    const passwordcompare = await bcrypt.compare(password, user.password);
    if(!passwordcompare){
        success=false;
        return res.status(400).json({success,error :"Please try to login with correct login credentials "});    

    }

    const data ={
        user:{
            id: user.id
        }
    }

    const authToken = jwt.sign(data,JWT_SECRET)
    success= true;
    res.json({success,authToken})

} catch (error){
    console.error(error.message);
    res.status(500) .send("internal Server Error");
}


})



// Route 3: Get logedin user details using POST "/api/auth/getuser" , login required
router.post("/getuser", fetchuser, async (req, res) => {
    try {
      
      const userId = req.user;
      const user = await User.findById(userId.id).select("-password");
      res.send(user);
  
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  });


module.exports = router
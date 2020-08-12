const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config');
const auth = require('../middleware/auth')
//const config = require("../config/default.json")
const {check, validationResult} = require('express-validator/check')

const User = require('../models/User')


//@route GET api/auth
//@description get logged in user
// @access private

router.get('/',auth, async(req,res)=>{
  try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user)
      
  } catch (err) {
      console.log(err.message)
      res.status(500).json({msg: 'server error'})
      
  }
})


router.post('/',
[
    check('email','Please include a valid email').isEmail(),
    check('password','password is required').exists()
],
async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
   const { email, password} = req.body;
try {
    //if email exists and find by email
    let user = await User.findOne({ email })

    if(!user) {
        return res.status(400).json({msg: 'invalid Credentials'})
    }
    //if password not matching
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(400).json({msg: 'invalid password'})
    }
 //object that saved in token :payload
 const payload= {
    user:{
        id:user.id
    }

};

   jwt.sign(payload, config.get('jwtSecret'),{expiresIn : 360000},
   (err,token)=>{
       if(err) throw err;
       res.json({token})
   })




} catch (err) {
console.log(err.message);
res.status(500).send('Server error')
}






})

//@route post api/auth
//@description auth user and get token
// @access public


module.exports = router
const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
//const config = require("../config/default.json")
const config = require('config');
const {check, validationResult} = require('express-validator/check')

const User = require('../models/User')


//@route post api/users
//@description register a user
// @access Public

router.post('/',
[
    check('name', 'Name is required').not().isEmpty(),
    check('email','Please enter a Valid email').isEmail(),
    check('password','Please enter a 6 or more character password').isLength({min:6})
],

async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    
    const { name, email, password} = req.body;
    
    try {
        //if user is exist
        let user = await User.findOne({email: email})
        if(user) {
            return res.status(400).json({msg: 'user already exists'})
        }

        //create a new user

        user = new User({
            name,
            email,
            password
        })

        const salt = await bcrypt.genSalt(10)

        user.password = await bcrypt.hash(password, salt)

        await user.save();
        
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

module.exports = router
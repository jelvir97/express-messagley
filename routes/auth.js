const express = require('express')
const router = express.Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const {SECRET_KEY} = require('../config')
const ExpressError = require('../expressError')

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async (req,res,next)=>{
    const username = req.body.username
    const password = req.body.password

    try{
        if(await User.authenticate(username,password)){
            const user = await User.get(username)
            const token = jwt.sign({user},SECRET_KEY)

            return res.json(token)
        }
        throw new ExpressError('No user found with that username and password',404)
    }catch(e){
        next(e)
    }
})
/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

module.exports = router

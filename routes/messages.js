const express = require('express')
const router = express.Router()
const Message = require('../models/message')
const {ensureLoggedIn} = require('../middleware/auth')
const ExpressError = require('../expressError')

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/


router.get('/:id', ensureLoggedIn, async (req,res,next)=>{
    try{
        const user = req.user.username
        const message = await Message.get(req.params.id)
        if(user==message.from_user.username || user==message.to_user.username) return res.json({message})
        throw new ExpressError('Unauthorized',401)
    }catch(e){
        next(e)
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn ,async function(req,res,next){
    try{
        const {to_username,body,} = req.body
        const from_username = req.user.username
        console.log(from_username)
        const message = await Message.create({from_username,to_username,body})

        return res.json({message})

    }catch(e){
        next(e)
    }
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read',ensureLoggedIn,async(req,res,next)=>{
    try{
        const msg = await Message.get(req.params.id)
        if(req.user.username !== msg.to_user.username) throw new ExpressError('Unauthorized', 401)
        const message = await Message.markRead(req.params.id)
        return res.json({message})
    }catch(e){
        next(e)
    }
})

module.exports = router
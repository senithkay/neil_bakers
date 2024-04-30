import express = require('express');
import User from "../models/User";
import {sendResponse} from "../utils/http";
import {logger} from "../utils/logger";
import {createToken} from "../utils/common";
import bcrypt from "bcrypt";
import {ErrorMessages} from "../utils/constants";

const router = express.Router();

router.post("/login", async (req, res) => {
   try{
       let error = undefined
       const user = await User.findOne({email: req.body.email})
       if (!user){
           res.status(401)
            sendResponse({}, res, ErrorMessages.INCORRECT_USERNAME_OR_PASSWORD);
            return
       }
       else{
           const isAuth = await bcrypt.compare(req.body.password, user.password)
           let data:any = {}
           if (!isAuth){
               error = ErrorMessages.INCORRECT_USERNAME_OR_PASSWORD
               res.status(401)
           }
           data = {_id: user._id, username: user.username, uLocation: user.uLocation, isSuperAdmin:user.isSuperAdmin}
           const token = createToken(user._id, user.uLocation, user.isSuperAdmin);
           res.cookie('jwt', token, {httpOnly: true, maxAge: process.env.JWT_MAX_AGE});
           sendResponse(data, res, error);
       }
   }
   catch (err){
       logger(err)
   }


})


router.post("/register", async (req, res) => {
    const user = new User({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
    })
    let error = undefined;
    let data:any = {}
    try{
         const savedUser= await user.save();
         const token = createToken(savedUser._id, savedUser.uLocation, savedUser.isSuperAdmin);
         res.cookie('jwt', token, {
             httpOnly: true,
             maxAge: process.env.JWT_MAX_AGE,
         })
        data = {_id: savedUser._id, username: savedUser.username}
    }
    catch(err){
        logger(err)
        error = (err as any)
    }
    sendResponse(data, res, error);
})

router.post("/logout", async (req, res) => {
    res.send('logout');
})

export default router;
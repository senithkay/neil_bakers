import express from "express";
import {logger} from "../utils/logger";
import {sendResponse} from "../utils/http";
import User from "../models/User";
import {createToken} from "../utils/auth";
import Product from "../models/Product";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Branch from "../models/Branch";

const router = express.Router();

router.get("/", async (req: express.Request, res: express.Response) => {
    let data:any = [];
    try{
        const cookies = req.cookies??{};
        const token = cookies.jwt;
        if (token){
            jwt.verify(token, process.env.JWT_SECRET, async (err:any, decoded:any) => {
                if (decoded.isSuperAdmin){
                    const users = await User.find({_id: { $ne: decoded.id } }).select('-password').populate('uLocation');
                    if (users){
                        data = users;
                    }
                    sendResponse(data, res, undefined);
                }
                else{
                    data = []
                    sendResponse(data, res, undefined);
                }
            })
        }
        else{
            sendResponse(data, res, 'User not found', 400);
        }
    }
    catch (err){
        logger(err);
    }
})

router.post("/", async (req: express.Request, res: express.Response) => {
    const user = new User({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        uLocation: req.body.location,
        isSuperAdmin:false
    })
    let responseStatus = 200
    let error = undefined;
    let data:any = {}
    try{
        const savedUser= await user.save();
        if (savedUser){
            data = savedUser
        }
    }
    catch(err){
        console.log(err)
        logger(err)
        error = (err as any)
        responseStatus = 500
    }
    sendResponse(data, res, error,  responseStatus)
})

router.put('/:id', async (req: express.Request, res: express.Response) => {
    const id = req.params.id;
    const changes = {
        email: req.body.email,
        username: req.body.username,
        uLocation: req.body.location,
    };
    let error = undefined;
    let data = {};
    let responseStatus = 200
    try {
        const updatedUser = await User.findByIdAndUpdate(id, changes, {new: true});
        if(updatedUser){
            data = updatedUser;
        }
    }catch (err){
        logger(err);
        error = err
        responseStatus = 500
    }
    sendResponse(data, res, error,  responseStatus)
})


router.delete('/:id', async (req: express.Request, res: express.Response) => {
    const id = new mongoose.Types.ObjectId(req.params.id);
    let error = undefined;
    let data = {};
    let responseStatus = 200
    try{
        const deletedUser = await User.findByIdAndDelete(id, {returnDocument: 'after'});
        if(deletedUser){
            data = deletedUser;
        }
    }
    catch(err){
        logger(err);
        error = err
        responseStatus = 500
    }
    sendResponse(data, res, error,  responseStatus)
})

export default router;
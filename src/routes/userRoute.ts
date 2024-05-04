import express from "express";
import {logger} from "../utils/logger";
import {sendResponse} from "../utils/http";
import User from "../models/User";
import {createToken} from "../utils/common";
import Product from "../models/Product";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req: express.Request, res: express.Response) => {
    let error = undefined;
    let data = {}
    try{
        const users = await User.find().populate('uLocation');
        if (users){
            data = users;
        }
    }
    catch (err){
        logger(err);
        error = err
    }
    sendResponse(data, res, error);
})

router.post("/", async (req: express.Request, res: express.Response) => {
    const user = new User({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        uLocation: req.body.location,
        isSuperAdmin:false
    })
    let error = undefined;
    let data:any = {}
    try{
        const savedUser= await user.save();
        if (savedUser){
            data = savedUser
        }
    }
    catch(err){
        logger(err)
        error = (err as any)
    }
    sendResponse(data, res, error);
})

router.put('/:id', async (req: express.Request, res: express.Response) => {
    const id = req.params.id;
    const changes = req.body;
    let error = undefined;
    let data = {};
    try {
        const updatedUser = await Product.findByIdAndUpdate(id, changes, {new: true});
        if(updatedUser){
            data = updatedUser;
        }
    }catch (err){
        logger(err);
        error = err
    }
    sendResponse(data, res, error);
})


router.delete('/:id', async (req: express.Request, res: express.Response) => {
    const id = new mongoose.Types.ObjectId(req.params.id);
    let error = undefined;
    let data = {};
    try{
        const deletedUser = await User.findByIdAndDelete(id, {returnDocument: 'after'});
        if(deletedUser){
            data = deletedUser;
        }
    }
    catch(err){
        logger(err);
        error = err
    }
    sendResponse(data, res, error);
})

export default router;
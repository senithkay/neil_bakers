import express from 'express'
import Branch from "../models/Branch";
import {sendResponse} from "../utils/http";
import {logger} from "../utils/logger";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const router = express.Router()

router.get('/', async (req: express.Request, res: express.Response) => {
    let data:any = [];
    let error = undefined;
    try{
        const cookies = req.cookies??{};
        const token = cookies.jwt;
        if (token){
            jwt.verify(token, process.env.JWT_SECRET, async (err:any, decoded:any) => {

                if (decoded.isSuperAdmin){
                    data = await Branch.find()
                }
                else{
                    data.push(await Branch.findOne({_id: decoded.uLocation}))
                }
                sendResponse(data, res, undefined, 200);
            })

        }
        else{
            sendResponse(data, res, 'Unauthorized user', 401);
        }

    }
    catch (err){
        logger(err)
        error = err
        sendResponse(data, res, error, 500);
    }

})

router.post('/', async (req: express.Request, res: express.Response) => {
    let error = undefined;
    let data = {};
    const branch = new Branch(req.body);
    let responseStatus = 200
    try{
        const savedBranch = await branch.save();
        if(savedBranch){
            data = savedBranch;
        }
    }catch (err){
        logger(err)
        error = err;
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
        const deletedBranch = await Branch.findByIdAndDelete(id, {returnDocument: 'after'});
        if(deletedBranch){
            data = deletedBranch;
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
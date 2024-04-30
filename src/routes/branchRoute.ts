import express from 'express'
import Branch from "../models/Branch";
import {sendResponse} from "../utils/http";
import {logger} from "../utils/logger";
import jwt from "jsonwebtoken";

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
                    data = await Branch.findOne({_id: decoded.uLocation})
                }
                sendResponse(data, res, undefined);
            })

        }
    }
    catch (err){
        logger(err)
        error = err
        sendResponse(data, res, error);
    }

})

router.post('/', async (req: express.Request, res: express.Response) => {
    let error = undefined;
    let data = {};
    const branch = new Branch(req.body);
    try{
        const savedBranch = await branch.save();
        if(savedBranch){
            data = savedBranch;
        }
    }catch (err){
        logger(err)
        error = err;
    }
    sendResponse(data, res, error);
})

export default router;
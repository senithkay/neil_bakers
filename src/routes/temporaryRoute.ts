import express from "express";
import {logger} from "../utils/logger";
import {sendResponse} from "../utils/http";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = express.Router();

router.get("/user", async  (req: express.Request, res: express.Response) => {
    let error = undefined;
    let data:any = {}
    try{
        const cookies = req.cookies??{};
        const token = cookies.jwt;
        if (token){
            jwt.verify(token, process.env.JWT_SECRET, async (err:any, decoded:any) => {
                const userId = decoded.id
                data = await User.findById(userId);
                sendResponse(data, res, undefined);
            })
        }
        else{

        }
    }catch (err){
        logger(err);
        error = err
        sendResponse(data, res, error);
    }

})

export default router;
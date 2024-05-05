import express from 'express'
import {logger} from "../utils/logger";
import {sendResponse} from "../utils/http";
import Branch from "../models/Branch";

const router = express.Router()

router.get('/', async (req: express.Request, res: express.Response) => {
    let error = undefined;
    let data = {}
    let responseStatus = 200
    try{
        const locations = await Branch.distinct('branchLocation')
        if(locations){
            data = locations;
        }
    }
    catch (err){
        logger(err);
        error = err
        responseStatus = 500
    }
    sendResponse(data, res, error,  responseStatus)

})


export default router
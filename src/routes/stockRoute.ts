import express from "express";
import Branch from "../models/Branch";
import Stock from "../models/Stock";
import mongoose from "mongoose";
import {logger} from "../utils/logger";
import {sendResponse} from "../utils/http";

const router = express.Router();

router.get("/:id", async (req: express.Request, res: express.Response) => {
   let error = undefined;
   let data:any[] = [];
   try{
       const branch = await Branch.findById(req.params.id).populate('stocks');
       if (branch) {
           data = branch.stocks
       }
   }
   catch (err){
       logger(err);
       error = err;
   }
   sendResponse(data, res, error);

})

router.post("/", async (req: express.Request, res: express.Response) => {
    let error = undefined
    let data = {};
    const session = await mongoose.startSession();
    session.startTransaction()
    try{
        const branch = await Branch.findById(req.body.branchId);
        if (!branch) {
            throw new Error('Branch not found');
        }
        const newStock = new Stock(req.body.stock)
        const insertedStock = await newStock.save();

        if (!insertedStock) {
            throw new Error('Stock creation failed');
        }
        branch.stocks.push(newStock._id);
        await branch.save();
        await session.commitTransaction();
        await session.endSession()
        data = branch
    }
    catch (err){
        logger(err)
        await session.abortTransaction();
        await session.endSession();
        error = err
    }
    sendResponse(data, res, error);
})


router.put("/:id", async (req: express.Request, res: express.Response) => {
    let error = undefined
    let data = {};
    try{
        const receivedData = req.body
        const changes = new Stock(req.body)
        const updatedStock = await Stock.findByIdAndUpdate(req.params.id, {}, {new: true});
        if (updatedStock){
            data = updatedStock
        }
    }
    catch (err){
        logger(err)
        error = err
    }
    sendResponse(data, res, error);
})

export default router;
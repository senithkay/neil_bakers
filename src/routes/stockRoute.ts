import express from "express";
import Branch from "../models/Branch";
import Stock from "../models/Stock";
import mongoose from "mongoose";
import {logger} from "../utils/logger";
import {sendResponse} from "../utils/http";
import Product from "../models/Product";

const router = express.Router();

router.get("/:id", async (req: express.Request, res: express.Response) => {
   let error = undefined;
   let data:any[] = [];
   try{
       const branch = await Branch.findById(req.params.id).populate({ path: 'stocks', populate: { path: 'productId', select: 'productName' } });
       if (branch && branch.stocks) {
           data = branch.stocks
       }
   }
   catch (err){
       logger(err);
       error = err;
   }
   sendResponse(data, res, error);

})

router.get("/:id/:date", async (req: express.Request, res: express.Response) => {
    let error = undefined;
    let data:any[] = [];
    try{
        const branch = await Branch.findById(req.params.id).populate('stocks');

        if (branch) {
            if (req.params.date === null || req.params.date === undefined || req.params.date === ' '){
                console.log(true)
            }
            if (req.params.date && req.params.date !== '') {
                data = branch.stocks.filter((stock:any) => {
                    stock.populate('productId')
                    return stock.date === req.params.date
                });
            }
        }
    }
    catch (err){
        logger(err);
        error = err;
    }
    sendResponse(data, res, error);

})

router.get("/:id/:fromDate/:toDate", async (req: express.Request, res: express.Response) => {
    let error = undefined;
    let data:any[] = [];
    try{
        const branch = await Branch.findById(req.params.id).populate('stocks');

        if (branch) {
            if (req.params.date && req.params.date !== '') {
                data = branch.stocks.filter((stock:any) => {
                    stock.populate('productId')
                    return ((stock.date >= req.params.fromDate && stock.date <= req.params.toDate) || stock.date === req.params.fromDate);
                });
            }
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
    let stocks: any[] = []
    try{
        const branch = await Branch.findById(req.body.branchId).populate('stocks');
        if (!branch) {
            throw new Error('Branch not found');
        }
        if (branch.stocks !== undefined){
            stocks = branch.stocks
        }

        const existingStock =  stocks.find((stock:any) => (stock.productId == req.body.stock.productId && stock.date == req.body.stock.date));
        const newStock = new Stock(req.body.stock);
        let insertedStock = {}
        if(existingStock){
            const changes = {
                date:newStock.date,
                availableStock: newStock.availableStock,
                remainingStock:newStock.remainingStock,
                pricePerUnit:newStock.pricePerUnit
            }
            const updatedData = await Stock.findByIdAndUpdate(existingStock._id, changes, {new:true})
            if(updatedData){
                insertedStock = updatedData
                res.status(200)
            }
        }
        else{
            insertedStock = await newStock.save()
            res.status(201)
        }

        if (!insertedStock) {
            throw new Error('Stock creation failed');
        }

        branch.stocks.push(newStock._id);
        await branch.save();
        await session.commitTransaction();
        await session.endSession()
        const insertedSchemaObject = new Stock(insertedStock)
        data = await insertedSchemaObject.populate({path:'productId', select: 'productName'});

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
        const updatedStock = await Stock.findByIdAndUpdate(req.params.id, receivedData, {new: true});
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

router.delete("/:id", async (req: express.Request, res: express.Response) => {
    let error = undefined
    let data = {};
    try{
        const deletedStock = await Stock.findByIdAndDelete(req.params.id, {returnDocument: 'after'});
        if (deletedStock){
            data = deletedStock
        }
    }
    catch (err){
        logger(err)
        error = err
    }
    sendResponse(data, res, error);
})


export default router;
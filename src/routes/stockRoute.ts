import express from "express";
import Branch from "../models/Branch";
import Stock from "../models/Stock";
import mongoose from "mongoose";
import {logger} from "../utils/logger";
import {sendResponse} from "../utils/http";

const router = express.Router();

//Todo Remove this
// router.get("/:id", async (req: express.Request, res: express.Response) => {
//    let error = undefined;
//    let data:any[] = [];
//     let responseStatus = 200
//    try{
//        const branch = await Branch.findById(req.params.id).populate({ path: 'stocks', populate: { path: 'productId', select: 'productName' } });
//        if (branch && branch.stocks) {
//            data = branch.stocks
//        }
//    }
//    catch (err){
//        logger(err);
//        error = err;
//        responseStatus = 500
//    }
//     sendResponse(data, res, error,  responseStatus)
//
// })

router.get('/:id/:date', async(req: express.Request, res: express.Response) => {
    let data = {};
    let error = undefined;
    let date = req.params.date;
    if(req.params.date === undefined || req.params.date === null){}
    let responseStatus = 200
    try{
        const branch = await Branch.findById(req.params.id).populate({path: 'stocks', populate: { path: 'productId', select: 'productName' }} );
        if (branch){
            const stocks = branch.stocks
            const filteredData: any = []
            stocks.forEach((stock:any) => {
                if (stock.date === date){
                    filteredData.push(stock)
                }
            })
            data=filteredData;
        }
        else{
            error = 'Invalid branch ID'
            responseStatus = 400
        }
    }catch(err){
        logger(err);
        error = err;
    }
    sendResponse(data, res, error,  responseStatus)
})

router.get("/:id/:date", async (req: express.Request, res: express.Response) => {
    let error = undefined;
    let data:any[] = [];
    let responseStatus = 200
    try{
        const branch = await Branch.findById(req.params.id).populate('stocks');

        if (branch && req.params.date && req.params.date !== '') {
            data = branch.stocks.filter((stock: any) => {
                stock.populate('productId')
                return stock.date === req.params.date
            });
        }
        else{
            error = 'Invalid dates'
            responseStatus = 400
        }
    }
    catch (err){
        logger(err);
        error = err;
        responseStatus = 500
    }
    sendResponse(data, res, error,  responseStatus)

})

router.get("/:id/:fromDate/:toDate", async (req: express.Request, res: express.Response) => {
    let error = undefined;
    let data:any[] = [];
    let responseStatus = 200
    try{
        const branch = await Branch.findById(req.params.id).populate('stocks');

        if (branch && req.params.date && req.params.date !== '') {
            data = branch.stocks.filter((stock: any) => {
                stock.populate('productId')
                return ((stock.date >= req.params.fromDate && stock.date <= req.params.toDate) || stock.date === req.params.fromDate);
            });
        }
        else{
            responseStatus = 400
            error = 'Invalid Dates'
        }
    }
    catch (err){
        logger(err);
        error = err;
        responseStatus = 500
    }
    sendResponse(data, res, error,  responseStatus)

})

router.post("/", async (req: express.Request, res: express.Response) => {
    let error = undefined
    let data = {};
    const session = await mongoose.startSession();
    session.startTransaction()
    let responseStatus = 200
    let stocks: any[] = []
    try{
        const branch = await Branch.findById(req.body.branchId).populate('stocks');
        if (!branch) {
            sendResponse(data, res, 'Branch Not Found', 400);
            return
        }
        if (branch.stocks === undefined){
            stocks = []
        }
        stocks = branch.stocks
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
            }
        }
        else{
            insertedStock = await newStock.save()
            responseStatus = 201
        }

        if (!insertedStock) {
            sendResponse(data, res, 'Failed creating stock', 500);
            return
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
        responseStatus = 500
    }
    sendResponse(data, res, error, responseStatus);
})


router.put("/:id", async (req: express.Request, res: express.Response) => {
    let error = undefined
    let data = {};
    let responseStatus = 200
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
        responseStatus = 500
    }
    sendResponse(data, res, error,  responseStatus)
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
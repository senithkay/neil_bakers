import express from 'express'
import Product from "../models/Product";
import {logger} from "../utils/logger";
import {sendResponse} from "../utils/http";
import product from "../models/Product";

const router = express.Router();

router.post('/', async (req: express.Request, res: express.Response) => {
    const product = new Product(req.body);
    let error = undefined;
    let data = {}
    try{
        const savedProduct = await product.save();
        if(savedProduct){
            data = savedProduct;
        }
    }
    catch (err){
        logger(err);
        error = err;
    }
    sendResponse(data, res, error);
})


router.get('/', async (req: express.Request, res: express.Response) => {
    let data:any = []
    let error = undefined;
    try {
        const products = await Product.find();
        if (products){
            data = products
        }
    }
    catch (err){
        logger(err)
        error = err;
    }
    sendResponse(data, res, error);
})

router.put('/:id', async (req: express.Request, res: express.Response) => {
    const id = req.params.id;
    const changes = req.body;
    let error = undefined;
    let data = {};
    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, changes, {new: true});
        if(updatedProduct){
            data = updatedProduct;
        }
    }catch (err){
        logger(err);
        error = err
    }
    sendResponse(data, res, error);
})

router.delete('/:id', async (req: express.Request, res: express.Response) => {
    const id = req.params.id;
    let error = undefined;
    let data = {};
    try{
        const deletedProduct = await Product.findByIdAndDelete(id, {returnDocument: 'after'});
        if(deletedProduct){
            data = deletedProduct;
        }
    }
    catch(err){
        logger(err);
        error = err
    }
    sendResponse(data, res, error);
})

router.get('/price/:id', async (req: express.Request, res: express.Response) => {
    let data = {}
    let error = undefined;
    try{
        const product = await Product.findById(req.params.id);
        if (product){
            data = {productId: product._id, price:product.price}
        }
    }
    catch (err){
        logger(err)
        error = err
    }
    sendResponse(data, res, error);
})

export default router;
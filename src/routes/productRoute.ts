import express from 'express'
import Product from "../models/Product";
import {logger} from "../utils/logger";
import {sendResponse} from "../utils/http";
import multer from 'multer';
import {Error} from "mongoose";
import Stock from "../models/Stock";
import User from "../models/User";

const router = express.Router();

const getFileName = (originalName : string)=> {
    return Date.now() + '_' + originalName
}

const storage = multer.diskStorage({
    destination: (req: express.Request, file, callback: (error: Error | null, destination: string) => void) => {
        callback(null, './src/public/images');
    },
    filename(req: express.Request, file: Express.Multer.File, callback: (error: (Error | null), filename: string) => void) {
        callback(null, getFileName(file.originalname))
    }

})
const uploadProductImage = multer({ storage });

router.post('/', uploadProductImage.single('image'),async (req: express.Request, res: express.Response) => {
    req.body.image = getFileName(req.file?.originalname??'default');
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
    const changes = {
        productName: req.body.productName,
        description: req.body.description,
        price: req.body.price,
        sku: req.body.sku,
    };
    let error = undefined;
    let data = {};
    let responseStatus = 200
    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, changes, {new: true});
        if(updatedProduct){
            data = updatedProduct;
        }
    }catch (err){
        logger(err);
        error = err
        responseStatus = 500
    }
    sendResponse(data, res, error,  responseStatus)
})

router.delete('/:id', async (req: express.Request, res: express.Response) => {
    const id = req.params.id;
    let error = undefined;
    let data = {};
    let responseStatus = 200
    try{
        const deletedProduct = await Product.findByIdAndDelete(id, {returnDocument: 'after'});
        const stocks = await Stock.deleteMany({productId:id});
        if(deletedProduct){
            data = deletedProduct;
        }
    }
    catch(err){
        logger(err);
        error = err
        responseStatus = 500
    }
    sendResponse(data, res, error,  responseStatus)
})

router.get('/price/:id', async (req: express.Request, res: express.Response) => {
    let data = {}
    let error = undefined;
    let responseStatus = 200
    try{
        const product = await Product.findById(req.params.id);
        if (product){
            data = {productId: product._id, price:product.price}
        }
    }
    catch (err:any){
        logger(err)
        if (err.errorResponse.code == 11000){
            error = {_message:"Product needs to be unique"}
        }
        else{
            error = err
        }
        responseStatus = 500
    }
    sendResponse(data, res, error,  responseStatus)
})

export default router;
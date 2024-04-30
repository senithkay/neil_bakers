import mongoose from 'mongoose';

const Schema = mongoose.Schema;

interface IProduct extends Document {
    productName: string;
    sku: string;
    price:number;
    description: string;
    image: string;
}

const productSchema = new Schema({
    productName: {
        type: String,
        required: [true, "Product name is required"],
        unique: [true, "Another product with the same name is already exists"],
    },
    sku: {
        type: String,
        unique: [true, "Another product with the same SKU is already exists"],
    },
    price: {
        type: String,
        required: [true, "Price of the product is required"],
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
})

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
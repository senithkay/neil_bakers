import mongoose, {ObjectId} from "mongoose";

const Schema = mongoose.Schema;

export interface IStock extends Document {
    productId: mongoose.Types.ObjectId;
    date:string;
    availableStock:number;
    remainingStock:number;
    pricePerUnit:number;
}
const stockSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        unique: [true, 'A stock related to this product is already exists'],
        required: [true, 'Product is required for a stock'],
    },
    date: {
        type: String,
    },
    availableStock: {
        type: Number,
        required: [true, 'A stock should have an available stock'],
    },
    remainingStock: {
        type: Number,
        required: [true, 'A stock should have a remaining stock'],
    },
    pricePerUnit : {
        type: Number,
        required: [true, 'A stock should have a price per unit value'],
    }
})

const Stock = mongoose.model<IStock>('stock', stockSchema);
export default Stock
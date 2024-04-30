import mongoose from "mongoose";
import {IStock} from "./Stock";

const Schema = mongoose.Schema;

interface IBranch extends Document {
    name: string;
    branchLocation:string;
    stocks: Array<mongoose.Types.ObjectId>;
}

const branchSchema = new Schema({
    name: {
        type: String,
        unique: [true, 'A branch with this name is already exists'],
        required: [true, 'Branch name is required'],
    },
    branchLocation: {
        type: String,
        required: [true, 'Location of the branch is mandatory'],
    },
    stocks: [{ type: Schema.Types.ObjectId, ref: 'stock' }]
})

const Branch = mongoose.model<IBranch>('branch', branchSchema);
export default Branch
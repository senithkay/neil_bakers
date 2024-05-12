import mongoose from "mongoose";
import {IStock} from "./Stock";
import express from "express";
import User from "./User";
import {logger} from "../utils/logger";
import {sendResponse} from "../utils/http";
import router from "../routes/userRoute";

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
    },
    stocks: [{ type: Schema.Types.ObjectId, ref: 'stock' }]
})

const Branch = mongoose.model<IBranch>('branch', branchSchema);
export default Branch
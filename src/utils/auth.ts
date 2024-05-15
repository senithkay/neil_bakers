import jwt from 'jsonwebtoken'
import mongoose, {Schema, Types} from "mongoose";

export const createToken = (id: Types.ObjectId, uLocation:mongoose.Types.ObjectId[], isSuperAdmin:boolean) => {
    return jwt.sign({id:id, uLocation:uLocation, isSuperAdmin: isSuperAdmin}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_MAX_AGE,
    })
}

export const createFakeToken = () => {
    return jwt.sign({}, process.env.JWT_SECRET, {
        expiresIn: 1,
    })
}
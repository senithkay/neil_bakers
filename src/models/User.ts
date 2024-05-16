import * as mongoose from "mongoose";
import bcrypt from 'bcrypt'

const Schema = mongoose.Schema;

interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    uLocation:Array<mongoose.Types.ObjectId>;
    isSuperAdmin: boolean;
}

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "The email address has to be unique"],
        index: [true]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "The username address has to be unique"],
        index: [true]
    },
    uLocation: [{ type: Schema.Types.ObjectId, ref: 'branch'}],
    isSuperAdmin: {
        type: Boolean,
        required: [true, "isSuperAdmin is required"],
    }
})
userSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next()
})



const User = mongoose.model<IUser>('User', userSchema);
export default User;

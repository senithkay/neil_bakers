import * as mongoose from "mongoose";


const connectDB = async () => {
    mongoose.set('strictQuery', false)
    const mongoDb = 'mongodb+srv://senithkarunarathneu:passwordekakne@nc.mdruunp.mongodb.net/?retryWrites=true&w=majority&appName=nc'
    try {
        return await mongoose.connect(mongoDb);
    }
    catch(err) {
        throw err;
    }
}

export default connectDB;
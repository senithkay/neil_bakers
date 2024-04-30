import express from 'express'
import authRoute from "./routes/authRoute";
import connectDB from "./database/connection";
import dotenv from "dotenv";
import authorize from "./middlewares/authMiddleware";
import cookieParser from 'cookie-parser'
import productRoutes from "./routes/productRoute";
import branchRoute from "./routes/branchRoute";
import locationRoute from "./routes/locationRoute";
import userRoute from "./routes/userRoute";
import mailingRoute from "./routes/mailingRoute";
import stockRoute from "./routes/stockRoute";

const app = express();
app.use(cookieParser());
dotenv.config()
app.use(express.json());
app.use(express.json())
app.use(authorize);


app.use('/auth', authRoute);
app.use('/product', productRoutes);
app.use('/branch', branchRoute);
app.use('/location', locationRoute);
app.use('/user', userRoute);
app.use('/sendmail' , mailingRoute)
app.use('/stock', stockRoute)

connectDB().then(()=>console.log("Database connected successfully.")).catch((err)=>console.log(err));
app.listen(process.env.PORT || 8080,
    () => {
        console.log(`Server started on f http://localhost:${process.env.PORT}`);
    }
);

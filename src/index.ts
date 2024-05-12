import express from 'express'
import authRoute from "./routes/authRoute";
import authorize from "./middlewares/authMiddleware";
import cookieParser from 'cookie-parser'
import productRoutes from "./routes/productRoute";
import branchRoute from "./routes/branchRoute";
import locationRoute from "./routes/locationRoute";
import userRoute from "./routes/userRoute";
import mailingRoute from "./routes/mailingRoute";
import stockRoute from "./routes/stockRoute";
import stockReportRoute from "./routes/stockReportRoute";
import cors from 'cors'
import temporaryRoute from "./routes/temporaryRoute";
import dashboardRoute from "./routes/dashboardRoute";
import {startup} from "./utils/startup";
import pdfGeneratorRoute from "./routes/pdfGeneratorRoute";



startup()
const app = express();

app.use(cors({
    origin: true,
    credentials: true,
}))
app.use(cookieParser());
app.use(express.json({ limit: '25mb' }));
app.use(authorize);
app.use(express.static('src/public/'))

app.use('/auth', authRoute);
app.use('/product', productRoutes);
app.use('/branch', branchRoute);
app.use('/location', locationRoute);
app.use('/user', userRoute);
app.use('/sendmail' , mailingRoute);
app.use('/stock', stockRoute);
app.use('/report', stockReportRoute);
app.use('/temporary', temporaryRoute);
app.use('/dashboard', dashboardRoute);
app.use('/pdfGenerator', pdfGeneratorRoute);


app.listen(process.env.PORT || 8080,
    () => {
        console.log(`[INFO] Server started on http://localhost:${process.env.PORT}`);
    }
);


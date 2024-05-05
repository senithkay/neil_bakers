"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const authMiddleware_1 = __importDefault(require("./middlewares/authMiddleware"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const productRoute_1 = __importDefault(require("./routes/productRoute"));
const branchRoute_1 = __importDefault(require("./routes/branchRoute"));
const locationRoute_1 = __importDefault(require("./routes/locationRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const mailingRoute_1 = __importDefault(require("./routes/mailingRoute"));
const stockRoute_1 = __importDefault(require("./routes/stockRoute"));
const stockReportRoute_1 = __importDefault(require("./routes/stockReportRoute"));
const cors_1 = __importDefault(require("cors"));
const temporaryRoute_1 = __importDefault(require("./routes/temporaryRoute"));
const dashboardRoute_1 = __importDefault(require("./routes/dashboardRoute"));
const startup_1 = require("./utils/startup");
(0, startup_1.startup)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '25mb' }));
app.use(authMiddleware_1.default);
app.use(express_1.default.static('src/public/'));
app.use('/auth', authRoute_1.default);
app.use('/product', productRoute_1.default);
app.use('/branch', branchRoute_1.default);
app.use('/location', locationRoute_1.default);
app.use('/user', userRoute_1.default);
app.use('/sendmail', mailingRoute_1.default);
app.use('/stock', stockRoute_1.default);
app.use('/report', stockReportRoute_1.default);
app.use('/temporary', temporaryRoute_1.default);
app.use('/dashboard', dashboardRoute_1.default);
app.listen(process.env.PORT || 8080, () => {
    console.log(`[INFO] Server started on http://localhost:${process.env.PORT}`);
});

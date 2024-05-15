import path from "path";
import fs from "fs-extra";
import handlebars from "handlebars";
import {logger} from "./logger";

const TEMPLATE_DIR = path.resolve(__dirname, '../../reportTemplates/');

export const compileReport = async (templateName : string , data : any) => {
    const filePath = path.join(TEMPLATE_DIR, templateName);
    const html = await fs.readFile(filePath, 'utf-8');
    const logoBase64 = base64Encode('./src/public/lh.jpg');
    return handlebars.compile(html.replace('${logoBase64}', logoBase64))(data.map((item : any) => {
        const newItem = {...item,pricePerUnit: parseFloat(item.pricePerUnit).toFixed(2),totalPrice:parseFloat(item.totalPrice).toFixed(2)};
        return newItem;
    }));
}
function base64Encode(file: fs.PathOrFileDescriptor) {
    try{
        const bitmap = fs.readFileSync(file);
        return Buffer.from(bitmap).toString('base64');
    }
    catch (error){
        logger(`[error] file : ${file} not found`)
        return ''
    }
}
import path from "path";
import fs from "fs-extra";
import handlebars from "handlebars";

const TEMPLATE_DIR = path.resolve(__dirname, '../../reportTemplates/');

export const compileReport = async (templateName : string , data : any) => {
    const filePath = path.join(TEMPLATE_DIR, templateName);
    const html = await fs.readFile(filePath, 'utf-8');
    return handlebars.compile(html)(data);
}

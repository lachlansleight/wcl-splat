import { NextApiRequest, NextApiResponse } from "next";
import { NextRestApiRoute, RestError } from "lib/NextRestApiRoute";
import WCL from "lib/WCL";
import { AnalysisTableName } from "lib/WclTypes";

const api = new NextRestApiRoute("/fight");

api.post = async (req, res) => {
    if (!req.query.apiKey) throw new RestError("No API key provided", 400);
    if (!req.query.boss) throw new RestError("No boss ID provided", 400);
    if (!req.query.attempt) throw new RestError("No attempt ID provided", 400);
    if (!req.body.processedReport) throw new RestError("No raw fight data provided", 400);
    const boss = Number(req.query.boss);
    const tableName = req.query.table as AnalysisTableName;
    const attempt = req.query.attempt === "all" ? "all" : Number(req.query.attempt);
    const tableData = await WCL.getAnalysisPage(
        req.query.apiKey as string,
        req.body.processedReport,
        boss,
        tableName,
        attempt
    );
    res.status(200).json(tableData);
};

export default (req: NextApiRequest, res: NextApiResponse) => api.handle(req, res);

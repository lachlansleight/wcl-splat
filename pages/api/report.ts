import { NextApiRequest, NextApiResponse } from "next";
import { NextRestApiRoute, RestError } from "lib/NextRestApiRoute";
import WCL from "lib/WCL";

const api = new NextRestApiRoute("/report");

api.get = async (req, res) => {
    if (!req.query.reportId) throw new RestError("Missing report ID", 400);
    if (!req.query.apiKey) throw new RestError("No API key provided", 400);
    const report = await WCL.getLog(req.query.apiKey as string, req.query.reportId as string);
    res.status(200).json(report);
};

export default (req: NextApiRequest, res: NextApiResponse) => api.handle(req, res);

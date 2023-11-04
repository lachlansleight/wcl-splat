import { NextApiRequest, NextApiResponse } from "next";
import { NextRestApiRoute, RestError } from "lib/NextRestApiRoute";
import WCL from "lib/WCL";

const api = new NextRestApiRoute("/fight");

api.post = async (req, res) => {
    if (!req.query.apiKey) throw new RestError("No API key provided", 400);
    if (!req.query.reportId) throw new RestError("No report ID provided", 400);
    if (!req.body.rawFight) throw new RestError("No raw fight data provided", 400);
    const processedFight = await WCL.getProcessedFight(
        req.query.apiKey as string,
        req.query.reportId as string,
        req.body.rawFight
    );
    res.status(200).json(processedFight);
};

export default (req: NextApiRequest, res: NextApiResponse) => api.handle(req, res);

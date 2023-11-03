import { NextApiRequest, NextApiResponse } from "next";
import { NextRestApiRoute, RestError } from "lib/NextRestApiRoute";
import WCL from "lib/WCL";

const api = new NextRestApiRoute("/bombs");

api.post = async (req, res) => {
    if(!req.body.report) throw new RestError("Missing report", 400);
    if(!req.query.apiKey) throw new RestError("No API key provided",400);
    if(!req.query.fightIndex) throw new RestError("No fight index provided", 400);
    const report = await WCL.getBombInfo(req.query.apiKey as string, req.body.report, Number(req.query.fightIndex || ""));
    res.status(200).json(report);
};

export default (req: NextApiRequest, res: NextApiResponse) => api.handle(req, res);
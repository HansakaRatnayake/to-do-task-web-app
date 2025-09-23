import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StandardResponse } from "../util/StandardResponse";

export interface AuthRequest extends Request {
    userId?: string;
}


export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token = req.headers.authorization;

    if (!token) return res.status(401).json(new StandardResponse(401, "No token provided", null));

    if(!token.startsWith("Bearer ")) return res.status(401).json(new StandardResponse(401, "Invalid token format", null));

    token = token.split(" ")[1];

    if (!token) return res.status(401).json(new StandardResponse(401, "No token provided", null));

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET || "") as { id: string };
        req.userId = decode.id;
        next();

    }catch(err:any){
        return res.status(401).json(new StandardResponse(401, "Invalid token", err.message));
    }
}

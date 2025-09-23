import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import {PrismaClient} from '@prisma/client';
import { v4 as uuidV4 } from 'uuid';
import { StandardResponse } from "../util/StandardResponse";
import {generateOTP} from "../util/OtpGenerator";
import {sendOtpMail} from "../util/mailer";

const prisma = new PrismaClient();

export const singUp = async (req:Request, res:Response) => {
    const {username, email, password, gender} = req.body;

    //validation missing fields
    if (!username || !email || !password || !gender) return res.status(400).json(new StandardResponse(400, "Missing required fields.", null));

    const hashedPassword = await bcrypt.hash(password, 12);

    let user;
    const timeStamp =  Date.now();
    try{
        user = await prisma.applicationUser.create({
            data:{
                id: uuidV4(),
                username,
                email,
                createdAt : new Date(timeStamp),
                password:hashedPassword,
                genderId:gender,

            },
        })

        const otpCode = generateOTP();
        const expiresAt = timeStamp + (5 * 60 * 1000);

        await prisma.otp.create({
            data:{
                id:uuidV4(),
                createdAt:new Date(timeStamp),
                otp:otpCode,
                expiresAt:new Date(expiresAt),
                userId:user.id
            }
        })

        await sendOtpMail(email, otpCode);

        res.status(201).json(new StandardResponse(201, "User created", null));
    }catch(err:any){
        res.status(400).json(new StandardResponse(400, "User already exist!", null));
    }
}

export const verifyOtp = async (req:Request,res:Response) => {
    const {email, otp} = req.body;

    //validation missing fields
    if (!email || !otp) return res.status(400).json(new StandardResponse(400, "Missing required fields.", null));

    try{
        const user = await prisma.applicationUser.findUnique({
            where:{email}
        });

        if (!user) return res.status(404).json(new StandardResponse(404, "User not found!",null));

        const otpRecord = await prisma.otp.findFirst({
            where:{
                userId:user.id,
                otp:otp,
                isUsed:false,
                expiresAt:{gte:new Date()},
            }
        });

        if (!otpRecord) return res.status(400).json(new StandardResponse(400, "Invalid or expired OTP!",null));

        await prisma.otp.update({
            where:{id:otpRecord.id},
            data:{isUsed:true},
        });

        await prisma.applicationUser.update({
            where:{id:user.id},
            data:{
                isAccountVerified:true,
                verifiedAt:new Date()
            },
        })

        res.status(200).json(new StandardResponse(200, "Account verified successfully", null));
    }catch(err:any){
        res.status(500).json(new StandardResponse(500, "Internal Server error", null));
    }
}

const login =  async (req:Request, res:Response) => {

}
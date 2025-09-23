import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import {PrismaClient} from '@prisma/client';
import { v4 as uuidV4 } from 'uuid';
import { StandardResponse } from "../util/StandardResponse";
import {generateOTP} from "../util/OtpGenerator";
import {sendOtpMail} from "../util/mailer";

const prisma = new PrismaClient();

export const login =  async (req:Request, res:Response) => {
    const {email,password} = req.body;

    const user = await prisma.applicationUser.findUnique({where:{email:email}});

    if(!user) return res.status(400).json(new StandardResponse(400, 'Invalid credentials', null));

    const valid = await bcrypt.compare(password, user.password);
    if(!valid) return res.status(400).json(new StandardResponse(400, 'Invalid credentials', null));

    const token = jwt.sign({id:user.propertyId}, process.env.JWT_SECRET || "bmxpU2FqZXVuYmVjWE1FSkpHZ1ZXY0hFSThtTzFnUHlXcVRqaG9uWTc5RDZIT1NZUXlhcm5uaWQ5Y2N1V1dJMQ==", {
        expiresIn : "1d"
    })

    res.status(200).json(new StandardResponse(
        200,
        "Login Successful",
        {
            token,
            userId:user.propertyId,
            username:user.username, email:user.email
        })
    );
}

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
                propertyId: uuidV4(),
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
                propertyId:uuidV4(),
                createdAt:new Date(timeStamp),
                otp:otpCode,
                expiresAt:new Date(expiresAt),
                userId:user.propertyId
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
                userId:user.propertyId,
                otp:otp,
                isUsed:false,
                expiresAt:{gte:new Date()},
            }
        });

        if (!otpRecord) return res.status(400).json(new StandardResponse(400, "Invalid or expired OTP!",null));

        await prisma.otp.update({
            where:{propertyId:otpRecord.propertyId},
            data:{isUsed:true},
        });

        await prisma.applicationUser.update({
            where:{propertyId:user.propertyId},
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

export const resendOtp = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const user = await prisma.applicationUser.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json(new StandardResponse(404, "User not found", null));
        }

        const oldOtpRecord = await prisma.otp.findFirst({
            where:{
                userId:user.propertyId,
                isUsed:false,
                expiresAt:{gte:new Date()},
            }
        });

        if (oldOtpRecord) {
            await prisma.otp.update({
                where:{propertyId:oldOtpRecord.propertyId},
                data:{isUsed:true},
            })
        }

        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await prisma.otp.create({
            data: {
                propertyId: uuidV4(),
                otp: otpCode,
                expiresAt,
                userId: user.propertyId,
            },
        });

        await sendOtpMail(email, otpCode);

        res.status(200).json(new StandardResponse(200, "New OTP sent", null));
    } catch (err: any) {
        res.status(500).json(new StandardResponse(500, "Server error", null));
    }
};
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidV4 } from "uuid";
import { StandardResponse } from "../util/StandardResponse";
import httpStatus from "node-http-status";

const prisma = new PrismaClient();

export const findAllGenders = async (req: Request, res: Response) => {
    try {
        const genders = await prisma.gender.findMany({
            orderBy: { name: "asc" },
        });

        res.status(httpStatus.ok.status).json(
            new StandardResponse(200, "Genders fetched successfully", genders)
        );
    } catch (err: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.status).json(
            new StandardResponse(500, "Internal server error", err)
        );
    }
};

export const findGenderById = async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
        const gender = await prisma.gender.findUnique({ where: { propertyId: id } });

        if (!gender) {
            return res.status(httpStatus.NOT_FOUND.status).json(
                new StandardResponse(404, "Gender not found", null)
            );
        }

        res.status(httpStatus.ok.status).json(
            new StandardResponse(200, "Gender fetched successfully", gender)
        );
    } catch (err: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.status).json(
            new StandardResponse(500, "Internal server error", err)
        );
    }
};






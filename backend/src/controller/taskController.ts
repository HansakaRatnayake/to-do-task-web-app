import {Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {v4 as uuidV4} from 'uuid';
import {StandardResponse} from "../util/StandardResponse";
import {AuthRequest} from "../middleware/authMiddleware";
import httpStatus from "node-http-status";

const prisma = new PrismaClient();

export const createTask = async (req: AuthRequest, res: Response) => {
    const {title, description} = req.body;

    //validate missing values
    if (!title || !description) return res.status(httpStatus.BAD_REQUEST.status).json(new StandardResponse(400, "Missing required fields", null));

    try {
        const task = prisma.task.create({
            data: {
                propertyId: uuidV4(),
                title,
                description,
                userId: req.userId!
            }
        });

        res.status(httpStatus.created.status).json(new StandardResponse(201, "Task created", null));
    } catch (err: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.status).json(new StandardResponse(500, "Internal server error", err));
    }

}

export const updateTask = async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const {title, description} = req.body;

    //validate missing values
    if (!title || !description) return res.status(httpStatus.BAD_REQUEST.status).json(new StandardResponse(400, "Missing required fields", null));

    const selectedTask = await prisma.task.findUnique({where: {propertyId: id}});

    if (!selectedTask) return res.status(httpStatus.NOT_FOUND.status).json(new StandardResponse(404, "Task not found", null));

    try {
        await prisma.task.update({
            where: {propertyId: id},
            data: {
                title,
                description,
            }
        })
        res.status(httpStatus.created.status).json(new StandardResponse(201, "Task updated", null));
    } catch (err: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.status).json(new StandardResponse(500, "Internal server error", err));
    }

}

export const deleteTask = async (req: AuthRequest, res: Response) => {
    const id = req.params.id;

    const selectedTask = await prisma.task.findUnique({where: {propertyId: id}});

    if (!selectedTask) return res.status(httpStatus.NOT_FOUND.status).json(new StandardResponse(404, "Task not found", null));

    try {
        await prisma.task.delete({where: {propertyId: id}});
        res.status(httpStatus.NO_CONTENT.status).json(new StandardResponse(204, "Task deleted", null));
    } catch (err: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.status).json(new StandardResponse(500, "Internal server error", err));
    }
}

export const findAllTask = async (req: AuthRequest, res: Response) => {
    const {page = 1, limit = 10, search = "", isComplete} = req.query;

    const pageNumber = Number(page);
    const pageSize = Number(limit);

    try {
        const where: any = {
            userId: req.userId,
            OR: [
                {title: {contains: String(search), mode: "insensitive"}},
                {description: {contains: String(search), mode: "insensitive"}},
            ],
        };


        if (isComplete === "true") {
            where.completed = true;
        } else if (isComplete === "false") {
            where.completed = false;
        }

        const totalCount = await prisma.task.count({where});

        const tasks = await prisma.task.findMany({
            where,
            orderBy: {createdAt: "desc"},
            skip: (pageNumber - 1) * pageSize,
            take: pageSize,
        });

        res.status(httpStatus.ok.status).json(
            new StandardResponse(200, "Tasks fetched successfully", {
                tasks,
                pagination: {
                    total: totalCount,
                    page: pageNumber,
                    limit: pageSize,
                    totalPages: Math.ceil(totalCount / pageSize),
                },
            })
        );
    } catch (err: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR.status).json(new StandardResponse(500, "Internal server error", err));
    }
};


export const findByTaskId = async (req: AuthRequest, res: Response) => {
    const id = req.params.id;

    const selectedTask = await prisma.task.findUnique({where: {propertyId: id}});

    if (!selectedTask) return res.status(httpStatus.NOT_FOUND.status).json(new StandardResponse(404, "Task not found", null));

    res.status(httpStatus.ok.status).json(new StandardResponse(200, "Task found", selectedTask));
}

export const changeTaskStatus = async (req: AuthRequest, res: Response) => {
    const {id, complete} = req.query;

    if (!id || (complete == null)) return res.status(httpStatus.BAD_REQUEST.status).json(new StandardResponse(400, "Missing required values", null));

    const selectedTask = await prisma.task.findUnique({where: {propertyId: String(id)}});

    if (!selectedTask) return res.status(httpStatus.NOT_FOUND.status).json(new StandardResponse(404, "Task not found", null));

}


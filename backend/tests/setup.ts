import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

beforeAll(async () => {
    await prisma.task.deleteMany({});
    await prisma.otp.deleteMany({});
    await prisma.applicationUser.deleteMany({});
    await prisma.gender.deleteMany({});
});

afterAll(async () => {
    await prisma.$disconnect();
});

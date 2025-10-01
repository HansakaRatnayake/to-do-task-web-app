import request from "supertest";
import app from "../src/app";
import { prisma } from "./setup";

describe("Auth Routes", () => {
    let testUserId: string;
    let testUserEmail = "test@example.com";
    let jwtToken: string;

    beforeAll(async () => {
        // Seed a gender for user creation
        const gender = await prisma.gender.create({ data: { propertyId: "gender-1", name: "Male" } });
    });

    afterAll(async () => {
        await prisma.applicationUser.deleteMany({});
        await prisma.otp.deleteMany({});
        await prisma.gender.deleteMany({});
    });

    it("should sign up a new user and send OTP", async () => {
        const res = await request(app)
            .post("/api/v1/auth/signup")
            .send({ username: "Test User", email: testUserEmail, password: "password123", gender: "gender-1" });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe("OTP sent. Please verify your email.");
    });

    it("should verify the OTP", async () => {
        const user = await prisma.applicationUser.findUnique({ where: { email: testUserEmail } });
        const otpRecord = await prisma.otp.findFirst({ where: { userId: user!.propertyId, isUsed: false } });

        const res = await request(app)
            .post("/api/v1/auth/verify")
            .send({ email: testUserEmail, otp: otpRecord!.otp });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Account verified successfully");
    });

    it("should login the verified user", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: testUserEmail, password: "password123" });

        expect(res.status).toBe(200);
        expect(res.body.data.user.email).toBe(testUserEmail);

        jwtToken = res.body.data.token;
    });

    it("should resend OTP", async () => {
        const res = await request(app)
            .post("/api/v1/auth/resend-otp")
            .send({ email: testUserEmail });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("New OTP sent");
    });
});

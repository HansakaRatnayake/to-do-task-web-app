import request from "supertest";
import app from "../src/app";
import { prisma } from "./setup";

describe("Task Routes", () => {
    let token: string;
    let taskId: string;
    const testUserEmail = "taskuser@example.com";

    beforeAll(async () => {
        const gender = await prisma.gender.create({ data: { propertyId: "gender-1", name: "Male" } });

        // Signup & verify
        await request(app).post("/api/v1/auth/signup").send({
            username: "Task User",
            email: testUserEmail,
            password: "password123",
            gender: "gender-1"
        });

        const user = await prisma.applicationUser.findUnique({ where: { email: testUserEmail } });
        const otpRecord = await prisma.otp.findFirst({ where: { userId: user!.propertyId } });
        await request(app).post("/api/v1/auth/verify").send({ email: testUserEmail, otp: otpRecord!.otp });

        const loginRes = await request(app).post("/api/v1/auth/login").send({ email: testUserEmail, password: "password123" });
        token = loginRes.body.data.token;
    });

    it("should create a task", async () => {
        const res = await request(app)
            .post("/api/v1/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Test Task", description: "Task Description" });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe("Task created");
    });

    it("should fetch tasks list", async () => {
        const res = await request(app)
            .get("/api/v1/tasks/list")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.pagination.total).toBeGreaterThan(0);

        taskId = res.body.data.dataList[0].propertyId;
    });

    it("should update a task", async () => {
        const res = await request(app)
            .put(`/api/v1/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Updated Task", description: "Updated Description" });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe("Task updated");
    });

    it("should change task status", async () => {
        const res = await request(app)
            .patch(`/api/v1/tasks/change-status`)
            .set("Authorization", `Bearer ${token}`)
            .query({ id: taskId, complete: true });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Task status change successfully");
    });

    it("should delete a task", async () => {
        const res = await request(app)
            .delete(`/api/v1/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(204);
    });
});

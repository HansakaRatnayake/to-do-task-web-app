import request from "supertest";
import app from "../src/app";
import { prisma } from "./setup";

describe("Gender Routes", () => {
    beforeAll(async () => {
        await prisma.gender.create({ data: { propertyId: "g1", name: "Male" } });
        await prisma.gender.create({ data: { propertyId: "g2", name: "Female" } });
    });

    it("should fetch all genders", async () => {
        const res = await request(app).get("/api/v1/genders/list");
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should fetch a gender by id", async () => {
        const res = await request(app).get("/api/v1/genders/g1");
        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe("Male");
    });

    it("should return 404 for invalid id", async () => {
        const res = await request(app).get("/api/v1/genders/invalid");
        expect(res.status).toBe(404);
    });
});

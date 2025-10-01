import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "../../pages/Dashboard";
import { AuthProvider } from "../../context/AuthContext";
import { ToastProvider } from "../../utils/toast/toastService";
import taskService from "../../services/taskService";

// -------------------- MOCK AXIOS TO AVOID import.meta.env ERRORS --------------------
jest.mock("../../utils/interceptor/axios", () => ({
    __esModule: true,
    default: {
        create: () => ({
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            patch: jest.fn(),
        }),
    },
}));

// -------------------- Mock Task Service --------------------
const mockTaskData = [
    {
        propertyId: "1",
        title: "Test Task 1",
        description: "Description 1",
        completed: false,
        createdAt: new Date("2024-01-01"),
    },
    {
        propertyId: "2",
        title: "Test Task 2",
        description: "Description 2",
        completed: true,
        createdAt: new Date("2024-01-02"),
        completedAt: new Date("2024-01-03"),
    },
];

const mockStats = {
    total: 10,
    pending: 5,
    completed: 5,
};

jest.mock("../../services/taskService", () => ({
    __esModule: true,
    default: {
        create: jest.fn((data:any) =>
            Promise.resolve({
                status: 201,
                data: {
                    message: "Task created successfully",
                    data: { ...data, propertyId: "new-id", completed: false },
                },
            })
        ),
        update: jest.fn((id, data) =>{
            console.log(id, data);
            return Promise.resolve({
                    status: 200,
                    data: {
                        message: "Task updated successfully",
                        data: { ...data, propertyId: id },
                    },
                })
        }),
        delete: jest.fn((id:any) =>{
            console.log(id);
            return Promise.resolve({
                status: 200,
                data: { message: "Task deleted successfully" },
            })}
        ),
        changeStatus: jest.fn((id:any, complete:any) =>{
                console.log(id,complete);
                return Promise.resolve({
                    status: 200,
                    data: { message: "Task status changed successfully" },
                })
        }),
        getList: jest.fn((params:any) =>
            Promise.resolve({
                status: 200,
                data: {
                    message: "Tasks fetched successfully",
                    data: {
                        dataList:
                            params?.isComplete === false
                                ? mockTaskData.filter((t) => !t.completed)
                                : params?.isComplete === true
                                    ? mockTaskData.filter((t) => t.completed)
                                    : mockTaskData,
                        pagination: {
                            totalPages: 2,
                            currentPage: params?.page || 1,
                            totalItems: mockTaskData.length,
                        },
                    },
                },
            })
        ),
        getById: jest.fn((id:any) =>
            Promise.resolve({
                status: 200,
                data: {
                    message: "Task fetched successfully",
                    data: mockTaskData.find((t) => t.propertyId === id),
                },
            })
        ),
        getStats: jest.fn(() =>
            Promise.resolve({
                status: 200,
                data: {
                    message: "Stats fetched successfully",
                    data: mockStats,
                },
            })
        ),
    },
}));

// -------------------- Mock Auth Context --------------------
jest.mock("../../context/AuthContext", () => ({
    ...jest.requireActual("../../context/AuthContext"),
    useAuth: jest.fn(() => ({
        user: { id: "1", username: "testuser", email: "test@test.com" },
        logout: jest.fn(),
    })),
}));

// -------------------- Mock Toast --------------------
const mockPush = jest.fn();
jest.mock("../../utils/toast/toastService", () => ({
    ToastProvider: ({ children }: any) => <>{children}</>,
    useToast: jest.fn(() => ({ push: mockPush })),
}));

// -------------------- Helper Function --------------------
const renderDashboard = () =>
    render(
        <ToastProvider>
            <AuthProvider>
                <Dashboard />
            </AuthProvider>
        </ToastProvider>
    );

// -------------------- Tests --------------------
describe("Task Service Integration Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ---------- Task Creation ----------
    describe("Task Creation", () => {
        it("should create a new task successfully", async () => {
            const result = await taskService.create({
                title: "New Task",
                description: "New Description",
            });

            expect(result.status).toBe(201);
            expect(result.data.message).toBe("Task created successfully");
            expect(taskService.create).toHaveBeenCalledWith({
                title: "New Task",
                description: "New Description",
            });
        });

        it("should handle task creation errors", async () => {
            (taskService.create as jest.Mock).mockRejectedValueOnce({
                response: { data: { message: "Creation failed" } },
            });

            await expect(
                taskService.create({ title: "", description: "" })
            ).rejects.toEqual({
                response: { data: { message: "Creation failed" } },
            });
        });
    });

    // ---------- Task Retrieval ----------
    describe("Task Retrieval", () => {
        it("should fetch all tasks", async () => {
            const result = await taskService.getList({ page: 1, limit: 5 });

            expect(result.status).toBe(200);
            expect(result.data.data.dataList).toHaveLength(2);
            expect(taskService.getList).toHaveBeenCalledWith({ page: 1, limit: 5 });
        });

        it("should fetch pending tasks only", async () => {
            const result = await taskService.getList({ page: 1, limit: 5, isComplete: false });

            expect(result.data.data.dataList).toHaveLength(1);
            expect(result.data.data.dataList[0].completed).toBe(false);
        });

        it("should fetch completed tasks only", async () => {
            const result = await taskService.getList({ page: 1, limit: 5, isComplete: true });

            expect(result.data.data.dataList).toHaveLength(1);
            expect(result.data.data.dataList[0].completed).toBe(true);
        });

        it("should fetch task by ID", async () => {
            const result = await taskService.getById("1");

            expect(result.status).toBe(200);
            expect(result.data.data.propertyId).toBe("1");
            expect(result.data.data.title).toBe("Test Task 1");
        });

        it("should fetch task statistics", async () => {
            const result = await taskService.getStats();

            expect(result.status).toBe(200);
            expect(result.data.data).toEqual(mockStats);
            expect(result.data.data.total).toBe(10);
            expect(result.data.data.pending).toBe(5);
            expect(result.data.data.completed).toBe(5);
        });
    });

    // ---------- Task Updates ----------
    describe("Task Updates", () => {
        it("should update a task successfully", async () => {
            const result = await taskService.update("1", {
                title: "Updated Task",
                description: "Updated Description",
            });

            expect(result.status).toBe(200);
            expect(result.data.message).toBe("Task updated successfully");
            expect(taskService.update).toHaveBeenCalledWith("1", {
                title: "Updated Task",
                description: "Updated Description",
            });
        });

        it("should change task status", async () => {
            const result = await taskService.changeStatus("1", true);

            expect(result.status).toBe(200);
            expect(result.data.message).toBe("Task status changed successfully");
            expect(taskService.changeStatus).toHaveBeenCalledWith("1", true);
        });

        it("should handle update errors", async () => {
            (taskService.update as jest.Mock).mockRejectedValueOnce({
                response: { data: { message: "Update failed" } },
            });

            await expect(
                taskService.update("1", { title: "", description: "" })
            ).rejects.toEqual({
                response: { data: { message: "Update failed" } },
            });
        });
    });

    // ---------- Task Deletion ----------
    describe("Task Deletion", () => {
        it("should delete a task successfully", async () => {
            const result = await taskService.delete("1");

            expect(result.status).toBe(200);
            expect(result.data.message).toBe("Task deleted successfully");
            expect(taskService.delete).toHaveBeenCalledWith("1");
        });

        it("should handle deletion errors", async () => {
            (taskService.delete as jest.Mock).mockRejectedValueOnce({
                response: { data: { message: "Deletion failed" } },
            });

            await expect(taskService.delete("1")).rejects.toEqual({
                response: { data: { message: "Deletion failed" } },
            });
        });
    });

    // ---------- Dashboard Integration ----------
    describe("Dashboard Integration", () => {
        it("should render dashboard with stats", async () => {
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByTestId("pending-count")).toHaveTextContent("5");
                expect(screen.getByTestId("completed-count")).toHaveTextContent("5");
                expect(screen.getByTestId("total-count")).toHaveTextContent("10");

                expect(screen.getByText("Pending Tasks")).toBeInTheDocument();
                expect(screen.getByText("Completed Tasks")).toBeInTheDocument();
                expect(screen.getByText("Total Tasks")).toBeInTheDocument();
            });


        });

        it("should display user information", async () => {
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText("Welcome back, testuser!")).toBeInTheDocument();
            });
        });
    });

    // ---------- Error Handling ----------
    describe("Error Handling", () => {
        it("should handle network errors gracefully", async () => {
            (taskService.getList as jest.Mock).mockRejectedValueOnce({ message: "Network error" });

            await expect(taskService.getList({ page: 1, limit: 5 })).rejects.toEqual({
                message: "Network error",
            });
        });

        it("should handle missing data errors", async () => {
            (taskService.getById as jest.Mock).mockResolvedValueOnce({
                status: 404,
                data: { message: "Task not found", data: null },
            });

            const result = await taskService.getById("nonexistent");

            expect(result.status).toBe(404);
            expect(result.data.data).toBeNull();
        });
    });
});

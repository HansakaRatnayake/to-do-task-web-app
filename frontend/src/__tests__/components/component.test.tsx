import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TaskForm from "../../components/TaskForm";
import EditTaskForm from "../../components/EditTaskForm";
import TaskCard from "../../components/TaskCard";
import TaskHistory from "../../components/TaskHistory";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { ToastProvider } from "../../utils/toast/toastService";
import taskService from "../../services/taskService";


// -------------------- Mock Services --------------------
jest.mock("../../services/taskService", () => ({
    __esModule: true,
    default: {
        create: jest.fn(),
        update: jest.fn(() =>
            Promise.resolve({
                data: { message: "Task updated successfully" },
            })
        ),
        delete: jest.fn(() =>
            Promise.resolve({
                data: { message: "Task deleted successfully" },
            })
        ),
        changeStatus: jest.fn(() =>
            Promise.resolve({
                data: { message: "Status changed successfully" },
            })
        ),
        getList: jest.fn(() =>
            Promise.resolve({
                data: {
                    message: "Tasks fetched",
                    data: {
                        dataList: [],
                        pagination: { totalPages: 1, currentPage: 1, totalItems: 0 },
                    },
                },
            })
        ),
        getStats: jest.fn(() =>
            Promise.resolve({
                data: {
                    message: "Stats fetched",
                    data: { total: 0, pending: 0, completed: 0 },
                },
            })
        ),
    },
}));

const mockPush = jest.fn();
jest.mock("../../utils/toast/toastService", () => ({
    ToastProvider: ({ children }: any) => <>{children}</>,
    useToast: () => ({ push: mockPush }),
}));

// -------------------- TaskForm Tests --------------------
describe("TaskForm Component", () => {
    const mockOnSubmit = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render task form with all fields", () => {
        render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        expect(screen.getByText("Add New Task")).toBeInTheDocument();
        expect(screen.getByLabelText(/Task Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Add Task/i })).toBeInTheDocument();
    });

    it("should handle title input change", () => {
        render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        const titleInput = screen.getByLabelText(/Task Title/i);
        fireEvent.change(titleInput, { target: { value: "New Task" } });

        expect(titleInput).toHaveValue("New Task");
    });

    it("should handle description input change", () => {
        render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        const descInput = screen.getByLabelText(/Description/i);
        fireEvent.change(descInput, { target: { value: "New Description" } });

        expect(descInput).toHaveValue("New Description");
    });

    it("should call onClose when cancel button is clicked", () => {
        render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
        fireEvent.click(cancelBtn);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onSubmit with form data when submitted", async () => {
        render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        const titleInput = screen.getByLabelText(/Task Title/i);
        const descInput = screen.getByLabelText(/Description/i);
        const submitBtn = screen.getByRole("button", { name: /Add Task/i });

        fireEvent.change(titleInput, { target: { value: "Test Task" } });
        fireEvent.change(descInput, { target: { value: "Test Description" } });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                title: "Test Task",
                description: "Test Description",
            });
        });
    });

    it("should not submit when title is empty", async () => {
        render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        const submitBtn = screen.getByRole("button", { name: /Add Task/i });
        fireEvent.click(submitBtn);

        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should show loading state during submission", async () => {
        render(<TaskForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        const titleInput = screen.getByLabelText(/Task Title/i);
        const submitBtn = screen.getByRole("button", { name: /Add Task/i });

        fireEvent.change(titleInput, { target: { value: "Test" } });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText(/Adding.../i)).toBeInTheDocument();
        });
    });
});

// -------------------- EditTaskForm Tests --------------------
describe("EditTaskForm Component", () => {
    const mockTask = {
        propertyId: "1",
        title: "Original Title",
        description: "Original Description",
        completed: false,
        createdAt: new Date("2024-01-01"),
    };

    const mockOnSubmit = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render edit form with existing task data", () => {
        render(
            <ToastProvider>
                <EditTaskForm
                    task={mockTask}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            </ToastProvider>
        );

        expect(screen.getByText("Edit Task")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Original Title")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Original Description")).toBeInTheDocument();
    });

    it("should update title input", () => {
        render(
            <ToastProvider>
                <EditTaskForm
                    task={mockTask}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            </ToastProvider>
        );

        const titleInput = screen.getByLabelText(/Task Title/i);
        fireEvent.change(titleInput, { target: { value: "Updated Title" } });

        expect(titleInput).toHaveValue("Updated Title");
    });

    it("should call onClose when cancel is clicked", () => {
        render(
            <ToastProvider>
                <EditTaskForm
                    task={mockTask}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            </ToastProvider>
        );

        fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should submit updated task data", async () => {


        render(
            <ToastProvider>
                <EditTaskForm
                    task={mockTask}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            </ToastProvider>
        );

        const titleInput = screen.getByLabelText(/Task Title/i);
        fireEvent.change(titleInput, { target: { value: "Updated" } });
        fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

        await waitFor(() => {
            expect(taskService.update).toHaveBeenCalledWith("1", {
                title: "Updated",
                description: "Original Description",
            });
            expect(mockOnSubmit).toHaveBeenCalled();
        });
    });
});

// -------------------- TaskCard Tests --------------------
describe("TaskCard Component", () => {
    const mockTask = {
        propertyId: "1",
        title: "Test Task",
        description: "Test Description",
        completed: false,
        createdAt: new Date("2024-01-01"),
    };

    const mockOnComplete = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnEdit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render task card with task data", () => {
        render(
            <TaskCard
                task={mockTask}
                onComplete={mockOnComplete}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
            />
        );

        expect(screen.getByText("Test Task")).toBeInTheDocument();
        expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    it("should show Done button for incomplete tasks", () => {
        render(
            <TaskCard
                task={mockTask}
                onComplete={mockOnComplete}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
            />
        );

        expect(screen.getByRole("button", { name: /Done/i })).toBeInTheDocument();
    });

    it("should not show Done button for completed tasks", () => {
        const completedTask = { ...mockTask, completed: true };

        render(
            <TaskCard
                task={completedTask}
                onComplete={mockOnComplete}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
            />
        );

        expect(screen.queryByRole("button", { name: /Done/i })).not.toBeInTheDocument();
    });

    it("should call onComplete when Done button is clicked", () => {
        render(
            <TaskCard
                task={mockTask}
                onComplete={mockOnComplete}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Done/i }));
        expect(mockOnComplete).toHaveBeenCalledWith("1");
    });

    it("should call onDelete when delete button is clicked", () => {
        render(
            <TaskCard
                task={mockTask}
                onComplete={mockOnComplete}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
            />
        );

        const deleteBtn = screen.getByTitle(/Delete task/i);
        fireEvent.click(deleteBtn);
        expect(mockOnDelete).toHaveBeenCalledWith("1");
    });

    it("should call onEdit when edit button is clicked", () => {
        render(
            <TaskCard
                task={mockTask}
                onComplete={mockOnComplete}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
            />
        );

        const editBtn = screen.getByTitle(/Edit task/i);
        fireEvent.click(editBtn);
        expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
    });

    it("should apply completed styles for completed tasks", () => {
        const completedTask = {
            ...mockTask,
            completed: true,
            completedAt: new Date("2024-01-02"),
        };

        render(
            <TaskCard
                task={completedTask}
                onComplete={mockOnComplete}
                onDelete={mockOnDelete}
            />
        );

        const title = screen.getByText("Test Task");
        expect(title).toHaveClass("line-through");
    });
});

// -------------------- ConfirmationDialog Tests --------------------
describe("ConfirmationDialog Component", () => {
    const mockOnConfirm = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should not render when isOpen is false", () => {
        render(
            <ConfirmationDialog
                isOpen={false}
                title="Test Title"
                message="Test Message"
                confirmText="Confirm"
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
        render(
            <ConfirmationDialog
                isOpen={true}
                title="Test Title"
                message="Test Message"
                confirmText="Confirm"
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByText("Test Title")).toBeInTheDocument();
        expect(screen.getByText("Test Message")).toBeInTheDocument();
        expect(screen.getByText("Confirm")).toBeInTheDocument();
    });

    it("should call onConfirm when confirm button is clicked", () => {
        render(
            <ConfirmationDialog
                isOpen={true}
                title="Test"
                message="Message"
                confirmText="Confirm"
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />
        );

        fireEvent.click(screen.getByText("Confirm"));
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it("should call onCancel when cancel button is clicked", () => {
        render(
            <ConfirmationDialog
                isOpen={true}
                title="Test"
                message="Message"
                confirmText="Confirm"
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />
        );

        fireEvent.click(screen.getByText("Cancel"));
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("should apply danger styles when type is danger", () => {
        render(
            <ConfirmationDialog
                isOpen={true}
                title="Delete"
                message="Are you sure?"
                confirmText="Delete"
                type="danger"
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />
        );

        const confirmBtn = screen.getByRole("button", { name: "Delete" });
        expect(confirmBtn).toHaveClass("bg-red-600");
    });

    it("should apply info styles when type is info", () => {
        render(
            <ConfirmationDialog
                isOpen={true}
                title="Info"
                message="Information"
                confirmText="OK"
                type="info"
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />
        );

        const confirmBtn = screen.getByText("OK");
        expect(confirmBtn).toHaveClass("bg-blue-600");
    });

    it("should use custom cancel text", () => {
        render(
            <ConfirmationDialog
                isOpen={true}
                title="Test"
                message="Message"
                confirmText="Confirm"
                cancelText="Go Back"
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByText("Go Back")).toBeInTheDocument();
    });
});

// -------------------- TaskHistory Tests --------------------
describe("TaskHistory Component", () => {
    const mockOnBack = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render task history header", async () => {
        render(
            <ToastProvider>
                <TaskHistory onBack={mockOnBack} />
            </ToastProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Task History")).toBeInTheDocument();
        });
    });

    it("should call onBack when back button is clicked", async () => {
        render(
            <ToastProvider>
                <TaskHistory onBack={mockOnBack} />
            </ToastProvider>
        );

        await waitFor(() => {
            const backBtn = screen.getByText("Back to Dashboard");
            fireEvent.click(backBtn);
            expect(mockOnBack).toHaveBeenCalledTimes(1);
        });
    });

    it("should display stats cards", async () => {
        render(
            <ToastProvider>
                <TaskHistory onBack={mockOnBack} />
            </ToastProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Total Tasks")).toBeInTheDocument();
            expect(screen.getByText("Completed")).toBeInTheDocument();
            expect(screen.getByText("Pending")).toBeInTheDocument();
        });
    });

    it("should show filter buttons", async () => {
        render(
            <ToastProvider>
                <TaskHistory onBack={mockOnBack} />
            </ToastProvider>
        );

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /All Tasks/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Pending/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Completed/i })).toBeInTheDocument();

            expect(screen.getByText("Total Tasks")).toBeInTheDocument();
            expect(screen.getByText("Completed")).toBeInTheDocument(); // <p> tag
            expect(screen.getByText("Pending")).toBeInTheDocument();   // <p> tag
        });
    });

});
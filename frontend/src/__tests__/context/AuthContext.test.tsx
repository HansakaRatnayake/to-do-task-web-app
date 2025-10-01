import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../context/AuthContext";

// -------------------- Mock Toast --------------------
const mockPush = jest.fn();

jest.mock("../../utils/toast/toastService", () => ({
    ToastProvider: ({ children }: any) => <>{children}</>,
    useToast: () => ({ push: mockPush }),
}));

// -------------------- Mock AuthService --------------------
jest.mock("../../services/authService", () => ({
    login: jest.fn(({ email, password }) => {
        if (email === "test@test.com" && password === "123") {
            return Promise.resolve({
                status: 200,
                data: {
                    data: {
                        user: { id: "1", username: "testuser", email },
                        token: "token",
                    },
                },
            });
        }
        return Promise.reject({ response: { data: { message: "Invalid login" } } });
    }),
    signup: jest.fn(({ username, email, password, gender }) =>
        Promise.resolve({
            status: 201,
            data: {
                data: {
                    user: { id: "1", username, email, password, gender },
                    token: "token",
                },
            },
        })
    ),
    verifyEmail: jest.fn(() =>
        Promise.resolve({ status: 200, data: { success: true } })
    ),
    resendOtp: jest.fn(() =>
        Promise.resolve({ status: 200, data: { success: true } })
    ),
}));

// -------------------- Test Component --------------------
const TestComponent = () => {
    const { user, login, logout, signup, verifyEmail, resendOTP } = useAuth();

    return (
        <div>
            <button onClick={() => login("test@test.com", "123")}>Login</button>
            <button onClick={() => signup("testuser", "test@test.com", "123", "M")}>Signup</button>
            <button onClick={() => verifyEmail("test@test.com", 1234)}>Verify Email</button>
            <button onClick={() => resendOTP("test@test.com")}>Resend OTP</button>
            <button onClick={logout}>Logout</button>
            <p data-testid="user">{user ? `Logged in as ${user.username}` : "Not logged in"}</p>
        </div>
    );
};

// -------------------- Tests --------------------
describe("AuthContext", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    const renderComponent = () =>
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

    it("logs in and sets user", async () => {
        renderComponent();
        fireEvent.click(screen.getByText("Login"));

        await waitFor(() =>
            expect(screen.getByTestId("user")).toHaveTextContent("Logged in as testuser")
        );
    });

    it("logs out and clears user", async () => {
        renderComponent();
        fireEvent.click(screen.getByText("Login"));
        await waitFor(() =>
            expect(screen.getByTestId("user")).toHaveTextContent("Logged in as testuser")
        );

        fireEvent.click(screen.getByText("Logout"));
        await waitFor(() =>
            expect(screen.getByTestId("user")).toHaveTextContent("Not logged in")
        );
    });

    it("signs up a new user without logging in", async () => {
        renderComponent();
        fireEvent.click(screen.getByText("Signup"));

        await waitFor(() =>
            // After signup, user should still be null
            expect(screen.getByTestId("user")).toHaveTextContent("Not logged in")
        );
    });

    it("verifies email successfully", async () => {
        renderComponent();
        fireEvent.click(screen.getByText("Login"));
        await waitFor(() =>
            expect(screen.getByTestId("user")).toHaveTextContent("Logged in as testuser")
        );

        fireEvent.click(screen.getByText("Verify Email"));
        await waitFor(() =>
            expect(screen.getByTestId("user")).toHaveTextContent("Logged in as testuser")
        );
    });

    it("resends OTP successfully", async () => {
        renderComponent();
        fireEvent.click(screen.getByText("Login"));
        await waitFor(() =>
            expect(screen.getByTestId("user")).toHaveTextContent("Logged in as testuser")
        );

        fireEvent.click(screen.getByText("Resend OTP"));
        await waitFor(() =>
            expect(screen.getByTestId("user")).toHaveTextContent("Logged in as testuser")
        );
    });
});

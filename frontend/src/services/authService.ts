import api from "../utils/interceptor/axios";

type SignupData = {
    username: string;
    email: string;
    password: string;
    gender: string;
};

type LoginData = {
    email: string;
    password: string;
};

type VerifyOtpData = {
    email: string;
    otp: number;
};

type ResendOtpData = {
    email: string;
};

const authService = {
    signup: async (data: SignupData) => {
        return await api.post("/auth/signup", data);
    },

    login: async (data: LoginData) => {
        return await api.post("/auth/login", data);
    },

    verifyEmail: async (data: VerifyOtpData) => {
        return await api.post("/auth/verify", data);
    },

    resendOtp: async (data: ResendOtpData) => {
        return await api.post("/auth/resend-otp", data);
    },
};

export default authService;

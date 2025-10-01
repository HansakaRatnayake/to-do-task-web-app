import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService'
import { useToast } from '../utils/toast/toastService'
interface User {
    id: string;
    email: string;
    username: string;
    gender?:string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (username:string, email: string, password: string, gender: string) => Promise<void>;
    logout: () => void;
    verifyEmail: (email:string, otp: number) => Promise<void>;
    resendOTP: (email:string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

let logoutHandler: (() => void) | null = null;

const setLogoutHandler = (handler: () => void) => {
    logoutHandler = handler;
};

export const triggerLogout = () => {
    if (logoutHandler) logoutHandler();
};


interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { push } = useToast();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
        }

        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await authService.login({email, password});

            const data = response.data;

            if (response.status === 200) {
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                setUser(data.data.user);
            } else {
                push({ title: 'Something went wrong', description: data.message, variant: 'error' })
                throw new Error(data.message);
            }

        } catch (error:any) {
            const msg = error?.response?.data?.message || error.message || "Unknown error";
            push({ title: 'Something went wrong', description: msg, variant: 'error' });
            throw new Error(msg);
        }
    };

    const signup = async (username:string, email: string, password: string, gender: string) => {
        try {
            const response = await authService.signup({username,email,password,gender});

            const data = response.data;

            if (response.status != 201) {
                push({ title: 'Something went wrong', description: data.message, variant: 'error' })
                throw new Error(data.message);
            }
        } catch (error:any) {
            const msg = error?.response?.data?.message || error.message || "Unknown error";
            push({ title: 'Something went wrong', description: msg, variant: 'error' });
            throw new Error(msg);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const verifyEmail = async (email:string, otp: number) => {
        try {

            const response = await authService.verifyEmail({email, otp});

            const data = response.data;

            if (response.status != 200) {
                push({ title: 'Something went wrong', description: data.message, variant: 'error' })
                throw new Error(data.message);
            }
        } catch (error:any) {
            const msg = error?.response?.data?.message || error.message || "Unknown error";
            push({ title: 'Something went wrong', description: msg, variant: 'error' });
            throw new Error(msg);
        }
    };

    const resendOTP = async (email:string) => {
        try {

            const response = await authService.resendOtp({email});

            const data = response.data;

            if (response.status != 200) {
                push({ title: 'Something went wrong', description: data.message, variant: 'error' })
                throw new Error(data.message);
            }
        } catch (error:any) {
            push({ title: 'Something went wrong', description: error, variant: 'error' })
            throw new Error(error);
        }
    };

    const value = {
        user,
        isLoading,
        login,
        signup,
        logout,
        verifyEmail,
        resendOTP
    };

    useEffect(() => {
        setLogoutHandler(logout); // register the logout function globally
    }, [logout]);

    return (

        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>


    );
}
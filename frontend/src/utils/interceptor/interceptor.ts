import api from './axios.ts';
import { triggerLogout } from '../../context/AuthContext.tsx';


// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        switch (status) {
            case 401:
                console.error('Unauthorized. Redirecting to login...');
                triggerLogout();
                break;
            case 403:
                console.error('Forbidden access.');
                triggerLogout();
                break;
            case 500:
                console.error('Server error.');
                break;
            default:
                console.error('API error occurred');
        }

        return Promise.reject(error);
    }
);

export default api;


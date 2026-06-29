import React, { createContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api/v1'
});

// --- The Stable Interceptor ---
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Optional: Handle token refresh or logout here
            console.error('[Interceptor] Unauthorized access - 401');
        }
        return Promise.reject(error);
    }
);

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: { username: string } | null;
    login: (username, password) => Promise<void>;
    logout: () => void;
    apiClient: typeof apiClient;
}

// Export the context so the hook can use it, but don't export the hook itself from here.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<{ username: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('accessToken'));

    useEffect(() => {
        if (accessToken) {
            // In a real app, you'd fetch user profile here to validate the token.
            setUser({ username: 'User' }); // Placeholder
        } else {
            setUser(null);
        }
    }, [accessToken]);

    const login = async (username, password) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post('/token/', { username, password });
            const { access } = response.data;
            localStorage.setItem('accessToken', access);
            setAccessToken(access);
            setUser({ username });
        } catch (error) {
            localStorage.removeItem('accessToken');
            setAccessToken(null);
            setUser(null);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
        setUser(null);
    };

    const value = {
        isAuthenticated: !!accessToken,
        isLoading,
        user,
        login,
        logout,
        apiClient
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
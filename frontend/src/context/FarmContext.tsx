import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// --- Interfaces ---
interface Farm {
    id: string;
    name: string;
}

interface PaginatedResponse<T> {
    count: number;
    results: T[];
}

interface FarmContextType {
    farms: Farm[];
    selectedFarm: Farm | null;
    selectFarm: (farmId: string) => void;
    isLoading: boolean;
}

// --- Context Definition ---
export const FarmContext = createContext<FarmContextType | undefined>(undefined);

// --- Provider Component ---
export const FarmProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, apiClient } = useAuth();
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
    const queryClient = useQueryClient();

    const { data: farms = [], isLoading } = useQuery<Farm[]>({
        queryKey: ['farms'],
        queryFn: async () => {
            const response = await apiClient.get<PaginatedResponse<Farm>>('/farms/farms/');
            return response.data.results;
        },
        enabled: isAuthenticated,
    });

    // Effect to auto-select farm from localStorage or default to the first one.
    useEffect(() => {
        if (farms.length > 0 && !selectedFarm) {
            const storedFarmId = localStorage.getItem('selectedFarmId');
            const farmToSelect = farms.find(f => f.id === storedFarmId) || farms[0];
            if (farmToSelect) {
                setSelectedFarm(farmToSelect);
                // Also update localStorage to be sure it's set for next time.
                localStorage.setItem('selectedFarmId', farmToSelect.id);
            }
        }
    }, [farms, selectedFarm]);

    // Effect to clear everything on logout.
    useEffect(() => {
        if (!isAuthenticated) {
            setSelectedFarm(null);
            localStorage.removeItem('selectedFarmId');
            queryClient.removeQueries({ queryKey: ['farms'] });
        }
    }, [isAuthenticated, queryClient]);

    // Function to change the selection and store it.
    const selectFarm = (farmId: string) => {
        const farm = farms.find(f => f.id === farmId);
        if (farm) {
            setSelectedFarm(farm);
            localStorage.setItem('selectedFarmId', farm.id);
        }
    };

    const value = {
        farms,
        selectedFarm,
        selectFarm,
        isLoading,
    };

    return (
        <FarmContext.Provider value={value}>
            {children}
        </FarmContext.Provider>
    );
};
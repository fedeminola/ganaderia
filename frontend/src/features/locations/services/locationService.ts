import { useAuth } from '../../../hooks/useAuth';
import { useFarm } from '../../../hooks/useFarm';

export interface Location {
  id: string;
  farm: string;
  name: string;
  type: 'paddock' | 'corral' | 'pen' | 'temporary_plot' | 'custom';
  polygon: any;
  manual_area_hectares: string | null;
  calculated_area_hectares: string | null;
  animal_count?: number;
  active: boolean;
}

export const useLocationsService = () => {
  const { apiClient } = useAuth();
  const { selectedFarm } = useFarm();

  const getLocations = async () => {
    if (!selectedFarm) return [];
    const response = await apiClient.get(`/locations/?farm=${selectedFarm.id}`);
    return response.data.results;
  };

  const createLocation = async (data: Partial<Location>) => {
    if (!selectedFarm) throw new Error("No farm selected");
    const response = await apiClient.post('/locations/', { ...data, farm: selectedFarm.id });
    return response.data;
  };

  const updateLocation = async (id: string, data: Partial<Location>) => {
    const response = await apiClient.patch(`/locations/${id}/`, data);
    return response.data;
  };

  const deleteLocation = async (id: string) => {
    await apiClient.delete(`/locations/${id}/`);
  };

  return { getLocations, createLocation, updateLocation, deleteLocation };
};

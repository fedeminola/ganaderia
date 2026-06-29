import { useAuth } from '../../../hooks/useAuth';
import { useFarm } from '../../../hooks/useFarm';

export interface Movement {
  id: string;
  farm: string;
  user: string;
  origin: string | null;
  destination: string;
  timestamp: string;
  notes: string | null;
  animals_involved: { animal: any }[];
}

export const useMovementsService = () => {
  const { apiClient } = useAuth();
  const { selectedFarm } = useFarm();

  const getMovements = async () => {
    if (!selectedFarm) return [];
    const response = await apiClient.get(`/movements/?farm=${selectedFarm.id}`);
    return response.data.results;
  };

  const createMovement = async (data: {
    destination: string;
    animal_ids: string[];
    origin?: string;
    timestamp?: string;
    notes?: string;
  }) => {
    if (!selectedFarm) throw new Error("No farm selected");
    const payload = {
      ...data,
      farm: selectedFarm.id,
      timestamp: data.timestamp || new Date().toISOString()
    };
    const response = await apiClient.post('/movements/', payload);
    return response.data;
  };

  return { getMovements, createMovement };
};

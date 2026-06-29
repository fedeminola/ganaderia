import { useAuth } from '../../../hooks/useAuth';
import { useFarm } from '../../../hooks/useFarm';

export interface AnimalEvent {
  id: string;
  animal: string;
  animal_rfid?: string;
  animal_internal_number?: string;
  type: string;
  timestamp: string;
  metadata: Record<string, any>;
  user: string;
  created_at: string;
}

export const useEventsService = () => {
  const { apiClient } = useAuth();
  const { selectedFarm } = useFarm();

  const getEvents = async () => {
    if (!selectedFarm) return [];
    // The backend filters events by farms the user belongs to, 
    // but we should probably filter by the selected farm if possible.
    // Assuming the backend supports ?farm= parameter or we filter manually.
    const response = await apiClient.get(`/animals/events/?farm=${selectedFarm.id}`);
    return response.data.results;
  };

  return { getEvents };
};

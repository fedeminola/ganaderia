import { useAuth } from '../../../hooks/useAuth';
import { useFarm } from '../../../hooks/useFarm';

export interface WeightMeasurement {
  id?: string;
  animal: string;
  weight: number;
  measurement_date: string;
  scale_id?: string;
}

export const useWeightService = () => {
  const { apiClient } = useAuth();
  const { selectedFarm } = useFarm();

  const getMeasurements = async (animalId?: string) => {
    const url = animalId ? `/weights/measurements/?animal=${animalId}` : '/weights/measurements/';
    const response = await apiClient.get(url);
    return response.data.results;
  };

  const createMeasurement = async (data: WeightMeasurement) => {
    const response = await apiClient.post('/weights/measurements/', data);
    return response.data;
  };

  return { getMeasurements, createMeasurement };
};

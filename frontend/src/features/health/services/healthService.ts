import { useAuth } from '../../../hooks/useAuth';
import { useFarm } from '../../../hooks/useFarm';

export interface Vaccine {
  id: string;
  name: string;
  description: string;
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
}

export interface ApplyTreatmentPayload {
  animal_ids: string[];
  treatment_id?: string;
  vaccine_id?: string;
  date: string;
  notes?: string;
}

export const useHealthService = () => {
  const { apiClient } = useAuth();
  const { selectedFarm } = useFarm();

  const getVaccines = async () => {
    if (!selectedFarm) return [];
    const response = await apiClient.get(`/health/vaccines/?farm=${selectedFarm.id}`);
    return response.data.results;
  };

  const getTreatments = async () => {
    if (!selectedFarm) return [];
    const response = await apiClient.get(`/health/treatments/?farm=${selectedFarm.id}`);
    return response.data.results;
  };

  const applyTreatment = async (payload: ApplyTreatmentPayload) => {
    const response = await apiClient.post('/health/apply-treatment/', payload);
    return response.data;
  };

  return { getVaccines, getTreatments, applyTreatment };
};

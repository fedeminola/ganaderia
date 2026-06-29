import { useAuth } from '../../../hooks/useAuth';
import { useFarm } from '../../../hooks/useFarm';
import { Animal } from '../../animals/services/animalService';

export interface Lot {
  id: string;
  farm: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  memberships: LotMembership[];
}

export interface LotMembership {
  id: string;
  lot: string;
  animal: Animal;
  date_joined: string;
}

export const useLotsService = () => {
  const { apiClient } = useAuth();
  const { selectedFarm } = useFarm();

  const getLots = async () => {
    if (!selectedFarm) return [];
    const response = await apiClient.get(`/lots/?farm=${selectedFarm.id}`);
    return response.data.results;
  };

  const createLot = async (data: Partial<Lot>) => {
    if (!selectedFarm) throw new Error("No farm selected");
    const response = await apiClient.post('/lots/', { ...data, farm: selectedFarm.id });
    return response.data;
  };

  const addAnimalsToLot = async (lotId: string, animalIds: string[]) => {
    const response = await apiClient.post(`/lots/${lotId}/add-animals/`, { animal_ids: animalIds });
    return response.data;
  };

  const removeAnimalsFromLot = async (lotId: string, animalIds: string[]) => {
    const response = await apiClient.post(`/lots/${lotId}/remove-animals/`, { animal_ids: animalIds });
    return response.data;
  };

  const deleteLot = async (id: string) => {
    await apiClient.delete(`/lots/${id}/`);
  };

  const getLotById = async (id: string) => {
    const response = await apiClient.get(`/lots/${id}/`);
    return response.data;
  };

  return { getLots, createLot, addAnimalsToLot, removeAnimalsFromLot, deleteLot, getLotById };
};

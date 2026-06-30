import { useAuth } from '../../../hooks/useAuth';
import { useFarm } from '../../../hooks/useFarm';

export interface Animal {
  id: string;
  farm: string;
  rfid: string;
  visual_tag: string | null;
  internal_number: string | null;
  species: string;
  category: string | null;
  sex: 'male' | 'female';
  birth_date: string | null;
  status: 'active' | 'sold' | 'dead' | 'missing';
  current_location: string | null;
  current_lot: string | null;
  mother: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export const useAnimalsService = () => {
  const { apiClient } = useAuth();
  const { selectedFarm } = useFarm();

  const getAnimals = async (search?: string) => {
    if (!selectedFarm) return [];
    const url = search 
      ? `/animals/?farm=${selectedFarm.id}&search=${encodeURIComponent(search)}`
      : `/animals/?farm=${selectedFarm.id}`;
    const response = await apiClient.get(url);
    return response.data.results;
  };

  const createAnimal = async (data: Partial<Animal>) => {
    if (!selectedFarm) throw new Error("No farm selected");
    const response = await apiClient.post('/animals/', { ...data, farm: selectedFarm.id });
    return response.data;
  };

  const updateAnimal = async (id: string, data: Partial<Animal>) => {
    const response = await apiClient.patch(`/animals/${id}/`, data);
    return response.data;
  };

  const deleteAnimal = async (id: string) => {
    await apiClient.delete(`/animals/${id}/`);
  };

  const getAnimalById = async (id: string) => {
    const response = await apiClient.get(`/animals/${id}/`);
    return response.data;
  };

  const getSpecies = async () => {
    if (!selectedFarm) return [];
    const response = await apiClient.get(`/animals/species/?farm=${selectedFarm.id}`);
    return response.data.results;
  };

  const getCategories = async (speciesId?: string) => {
    if (!selectedFarm) return [];
    let url = `/animals/categories/?farm=${selectedFarm.id}`;
    if (speciesId) url += `&species=${speciesId}`;
    const response = await apiClient.get(url);
    return response.data.results;
  };

  return { getAnimals, createAnimal, updateAnimal, deleteAnimal, getAnimalById, getSpecies, getCategories };
};

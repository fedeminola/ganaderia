import { useAuth } from '../../../hooks/useAuth';
import { useFarm } from '../../../hooks/useFarm';

export type RfidAction = 'count' | 'movement' | 'apply_treatment' | 'weighing' | 'associate_tag';

export interface RfidSyncPayload {
  action: RfidAction;
  location_id: string;
  rfid_tags: string[];
  extra_data?: Record<string, any>;
}

export const useRfidService = () => {
  const { apiClient } = useAuth();
  const { selectedFarm } = useFarm();

  const syncTags = async (payload: RfidSyncPayload) => {
    if (!selectedFarm) throw new Error("No farm selected");
    
    const response = await apiClient.post('/rfid/sync/', {
      ...payload,
      farm_id: selectedFarm.id
    });
    return response.data;
  };

  return { syncTags };
};

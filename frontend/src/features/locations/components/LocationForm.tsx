import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select';
import { useLocationsService, Location } from '../services/locationService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFarm } from '../../../hooks/useFarm';

interface LocationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const LocationForm: React.FC<LocationFormProps> = ({ onSuccess, onCancel }) => {
  const { createLocation } = useLocationsService();
  const { selectedFarm } = useFarm();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<Location>>({
    name: '',
    type: 'paddock',
    manual_area_hectares: '',
  });

  const mutation = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', selectedFarm?.id] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-bold border-b pb-2">Nueva Ubicación</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Nombre de la Ubicación</label>
        <Input 
          placeholder="Ej: Potrero El Sauce" 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo</label>
        <Select 
          value={formData.type} 
          onValueChange={(value: any) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paddock">Potrero</SelectItem>
            <SelectItem value="corral">Corral</SelectItem>
            <SelectItem value="pen">Brete / Manga</SelectItem>
            <SelectItem value="temporary_plot">Parcela Temporal</SelectItem>
            <SelectItem value="custom">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Superficie (Hectáreas)</label>
        <Input 
          type="number" 
          step="0.01" 
          placeholder="0.00" 
          value={formData.manual_area_hectares || ''}
          onChange={(e) => setFormData({ ...formData, manual_area_hectares: e.target.value })}
        />
        <p className="text-[10px] text-gray-500 italic">Si no tiene polígono, ingrese el área manualmente.</p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="button" 
          variant="secondary" 
          className="flex-1" 
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="flex-1 font-bold"
          disabled={mutation.isPending || !formData.name}
        >
          {mutation.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
      
      {mutation.isError && (
        <p className="text-sm text-red-500 mt-2 text-center">
          Error al guardar. Verifique los datos.
        </p>
      )}
    </form>
  );
};

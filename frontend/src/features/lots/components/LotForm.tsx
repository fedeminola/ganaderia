import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useLotsService, Lot } from '../services/lotService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFarm } from '../../../hooks/useFarm';

interface LotFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const LotForm: React.FC<LotFormProps> = ({ onSuccess, onCancel }) => {
  const { createLot } = useLotsService();
  const { selectedFarm } = useFarm();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<Lot>>({
    name: '',
    description: '',
  });

  const mutation = useMutation({
    mutationFn: createLot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots', selectedFarm?.id] });
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
      <h3 className="text-lg font-bold border-b pb-2">Nuevo Lote</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Nombre del Lote</label>
        <Input 
          placeholder="Ej: Terneros Destete 2024" 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Descripción (Opcional)</label>
        <Input 
          placeholder="Ej: Lote de recría" 
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
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

import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select';
import { useAnimalsService, Animal } from '../services/animalService';
import { useLocationsService } from '../../locations/services/locationService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFarm } from '../../../hooks/useFarm';

interface AnimalFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AnimalForm: React.FC<AnimalFormProps> = ({ onSuccess, onCancel }) => {
  const { createAnimal, getSpecies, getCategories } = useAnimalsService();
  const { getLocations } = useLocationsService();
  const { selectedFarm } = useFarm();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<Animal>>({
    rfid: '',
    visual_tag: '',
    internal_number: '',
    species: '',
    category: '',
    sex: 'female',
    status: 'active',
    current_location: '',
  });

  const { data: species } = useQuery({
    queryKey: ['species', selectedFarm?.id],
    queryFn: getSpecies,
    enabled: !!selectedFarm,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', selectedFarm?.id, formData.species],
    queryFn: () => getCategories(formData.species),
    enabled: !!selectedFarm && !!formData.species,
  });

  const { data: locations } = useQuery({
    queryKey: ['locations', selectedFarm?.id],
    queryFn: getLocations,
    enabled: !!selectedFarm,
  });

  const mutation = useMutation({
    mutationFn: createAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals', selectedFarm?.id] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rfid || !formData.species) return;
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border shadow-sm max-h-[90vh] overflow-y-auto">
      <h3 className="text-lg font-bold border-b pb-2">Nuevo Animal</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">RFID</label>
          <Input 
            placeholder="Escanee o ingrese RFID" 
            value={formData.rfid}
            onChange={(e) => setFormData({ ...formData, rfid: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nº Interno</label>
          <Input 
            placeholder="Ej: 1024" 
            value={formData.internal_number || ''}
            onChange={(e) => setFormData({ ...formData, internal_number: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Especie</label>
          <Select 
            value={formData.species} 
            onValueChange={(value) => setFormData({ ...formData, species: value, category: '' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione especie" />
            </SelectTrigger>
            <SelectContent>
              {species?.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Categoría</label>
          <Select 
            value={formData.category || ''} 
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            disabled={!formData.species}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Sexo</label>
          <Select 
            value={formData.sex} 
            onValueChange={(value: any) => setFormData({ ...formData, sex: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Hembra</SelectItem>
              <SelectItem value="male">Macho</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ubicación Inicial</label>
          <Select 
            value={formData.current_location || ''} 
            onValueChange={(value) => setFormData({ ...formData, current_location: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione ubicación" />
            </SelectTrigger>
            <SelectContent>
              {locations?.map((l: any) => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          disabled={mutation.isPending || !formData.rfid || !formData.species}
        >
          {mutation.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
      
      {mutation.isError && (
        <p className="text-sm text-red-500 mt-2 text-center">
          Error al guardar. Verifique si el RFID ya existe.
        </p>
      )}
    </form>
  );
};

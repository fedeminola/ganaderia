import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAnimalsService, Animal } from '../services/animalService';
import { useFarm } from '../../../hooks/useFarm';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimalForm } from './AnimalForm';

export const AnimalList: React.FC = () => {
  const { getAnimals } = useAnimalsService();
  const { selectedFarm } = useFarm();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  
  const { data: animals, isLoading, error } = useQuery<Animal[]>({
    queryKey: ['animals', selectedFarm?.id, searchTerm],
    queryFn: () => getAnimals(searchTerm),
    enabled: !!selectedFarm,
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
  });

  if (isLoading && !searchTerm) return <div>Cargando animales...</div>;
  if (error) return <div>Error al cargar animales</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Animales</h2>
        {!showForm && (
          <Button size="sm" className="font-bold sm:size-lg" onClick={() => setShowForm(true)}>
            Nuevo Animal
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <AnimalForm 
            onSuccess={() => setShowForm(false)} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar por RFID, Visual o Nro Interno..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      <div className="grid gap-2">
        {animals?.map((animal) => (
          <Card key={animal.id} className="hover:border-primary transition-colors">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">RFID: {animal.rfid}</p>
                <p className="text-sm text-gray-500">
                  Visual: {animal.visual_tag || 'S/N'} | Nro Interno: {animal.internal_number || 'S/N'}
                </p>
                <div className="text-xs mt-1 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-white ${
                    animal.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {animal.status}
                  </span>
                  <span className="text-gray-400 capitalize">{animal.category} - {animal.sex}</span>
                </div>
              </div>
              <div className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/animals/${animal.id}`)}
                >
                  Ver Ficha
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {animals?.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            {searchTerm ? 'No se encontraron animales para esta búsqueda.' : 'No hay animales registrados en esta finca.'}
          </div>
        )}
      </div>
    </div>
  );
};

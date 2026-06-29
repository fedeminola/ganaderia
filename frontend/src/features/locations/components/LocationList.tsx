import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocationsService, Location } from '../services/locationService';
import { useFarm } from '../../../hooks/useFarm';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { LocationForm } from './LocationForm';

export const LocationList: React.FC = () => {
  const { getLocations } = useLocationsService();
  const { selectedFarm } = useFarm();
  const [showForm, setShowForm] = React.useState(false);
  
  const { data: locations, isLoading, error } = useQuery<Location[]>({
    queryKey: ['locations', selectedFarm?.id],
    queryFn: getLocations,
    enabled: !!selectedFarm,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <div>Cargando ubicaciones...</div>;
  if (error) return <div>Error al cargar ubicaciones</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Ubicaciones (Potreros/Corrales)</h2>
        {!showForm && (
          <Button 
            size="lg" 
            className="font-bold"
            onClick={() => setShowForm(true)}
          >
            Nueva Ubicación
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <LocationForm 
            onSuccess={() => setShowForm(false)} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations?.map((location) => (
          <Card key={location.id} className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between">
                <span>{location.name}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                  {location.type}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Área: {location.calculated_area_hectares || location.manual_area_hectares || 'N/A'} ha
                </p>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  {location.animal_count || 0} animales
                </Badge>
              </div>
              {location.polygon && (
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  ✓ Tiene polígono geográfico
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {locations?.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400">
            No hay ubicaciones registradas.
          </div>
        )}
      </div>
    </div>
  );
};

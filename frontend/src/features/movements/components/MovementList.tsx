import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMovementsService, Movement } from '../services/movementService';
import { useFarm } from '../../../hooks/useFarm';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const MovementList: React.FC = () => {
  const { getMovements } = useMovementsService();
  const { selectedFarm } = useFarm();
  
  const { data: movements, isLoading, error } = useQuery<Movement[]>({
    queryKey: ['movements', selectedFarm?.id],
    queryFn: getMovements,
    enabled: !!selectedFarm,
    staleTime: 1000 * 60 * 2, // 2 minutos para movimientos
  });

  if (isLoading) return <div>Cargando movimientos...</div>;
  if (error) return <div>Error al cargar movimientos</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Historial de Movimientos</h2>
        <Button 
          size="lg" 
          className="font-bold"
          onClick={() => alert('Próximamente: Formulario para Nuevo Movimiento')}
        >
          Nuevo Movimiento
        </Button>
      </div>

      <div className="grid gap-2">
        {movements?.map((mov) => (
          <Card key={mov.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">Desde:</span>
                  <span className="font-medium">{mov.origin || 'Desconocido'}</span>
                  <span className="text-blue-500">→</span>
                  <span className="text-gray-400 text-xs">Hacia:</span>
                  <span className="font-medium">{mov.destination}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(mov.timestamp).toLocaleString()} | {mov.animals_involved.length} animales movidos
                </div>
              </div>
              <Button variant="outline" size="sm">Detalles</Button>
            </CardContent>
          </Card>
        ))}
        {movements?.length === 0 && (
          <div className="text-center py-10 text-gray-400 bg-white rounded-lg">
            No se han registrado movimientos recientemente.
          </div>
        )}
      </div>
    </div>
  );
};

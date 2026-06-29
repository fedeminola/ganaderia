import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLotsService, Lot } from '../services/lotService';
import { useFarm } from '../../../hooks/useFarm';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { LotForm } from './LotForm';

export const LotList: React.FC = () => {
  const { getLots } = useLotsService();
  const { selectedFarm } = useFarm();
  const navigate = useNavigate();
  const [showForm, setShowForm] = React.useState(false);
  
  const { data: lots, isLoading, error } = useQuery<Lot[]>({
    queryKey: ['lots', selectedFarm?.id],
    queryFn: getLots,
    enabled: !!selectedFarm,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <div>Cargando lotes...</div>;
  if (error) return <div>Error al cargar lotes</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Lotes de Animales</h2>
        {!showForm && (
          <Button 
            size="lg" 
            className="font-bold"
            onClick={() => setShowForm(true)}
          >
            Nuevo Lote
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <LotForm 
            onSuccess={() => setShowForm(false)} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2">
        {lots?.map((lot) => (
          <Card 
            key={lot.id} 
            className="hover:border-primary transition-colors cursor-pointer"
            onClick={() => navigate(`/lots/${lot.id}`)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>{lot.name}</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {lot.memberships?.length || 0} animales
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lot.description && (
                <p className="text-sm text-gray-500 mb-2 italic line-clamp-2">
                  {lot.description}
                </p>
              )}
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm">Ver Detalles</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {lots?.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400 bg-white rounded-lg border-2 border-dashed">
            No hay lotes creados para esta finca.
          </div>
        )}
      </div>
    </div>
  );
};

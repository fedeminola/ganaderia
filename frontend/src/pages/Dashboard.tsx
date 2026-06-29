import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFarm } from '../hooks/useFarm';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

interface DashboardStats {
  total_animals: number;
  missing_alerts: number;
  recent_movements: number;
  animals_per_location: { name: string; animal_count: number }[];
  animals_per_category: { name: string; animal_count: number }[];
}

const Dashboard: React.FC = () => {
  const { apiClient } = useAuth();
  const { selectedFarm } = useFarm();

  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', selectedFarm?.id],
    queryFn: async () => {
      const response = await apiClient.get(`/dashboard/stats/?farm_id=${selectedFarm?.id}`);
      return response.data;
    },
    enabled: !!selectedFarm,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  if (!selectedFarm) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-gray-700">Bienvenido</h2>
        <p className="mt-2 text-gray-500">Por favor, seleccione una finca para ver el panel de control.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4 animate-pulse text-gray-500 text-center">Cargando dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 text-center bg-red-50 rounded-lg border border-red-200 m-4">
        Error al cargar los datos del dashboard.
      </div>
    );
  }

  if (!stats) {
    return <div className="p-4 text-center text-gray-400">No hay datos disponibles para esta finca.</div>;
  }

  const mainStats = [
    { name: 'Total Animales Activos', stat: stats.total_animals, color: 'text-blue-600' },
    { name: 'Alertas de Faltantes', stat: stats.missing_alerts, color: 'text-red-600' },
    { name: 'Movimientos (7 días)', stat: stats.recent_movements, color: 'text-green-600' },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard: {selectedFarm.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mainStats.map((item) => (
          <Card key={item.name}>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-medium text-gray-500">{item.name}</h3>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${item.color}`}>{item.stat}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Animales por Ubicación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.animals_per_location.length > 0 ? (
                stats.animals_per_location.map((loc) => (
                  <div key={loc.name} className="flex justify-between items-center border-b pb-1 last:border-0">
                    <span className="text-gray-600">{loc.name}</span>
                    <span className="font-semibold text-gray-900">{loc.animal_count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic text-center py-4">Sin datos de ubicaciones</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Animales por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.animals_per_category.length > 0 ? (
                stats.animals_per_category.map((cat) => (
                  <div key={cat.name} className="flex justify-between items-center border-b pb-1 last:border-0">
                    <span className="text-gray-600">{cat.name}</span>
                    <span className="font-semibold text-gray-900">{cat.animal_count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic text-center py-4">Sin datos de categorías</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
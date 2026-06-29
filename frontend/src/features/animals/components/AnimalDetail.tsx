import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAnimalsService, Animal } from '../services/animalService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft, Calendar, Tag, MapPin, Hash, Info, History as HistoryIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '../../../components/ui/Badge';

export const AnimalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAnimalById } = useAnimalsService();

  const { data: animal, isLoading, error } = useQuery<Animal>({
    queryKey: ['animal', id],
    queryFn: () => getAnimalById(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8 text-center">Cargando ficha del animal...</div>;
  if (error || !animal) return <div className="p-8 text-center text-red-500">Error al cargar el animal</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h2 className="text-2xl font-bold">Ficha de Animal</h2>
      </div>

      {/* Header Info Card */}
      <Card className="bg-primary text-white overflow-hidden border-none shadow-xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider">RFID Tag</p>
              <h3 className="text-3xl font-black mt-1">{animal.rfid}</h3>
              <div className="flex gap-2 mt-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-none hover:bg-white/30 px-3 py-1">
                  {animal.category}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-none hover:bg-white/30 px-3 py-1">
                  {animal.sex === 'male' ? 'Macho' : 'Hembra'}
                </Badge>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
              animal.status === 'active' ? 'bg-green-400 text-green-950' : 'bg-red-400 text-red-950'
            }`}>
              {animal.status.toUpperCase()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Hash className="w-4 h-4" /> Identificación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Visual Tag</span>
              <span className="font-bold">{animal.visual_tag || '---'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Nro Interno</span>
              <span className="font-bold">{animal.internal_number || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Especie</span>
              <span className="font-bold capitalize">{animal.species}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Fechas y Origen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Nacimiento</span>
              <span className="font-bold">
                {animal.birth_date ? format(new Date(animal.birth_date), "dd/MM/yyyy") : '---'}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Madre (RFID)</span>
              <span className="font-bold truncate max-w-[150px]">{animal.mother || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Registrado el</span>
              <span className="font-bold">
                {format(new Date(animal.created_at!), "dd/MM/yyyy")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Ubicación y Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col p-3 bg-gray-50 rounded-lg">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Ubicación Actual</span>
              <span className="font-bold text-lg">{animal.current_location || 'Sin asignar'}</span>
            </div>
            <div className="flex flex-col p-3 bg-gray-50 rounded-lg">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Lote Actual</span>
              <span className="font-bold text-lg">{animal.current_lot || 'Sin lote'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {animal.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Info className="w-4 h-4" /> Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg border border-amber-100 italic">
              "{animal.notes}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t flex gap-2 lg:hidden">
        <Button className="flex-1 h-12 font-bold" onClick={() => navigate('/rfid')}>
          Nueva Operación
        </Button>
        <Button variant="outline" className="flex-1 h-12 font-bold" onClick={() => navigate('/history')}>
          Ver Eventos
        </Button>
      </div>
    </div>
  );
};

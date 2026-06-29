import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEventsService, AnimalEvent } from '../services/eventService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useFarm } from '../../../hooks/useFarm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { History, Search, Filter } from 'lucide-react';
import { Input } from '../../../components/ui/Input';

export const AnimalEventList: React.FC = () => {
  const { getEvents } = useEventsService();
  const { selectedFarm } = useFarm();
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: events = [], isLoading } = useQuery<AnimalEvent[]>({
    queryKey: ['animal-events', selectedFarm?.id],
    queryFn: getEvents,
    enabled: !!selectedFarm,
    staleTime: 30000,
  });

  const filteredEvents = events.filter(event => 
    event.animal_rfid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.animal_internal_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getEventLabel(event.type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const getEventBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'birth': return 'default';
      case 'movement': return 'outline';
      case 'weighing': return 'secondary';
      case 'treatment':
      case 'vaccination':
      case 'apply_treatment': return 'destructive';
      case 'death': return 'destructive';
      case 'sale': return 'default';
      case 'count': return 'default';
      case 'missing': return 'destructive';
      default: return 'outline';
    }
  };

  const getEventLabel = (type: string) => {
    const labels: Record<string, string> = {
      birth: 'Nacimiento',
      movement: 'Movimiento',
      vaccination: 'Vacunación',
      treatment: 'Tratamiento',
      apply_treatment: 'Sanidad',
      service: 'Servicio',
      calving: 'Parto',
      weaning: 'Destete',
      weighing: 'Pesaje',
      death: 'Muerte',
      sale: 'Venta',
      count: 'Conteo',
      missing: 'Faltante',
      associate_tag: 'Asociación RFID',
    };
    return labels[type.toLowerCase()] || type;
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por RFID, Nº Interno o Tipo..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <History className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron eventos</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getEventBadgeVariant(event.type)}>
                        {getEventLabel(event.type)}
                      </Badge>
                      <span className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
                        {format(new Date(event.timestamp), "d MMM, HH:mm", { locale: es })}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-bold text-gray-900">
                        RFID: {event.animal_rfid || 'N/A'}
                      </p>
                      {event.animal_internal_number && (
                        <p className="text-xs text-gray-600">
                          Nº Interno: {event.animal_internal_number}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    {event.metadata.weight && (
                      <p className="text-base sm:text-lg font-bold text-primary">{event.metadata.weight} kg</p>
                    )}
                    {event.metadata.treatment && (
                      <p className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 inline-block">
                        {event.metadata.treatment}
                      </p>
                    )}
                    {event.metadata.treatment_name && (
                      <p className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 inline-block">
                        {event.metadata.treatment_name}
                      </p>
                    )}
                    {event.metadata.destination_name && (
                      <p className="text-[10px] text-gray-500 mt-1 truncate max-w-[100px] sm:max-w-none">
                        → {event.metadata.destination_name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

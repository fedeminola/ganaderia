import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLotsService, Lot } from '../services/lotService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft, Search, Users, Trash2, UserMinus } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';

export const LotDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLotById } = useLotsService();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: lot, isLoading, error } = useQuery<Lot>({
    queryKey: ['lot', id],
    queryFn: () => getLotById(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8 text-center">Cargando detalle del lote...</div>;
  if (error || !lot) return <div className="p-8 text-center text-red-500">Error al cargar el lote</div>;

  const filteredAnimals = lot.memberships?.filter(m => 
    m.animal.rfid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.animal.internal_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.animal.visual_tag?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{lot.name}</h2>
          <p className="text-gray-500 text-sm">{lot.description || 'Sin descripción'}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-500 p-2 rounded-lg text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase">Total Animales</p>
              <p className="text-2xl font-black text-blue-900">{lot.memberships?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold">Animales en el Lote</h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar tag o nro interno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-2">
          {filteredAnimals.map((membership) => (
            <Card key={membership.id} className="hover:border-primary transition-colors">
              <CardContent className="p-4 flex justify-between items-center">
                <div onClick={() => navigate(`/animals/${membership.animal.id}`)} className="cursor-pointer flex-1">
                  <p className="font-bold text-base">RFID: {membership.animal.rfid}</p>
                  <div className="flex gap-2 text-xs text-gray-500 mt-1">
                    <span>Visual: {membership.animal.visual_tag || '---'}</span>
                    <span>|</span>
                    <span>Nro: {membership.animal.internal_number || '---'}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {membership.animal.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {membership.animal.sex === 'male' ? 'Macho' : 'Hembra'}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => alert('Próximamente: Quitar animal del lote')}
                >
                  <UserMinus className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {filteredAnimals.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed text-gray-400">
              {searchTerm ? 'No se encontraron animales con ese criterio.' : 'Este lote no tiene animales asignados.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

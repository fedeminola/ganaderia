import React, { useState, useEffect } from 'react';
import { useRfidReader } from '../hooks/useRfidReader';
import { useLocationsService, Location } from '../../locations/services/locationService';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select';
import { Bluetooth, BluetoothOff, RefreshCw, Send, Trash2, CheckCircle2, AlertCircle, Keyboard, Wifi } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';

export const RfidSync: React.FC = () => {
  const { 
    status, 
    syncStatus, 
    scannedTags, 
    error: rfidError, 
    isHidMode,
    connect, 
    disconnect, 
    toggleHidMode,
    handleKeyboardInput,
    clearScannedTags, 
    syncTags 
  } = useRfidReader();

  const { getLocations } = useLocationsService();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [syncAction, setSyncAction] = useState<'count' | 'movement' | 'apply_treatment' | 'weighing' | 'associate_tag'>('count');
  const [extraData, setExtraData] = useState<Record<string, any>>({});

  useEffect(() => {
    getLocations().then(data => {
      if (Array.isArray(data)) {
        setLocations(data);
      }
    });
  }, []);

  const handleSync = async () => {
    if (!selectedLocation && syncAction !== 'associate_tag') {
        alert("Por favor seleccione una ubicación");
        return;
    }
    
    // Validaciones específicas
    if (syncAction === 'weighing' && !extraData.weight) {
        alert("Por favor ingrese el peso");
        return;
    }
    
    if (syncAction === 'apply_treatment' && !extraData.treatment) {
        alert("Por favor ingrese el tratamiento");
        return;
    }

    await syncTags(syncAction, selectedLocation, extraData);
  };

  return (
    <div className="flex flex-col gap-4 p-2 sm:p-4 max-w-md mx-auto w-full overflow-hidden">
      <Card className="w-full shadow-lg border-2">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex justify-between items-start">
            <div className="max-w-[180px] sm:max-w-none">
              <CardTitle className="text-xl sm:text-2xl">Lector RFID</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Sincronización en campo</CardDescription>
            </div>
            <Badge variant={status === 'connected' ? 'default' : 'secondary'} className={`text-[10px] sm:text-xs ${status === 'connected' ? (isHidMode ? 'bg-blue-500 text-white' : 'bg-green-500 text-white') : ''}`}>
              {status === 'connected' ? (isHidMode ? 'Modo Teclado' : 'Conectado') : status === 'connecting' ? 'Conectando...' : 'Desconectado'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          {status === 'unavailable' ? (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-xs sm:text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertCircle className="h-4 w-4" />
                Bluetooth No Disponible
              </div>
              <p>Esta función requiere HTTPS o flags habilitados.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-[10px] h-8"
                onClick={() => window.open('https://developer.chrome.com/docs/web-platform/bluetooth/#tips-and-tricks', '_blank')}
              >
                Ver configuración
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                {status !== 'connected' ? (
                  <Button onClick={connect} className="flex-1 h-10 text-xs sm:text-sm" variant="outline" disabled={status === 'connecting'}>
                    <Bluetooth className="mr-2 h-4 w-4" /> Bluetooth
                  </Button>
                ) : (
                  <Button onClick={disconnect} className="flex-1 h-10 text-xs sm:text-sm" variant="destructive">
                    <BluetoothOff className="mr-2 h-4 w-4" /> Cortar
                  </Button>
                )}
                
                <Button 
                  onClick={() => toggleHidMode(!isHidMode)} 
                  className={`flex-1 h-10 text-xs sm:text-sm ${isHidMode ? 'bg-blue-600 text-white' : ''}`} 
                  variant={isHidMode ? 'default' : 'outline'}
                >
                  <Keyboard className="mr-2 h-4 w-4" /> Teclado (HID)
                </Button>
              </div>

              {isHidMode && (
                <div className="animate-in fade-in slide-in-from-top-1">
                  <Input 
                    placeholder="Escanear aquí..." 
                    onKeyDown={handleKeyboardInput}
                    autoFocus
                    className="border-blue-300 focus:ring-blue-500 h-10 text-base"
                  />
                  <p className="text-[10px] text-blue-600 mt-1 flex items-center gap-1 leading-tight">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" /> 
                    Configure su lector en modo HID (Teclado).
                  </p>
                </div>
              )}
            </div>
          )}

          {rfidError && (
            <div className="p-2 bg-red-100 text-red-700 rounded-md text-[11px] flex items-start gap-2 border border-red-200">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>{rfidError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Acción</label>
              <Select value={syncAction} onValueChange={(v: any) => {
                setSyncAction(v);
                setExtraData({}); // Limpiar datos extra al cambiar acción
              }}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Seleccione acción" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="count">Conteo (Inventario)</SelectItem>
                  <SelectItem value="movement">Movimiento (Traslado)</SelectItem>
                  <SelectItem value="weighing">Pesaje</SelectItem>
                  <SelectItem value="apply_treatment">Sanidad (Tratamiento)</SelectItem>
                  <SelectItem value="associate_tag">Asociar RFID a Animal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {syncAction !== 'associate_tag' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Ubicación</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Destino/Actual" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Campos Dinámicos según Acción */}
          {syncAction === 'weighing' && (
            <div className="space-y-2 p-3 bg-slate-50 rounded-md border border-slate-200 animate-in fade-in zoom-in-95">
              <label className="text-sm font-medium">Peso Promedio (kg)</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={extraData.weight || ''} 
                onChange={(e) => setExtraData({...extraData, weight: e.target.value})}
                className="h-10 text-base"
              />
            </div>
          )}

          {syncAction === 'apply_treatment' && (
            <div className="space-y-2 p-3 bg-slate-50 rounded-md border border-slate-200 animate-in fade-in zoom-in-95">
              <label className="text-sm font-medium">Tratamiento / Vacuna</label>
              <Input 
                placeholder="Ej: Aftosa, Ivermectina..." 
                value={extraData.treatment || ''} 
                onChange={(e) => setExtraData({...extraData, treatment: e.target.value})}
                className="h-10 text-base"
              />
            </div>
          )}

          {syncAction === 'associate_tag' && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-xs italic">
              Se asociará el primer tag escaneado al animal.
              <div className="mt-2 space-y-2">
                <label className="font-bold text-amber-900">Número Interno / Caravana Visual</label>
                <Input 
                  placeholder="Ej: 1024" 
                  value={extraData.internal_number || ''} 
                  onChange={(e) => setExtraData({...extraData, internal_number: e.target.value})}
                  className="bg-white border-amber-300 h-10 text-base"
                />
              </div>
            </div>
          )}

          <div className="mt-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold uppercase text-gray-500 tracking-wider">Tags Escaneados</h3>
              <Badge variant="outline" className="text-sm font-mono bg-white">
                {scannedTags.length}
              </Badge>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 min-h-[120px] max-h-[180px] overflow-y-auto border border-dashed border-slate-300 shadow-inner">
              {scannedTags.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-6 text-slate-400">
                  <Wifi className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-xs italic">Comience a escanear...</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {scannedTags.map((tag, idx) => (
                    <li key={`${tag}-${idx}`} className="flex justify-between items-center text-[11px] font-mono bg-white px-2 py-1.5 rounded shadow-sm border border-slate-100">
                      <span>{tag}</span>
                      <span className="text-[9px] text-slate-400 font-sans">#{scannedTags.length - idx}</span>
                    </li>
                  )).reverse()}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 px-4 sm:px-6 pb-6 mt-4">
          <Button 
            variant="outline" 
            onClick={clearScannedTags} 
            disabled={scannedTags.length === 0 || syncStatus === 'syncing'}
            className="w-full h-12 border-2"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Borrar Lista
          </Button>
          <Button 
            onClick={handleSync} 
            disabled={scannedTags.length === 0 || (!selectedLocation && syncAction !== 'associate_tag') || syncStatus === 'syncing'}
            className="w-full h-14 bg-primary text-white hover:bg-primary/90 shadow-lg text-lg font-bold"
          >
            {syncStatus === 'syncing' ? (
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
            ) : syncStatus === 'success' ? (
              <CheckCircle2 className="mr-2 h-5 w-5" />
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            {syncStatus === 'syncing' ? 'Sincronizando...' : syncStatus === 'success' ? '¡Sincronizado!' : 'Enviar Sincronización'}
          </Button>
        </CardFooter>
      </Card>
      
      {syncStatus === 'success' && (
        <div className="p-4 bg-green-600 text-white rounded-lg shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 fixed bottom-4 left-4 right-4 z-[200]">
          <CheckCircle2 className="h-8 w-8 text-green-200" />
          <div>
            <p className="font-bold text-base">¡Enviado con éxito!</p>
            <p className="text-xs opacity-90 text-green-50">Los cambios se verán en segundos.</p>
          </div>
        </div>
      )}
    </div>
  );
};

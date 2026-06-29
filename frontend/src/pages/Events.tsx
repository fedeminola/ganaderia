import React from 'react';
import { AnimalEventList } from '../features/animals/components/AnimalEventList';

const Events = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Historial de Eventos</h2>
      </div>
      <AnimalEventList />
    </div>
  );
};

export default Events;

import React from 'react';
import { MovementList } from '../features/movements/components/MovementList';

const Movements: React.FC = () => {
  return (
    <div className="p-4">
      <MovementList />
    </div>
  );
};

export default Movements;
import React from 'react';
import { AnimalList } from '../features/animals/components/AnimalList';

const Animals: React.FC = () => {
  return (
    <div className="p-4">
      <AnimalList />
    </div>
  );
};

export default Animals;

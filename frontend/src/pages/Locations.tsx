import React from 'react';
import { LocationList } from '../features/locations/components/LocationList';

const Locations: React.FC = () => {
  return (
    <div className="p-4">
      <LocationList />
    </div>
  );
};

export default Locations;
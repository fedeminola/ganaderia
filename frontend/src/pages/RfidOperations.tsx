import React from 'react';
import { RfidSync } from '../features/rfid/components/RfidSync';

export const RfidOperations = () => {
    return (
        <div className="container mx-auto py-6 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Operaciones RFID</h1>
            <RfidSync />
        </div>
    );
};
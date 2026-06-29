import React, { useState, useCallback } from 'react';
import { useRfidService, RfidAction } from '../services/rfidService';

type RfidReaderStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'unavailable';
type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

const parseRfidTag = (value: DataView): string => {
    let hexString = '';
    for (let i = 0; i < value.byteLength; i++) {
        let byte = value.getUint8(i).toString(16);
        if (byte.length < 2) {
            byte = '0' + byte;
        }
        hexString += byte;
    }
    return hexString.toUpperCase();
};

export const useRfidReader = (
    serviceUuid: string = '0000fee7-0000-1000-8000-00805f9b34fb', // Example for generic serial
    characteristicUuid: string = '0000fec8-0000-1000-8000-00805f9b34fb'
) => {
    const [status, setStatus] = useState<RfidReaderStatus>('disconnected');
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [scannedTags, setScannedTags] = useState<string[]>([]);
    const [device, setDevice] = useState<BluetoothDevice | null>(null);
    const [server, setServer] = useState<BluetoothRemoteGATTServer | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isHidMode, setIsHidMode] = useState(false);
    const { syncTags: syncTagsApi } = useRfidService();

    // HID/Keyboard Mode logic
    const handleKeyboardInput = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isHidMode) return;
        
        // Tru-Test in HID mode usually sends digits followed by Enter
        if (event.key === 'Enter') {
            const inputElement = event.currentTarget;
            const tag = inputElement.value?.trim();
            if (tag && tag.length >= 10) { // RFID tags are usually long
                setScannedTags((prevTags) =>
                    prevTags.includes(tag) ? prevTags : [...prevTags, tag]
                );
                inputElement.value = ''; // Clear for next scan
            }
        }
    }, [isHidMode]);

    const toggleHidMode = useCallback((enabled: boolean) => {
        setIsHidMode(enabled);
        if (enabled) {
            setStatus('connected');
            setError(null);
        } else {
            setStatus('disconnected');
        }
    }, []);

    const handleCharacteristicValueChanged = (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        const value = target.value;
        if (value) {
            const rfidTag = parseRfidTag(value);
            setScannedTags((prevTags) =>
                prevTags.includes(rfidTag) ? prevTags : [...prevTags, rfidTag]
            );
        }
    };

    const connect = useCallback(async () => {
        if (!navigator.bluetooth) {
            setError('Web Bluetooth API is not available in this browser.');
            setStatus('unavailable');
            return;
        }

        setStatus('connecting');
        setError(null);
        try {
            const btDevice = await navigator.bluetooth.requestDevice({
                filters: [{ services: [serviceUuid] }],
                optionalServices: [serviceUuid]
            });
            setDevice(btDevice);

            const btServer = await btDevice.gatt?.connect();
            if (!btServer) {
                setError('Failed to connect to GATT server.');
                setStatus('error');
                return;
            }
            setServer(btServer);

            const service = await btServer.getPrimaryService(serviceUuid);
            const characteristic = await service.getCharacteristic(characteristicUuid);

            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

            btDevice.addEventListener('gattserverdisconnected', () => {
                setStatus('disconnected');
                setServer(null);
            });

            setStatus('connected');
        } catch (err) {
            console.error('Failed to connect to RFID reader:', err);
            setError((err as Error).message);
            setStatus('error');
        }
    }, [serviceUuid, characteristicUuid]);

    const disconnect = useCallback(() => {
        if (server) {
            server.disconnect();
            setServer(null);
            setStatus('disconnected');
        }
    }, [server]);

    const clearScannedTags = useCallback(() => {
        setScannedTags([]);
        setSyncStatus('idle');
    }, []);

    const syncTags = useCallback(async (
        action: RfidAction,
        location_id: string,
        extra_data?: Record<string, any>
    ) => {
        if (scannedTags.length === 0) return;
        setSyncStatus('syncing');
        setError(null);
        try {
            await syncTagsApi({
                action,
                location_id,
                rfid_tags: scannedTags,
                extra_data,
            });
            setSyncStatus('success');
        } catch (err) {
            console.error('Failed to sync RFID tags, saving for later:', err);
            
            // Offline capability: Save to localStorage if sync fails
            const offlineQueue = JSON.parse(localStorage.getItem('rfid_sync_queue') || '[]');
            offlineQueue.push({
                action,
                location_id,
                rfid_tags: scannedTags,
                extra_data,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('rfid_sync_queue', JSON.stringify(offlineQueue));
            
            setError('Sin conexión. Los datos se guardaron localmente y se sincronizarán pronto.');
            setSyncStatus('error');
        }
    }, [scannedTags, syncTagsApi]);

    return { 
        status, 
        syncStatus, 
        scannedTags, 
        error, 
        isHidMode,
        connect, 
        disconnect, 
        toggleHidMode,
        handleKeyboardInput,
        clearScannedTags, 
        syncTags 
    };
};

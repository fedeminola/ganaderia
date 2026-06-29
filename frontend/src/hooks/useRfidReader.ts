import { useState, useCallback } from 'react';
import { apiClient } from '../lib/apiClient'; // Assuming you have an API client

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
    serviceUuid: string | null | undefined,
    characteristicUuid: string | null | undefined
) => {
    const [status, setStatus] = useState<RfidReaderStatus>('disconnected');
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [scannedTags, setScannedTags] = useState<string[]>([]);
    const [device, setDevice] = useState<BluetoothDevice | null>(null);
    const [server, setServer] = useState<BluetoothRemoteGATTServer | null>(null);
    const [error, setError] = useState<string | null>(null);

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

        if (!serviceUuid || !characteristicUuid) {
            setError('RFID Reader UUIDs are not configured for this farm.');
            setStatus('error');
            return;
        }

        setStatus('connecting');
        setError(null);
        try {
            const btDevice = await navigator.bluetooth.requestDevice({
                filters: [{ services: [serviceUuid] }],
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

    const disconnect = useCallback(async () => {
        if (server) {
            server.disconnect();
        }
    }, [server]);

    const clearScannedTags = useCallback(() => {
        setScannedTags([]);
    }, []);

    const syncTags = useCallback(async (
        action: 'count' | 'movement' | 'apply_treatment',
        location_id: string,
        extra_data?: Record<string, any>
    ) => {
        if (scannedTags.length === 0) return;
        setSyncStatus('syncing');
        setError(null);
        try {
            await apiClient.post('/rfid/sync/', {
                action,
                location_id,
                rfid_tags: scannedTags,
                extra_data,
            });
            setSyncStatus('success');
        } catch (err) {
            console.error('Failed to sync RFID tags:', err);
            setError((err as Error).message);
            setSyncStatus('error');
        }
    }, [scannedTags]);

    return { status, syncStatus, scannedTags, error, connect, disconnect, clearScannedTags, syncTags };
};
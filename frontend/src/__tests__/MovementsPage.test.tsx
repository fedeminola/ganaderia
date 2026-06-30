import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { FarmProvider } from '../context/FarmContext';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Movements from '../pages/Movements';
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderComponent = () => {
  localStorage.setItem('accessToken', 'fake-token');
  localStorage.setItem('selectedFarmId', 'farm-1');

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FarmProvider>
          <MemoryRouter initialEntries={['/movements']}>
            <Routes>
              <Route path="/movements" element={<Movements />} />
            </Routes>
          </MemoryRouter>
        </FarmProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Movements Page', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  test('fetches and displays a list of movements', async () => {
    const movements = [
      { id: '1', animal: 'RFID001', origin: 'Paddock A', destination: 'Barn', date: '2023-10-01' },
      { id: '2', animal: 'RFID002', origin: 'Paddock B', destination: 'Paddock C', date: '2023-10-02' },
    ];

    mockedAxios.get.mockResolvedValue({ data: movements });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('RFID001')).toBeInTheDocument();
      expect(screen.getByText('RFID002')).toBeInTheDocument();
      expect(screen.getByText('Barn')).toBeInTheDocument();
      expect(screen.getByText('Paddock C')).toBeInTheDocument();
    });
  });

  test('shows an error message if fetching fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Failed to fetch'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch movements/i)).toBeInTheDocument();
    });
  });
});
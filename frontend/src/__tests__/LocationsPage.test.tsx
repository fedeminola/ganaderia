import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { FarmProvider } from '../context/FarmContext';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Locations from '../pages/Locations';
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
          <MemoryRouter initialEntries={['/locations']}>
            <Routes>
              <Route path="/locations" element={<Locations />} />
            </Routes>
          </MemoryRouter>
        </FarmProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Locations Page', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  test('fetches and displays a list of locations', async () => {
    const locations = [
      { id: '1', name: 'Paddock A', type: 'Paddock' },
      { id: '2', name: 'Barn', type: 'Building' },
    ];

    mockedAxios.get.mockResolvedValue({ data: locations });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Paddock A')).toBeInTheDocument();
      expect(screen.getByText('Barn')).toBeInTheDocument();
    });
  });

  test('shows an error message if fetching fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Failed to fetch'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch locations/i)).toBeInTheDocument();
    });
  });
});
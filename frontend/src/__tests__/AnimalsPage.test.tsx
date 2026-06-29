import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { FarmProvider } from '../context/FarmContext';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Animals from '../pages/Animals';
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
  // Mock necessary context providers
  localStorage.setItem('accessToken', 'fake-token');
  localStorage.setItem('selectedFarmId', 'farm-1'); // Ensure a farm is selected

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FarmProvider>
          <MemoryRouter initialEntries={['/animals']}>
            <Routes>
              <Route path="/animals" element={<Animals />} />
            </Routes>
          </MemoryRouter>
        </FarmProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Animals Page', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  test('fetches and displays a list of animals', async () => {
    const animals = [
      { id: '1', rfid: 'RFID001', species: 'Bovine', category: 'Cow', current_location: 'Paddock 1', status: 'Active' },
      { id: '2', rfid: 'RFID002', species: 'Bovine', category: 'Bull', current_location: 'Paddock 2', status: 'Active' },
    ];

    mockedAxios.get.mockResolvedValue({ data: animals });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('RFID001')).toBeInTheDocument();
      expect(screen.getByText('RFID002')).toBeInTheDocument();
      expect(screen.getByText('Paddock 1')).toBeInTheDocument();
      expect(screen.getByText('Paddock 2')).toBeInTheDocument();
    });
  });

  test('shows an error message if fetching fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Failed to fetch'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch animals/i)).toBeInTheDocument();
    });
  });
});
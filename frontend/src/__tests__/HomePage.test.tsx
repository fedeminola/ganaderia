import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { FarmProvider } from '../context/FarmContext';
import { MemoryRouter } from 'react-router-dom';
import App from '../App'; // We test the whole app to have all contexts
import { vi } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderApp = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FarmProvider>
          <MemoryRouter initialEntries={['/']}>
            <App />
          </MemoryRouter>
        </FarmProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('HomePage / Dashboard', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedAxios.get.mockReset();
    localStorage.clear();
  });

  test('shows loading state initially', () => {
    localStorage.setItem('accessToken', 'fake-token');
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // For farms
    renderApp();
    expect(screen.getByText(/Loading dashboard.../i)).toBeInTheDocument();
  });

  test('shows welcome message if no farm is selected', () => {
    localStorage.setItem('accessToken', 'fake-token');
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // No farms
    renderApp();
    expect(screen.getByText(/Please select a farm to view the dashboard./i)).toBeInTheDocument();
  });

  test('fetches and displays dashboard stats when a farm is selected', async () => {
    localStorage.setItem('accessToken', 'fake-token');

    const farms = [{ id: 'farm-1', name: 'My Farm' }];
    const stats = {
      total_animals: 120,
      missing_alerts: 5,
      recent_movements: 15,
      animals_per_location: [{ name: 'Paddock A', animal_count: 50 }],
      animals_per_category: [{ name: 'Cows', animal_count: 70 }],
    };

    // Mock farm and stats endpoints
    mockedAxios.get.mockResolvedValueOnce({ data: farms }); // For useFarm hook
    mockedAxios.get.mockResolvedValueOnce({ data: stats }); // For useQuery in HomePage

    renderApp();

    // Wait for the stats to be displayed
    await waitFor(() => {
      expect(screen.getByText('Dashboard for My Farm')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Active Animals')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();

    expect(screen.getByText('Missing Alerts')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByText('Animals per Location')).toBeInTheDocument();
    expect(screen.getByText('Paddock A')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();

    expect(screen.getByText('Animals per Category')).toBeInTheDocument();
    expect(screen.getByText('Cows')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
  });

  test('shows error message if stats fetching fails', async () => {
    localStorage.setItem('accessToken', 'fake-token');
    const farms = [{ id: 'farm-1', name: 'My Farm' }];

    mockedAxios.get.mockResolvedValueOnce({ data: farms }); // For useFarm hook
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error')); // For useQuery in HomePage

    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/Error loading dashboard stats./i)).toBeInTheDocument();
    });
  });
});
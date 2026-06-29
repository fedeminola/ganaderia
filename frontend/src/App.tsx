import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';
import { useAuth } from './hooks/useAuth';
import { useFarm } from './hooks/useFarm';
import { useAnimalsService, Animal } from '../features/animals/services/animalService';
import { useEventsService } from '../features/animals/services/eventService';
import { RfidOperations } from './pages/RfidOperations';
import { LoginPage } from './pages/Login';
import Dashboard from './pages/Dashboard';
import Animals from './pages/Animals';
import { AnimalDetail } from './features/animals/components/AnimalDetail';
import { LotDetail } from './features/lots/components/LotDetail';
import Locations from './pages/Locations';
import Movements from './pages/Movements';
import Lots from './pages/Lots';
import Events from './pages/Events';
import { Button } from './components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import { Menu, X, LogOut, LayoutDashboard, Database, MapPin, Repeat, Tags, Wifi, History } from 'lucide-react';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FarmProvider>
          <Router>
            <MainApp />
          </Router>
        </FarmProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const MainApp = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Header />}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/rfid" element={<ProtectedRoute><RfidOperations /></ProtectedRoute>} />
          <Route path="/animals" element={<ProtectedRoute><Animals /></ProtectedRoute>} />
          <Route path="/animals/:id" element={<ProtectedRoute><AnimalDetail /></ProtectedRoute>} />
          <Route path="/locations" element={<ProtectedRoute><Locations /></ProtectedRoute>} />
          <Route path="/lots" element={<ProtectedRoute><Lots /></ProtectedRoute>} />
          <Route path="/lots/:id" element={<ProtectedRoute><LotDetail /></ProtectedRoute>} />
          <Route path="/movements" element={<ProtectedRoute><Movements /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

const Header = () => {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { label: 'Home', path: '/', icon: LayoutDashboard },
    { label: 'Animales', path: '/animals', icon: Database },
    { label: 'Ubicaciones', path: '/locations', icon: MapPin },
    { label: 'Lotes', path: '/lots', icon: Tags },
    { label: 'Movimientos', path: '/movements', icon: Repeat },
    { label: 'Operaciones RFID', path: '/rfid', icon: Wifi },
    { label: 'Historial', path: '/events', icon: History },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mr-4 sm:mr-8 truncate">
              Ganadera RFID
            </h1>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                >
                  <item.icon className="w-4 h-4 mr-1.5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
            <FarmSelector />
            <Button variant="outline" size="sm" onClick={logout} className="flex items-center">
              <LogOut className="w-4 h-4 mr-1.5" />
              Salir
            </Button>
          </div>

          {/* Mobile menu button and selector */}
          <div className="lg:hidden flex items-center space-x-2 min-w-0">
            <div className="flex-shrink w-[140px] xs:w-[180px]">
              <FarmSelector />
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none flex-shrink-0"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="w-full text-left text-red-600 hover:bg-red-50 block px-3 py-2 rounded-md text-base font-medium flex items-center"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Salir
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

const FarmSelector = () => {
    const { farms, selectedFarm, selectFarm, isLoading } = useFarm();

    console.log('[FarmSelector] Render. IsLoading:', isLoading, 'Farms count:', farms.length, 'SelectedFarm ID:', selectedFarm?.id || 'null');

    if (isLoading) {
      return <div className="w-full h-9 bg-gray-200 rounded-md animate-pulse" />;
    }

    return (
        <select
            value={selectedFarm?.id || ''}
            onChange={(e) => selectFarm(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md truncate"
            disabled={farms.length === 0}
        >
            {farms.length === 0 ? (
              <option>No farms found</option>
            ) : (
              farms.map(farm => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
              ))
            )}
        </select>
    );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default App;
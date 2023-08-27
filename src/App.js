import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import AceptarInvitacion from './components/AceptarInvitacion';
import { AuthProvider } from './hooks/auth-context'; // Asegúrate de importar AuthProvider

function App() {
  return (
    <Router>
      <AuthProvider> {/* Envuelve tu aplicación con AuthProvider */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/aceptar-invitacion/:token" element={<AceptarInvitacion />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

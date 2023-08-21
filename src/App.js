import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './auth-context'; // Asegúrate de importar AuthProvider

function App() {
  return (
    <Router>
      <AuthProvider> {/* Envuelve tu aplicación con AuthProvider */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

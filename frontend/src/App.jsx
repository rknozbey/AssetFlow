import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';

// YENİ: Korumalı Rota (Route Guard) Bileşeni
// Bu bileşen, giriş yapılmadan dashboard'a erişilmesini engeller.
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // Eğer token yoksa login sayfasına yönlendir, varsa istenen sayfayı (children) göster
  return token ? children : <Navigate to="/login" replace />;
};

// Geçici Dashboard Sayfası
function Dashboard() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">AssetFlow Ana Paneli</h1>
        <p className="text-gray-600">Sisteme başarıyla giriş yaptınız. Güvenli rota (Protected Route) aktif!</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Kök dizine gelenleri direkt login sayfasına yönlendir */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Giriş Sayfası */}
        <Route path="/login" element={<Login />} />
        
        {/* Korumalı Dashboard Sayfası */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import Dashboard from './components/Dashboard'; // DİKKAT: Burayı ./pages yerine ./components olarak güncelledik// DİKKAT: Dashboard dosyasını hangi klasöre açtıysan yolunu ona göre güncelle (örn: './components/Dashboard' olabilir)

// Korumalı Rota (Route Guard) Bileşeni
// Bu bileşen, giriş yapılmadan dashboard'a erişilmesini engeller.
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // Eğer token yoksa login sayfasına yönlendir, varsa istenen sayfayı (children) göster
  return token ? children : <Navigate to="/login" replace />;
};

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
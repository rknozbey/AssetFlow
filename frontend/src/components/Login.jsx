import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError(''); // Yeni denemede eski hatayı temizle
    
    try {
      const response = await axios.post('http://localhost:5026/api/auth/login', {
        email: email,
        password: password
      });
      
      const token = response.data.token; 
      
      // 1. Token'ı localStorage'a kaydet
      localStorage.setItem('token', token); 

      // 2. Token'ı çözümle
      const decodedToken = jwtDecode(token);
      
      // 3. .NET'in gönderdiği formattan Rol bilgisini güvenli bir şekilde çıkar
      // Backend şema URL'si kullanıyorsa ilkini, basit 'role' kullanıyorsa ikincisini alır
      const userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decodedToken.role;
      
      // Rolü de diğer bileşenlerde (örn. Sidebar'da) okumak için kaydedelim
      if (userRole) {
        localStorage.setItem('role', userRole);
      }

      console.log("Giriş Başarılı! Atanan Rol:", userRole);

      // 4. Dashboard'a yönlendir
      navigate('/dashboard');
      
    } catch (err) {
      console.error("Giriş yapılırken hata oluştu:", err);
      
      // Backend'den anlamlı bir hata mesajı geliyorsa onu yakala, yoksa standart mesajı göster
      const errorMessage = err.response?.data?.message || err.response?.data || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
      setError(typeof errorMessage === 'string' ? errorMessage : "Bağlantı veya yetkilendirme hatası.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">AssetFlow</h2>
          <p className="mt-2 text-sm text-gray-600">Lütfen personel veya admin bilgilerinizle giriş yapın</p>
        </div>
        
        <form className="space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">E-posta Adresi</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" 
              placeholder="ornek@assetflow.com" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Şifre</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" 
              placeholder="••••••••" 
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold transition-colors"
          >
            Sisteme Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
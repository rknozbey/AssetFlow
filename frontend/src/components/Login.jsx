import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // YENİ: Token içeriğini (Rolleri) okumak için eklendi

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Backend'den dönen hataları tutacağımız state
  
  const navigate = useNavigate(); // Yönlendirme fonksiyonunu başlattık

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError(''); // Yeni denemede eski hatayı temizle
    
    try {
      const response = await axios.post('http://localhost:5026/api/auth/login', {
        email: email,
        password: password
      });

      console.log("Backend'den gelen tam yanıt:", response.data);
      
      const token = response.data.token; // Token'ı bir değişkene aldık
      
      // 1. Backend'den dönen Token'ı localStorage'a kaydediyoruz
      localStorage.setItem('token', token); 

      // 2. Token'ı çözümlüyor ve içindeki bilgileri (Rol, Email vs.) konsola yazdırıyoruz
      const decodedToken = jwtDecode(token);
      console.log("Çözümlenen Token İçeriği (Rol bilgisi burada olacak):", decodedToken);

      // 3. Giriş başarılı olunca kullanıcıyı dashboard'a gönder
      navigate('/dashboard');
      
    } catch (err) {
      // Eğer backend hata fırlatırsa (Yanlış şifre, 404, 500 vs.) burası çalışır
      console.error("Giriş yapılırken hata oluştu:", err);
      setError("Giriş başarısız. Lütfen bilgilerinizi veya bağlantıyı kontrol edin.");
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
          {/* Hata mesajı varsa ekranda kırmızı renkte göster */}
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
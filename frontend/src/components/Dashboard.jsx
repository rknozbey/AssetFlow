import { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosInstance'; // '../api/...' yerine '../services/...' oldu

const Dashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // LocalStorage'dan rol bilgisini de okuyalım, ekranda kime hitap ettiğimizi bilelim
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    // Sayfa yüklendiğinde API'den verileri çekecek fonksiyon
    const fetchAssets = async () => {
      try {
        // DİKKAT: Artık axios.get değil, axiosInstance.get kullanıyoruz.
        // Ve header içine manuel olarak Token eklemiyoruz! Interceptor hallediyor.
        // URL olarak sadece endpoint'i yazmamız yeterli çünkü baseURL'i "http://localhost:5026/api" olarak ayarladık.
        const response = await axiosInstance.get('/Asset'); 
        
        console.log("API'den başarıyla çekilen varlıklar:", response.data);
        setAssets(response.data);
      } catch (err) {
        console.error("Veri çekilirken hata oluştu:", err);
        setError("Varlıklar yüklenirken bir sorun oluştu veya yetkiniz yok.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Kontrol Paneli</h1>
        <p className="text-gray-600 mb-6">
          Sisteme <span className="font-semibold text-blue-600">{userRole}</span> yetkisiyle giriş yaptınız.
        </p>

        {loading ? (
          <p className="text-gray-500 animate-pulse">Varlıklar yükleniyor...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-3">Sistemdeki Varlıklar</h2>
            {assets.length === 0 ? (
              <p className="text-sm text-gray-500">Henüz kayıtlı bir varlık bulunmuyor.</p>
            ) : (
              <ul className="space-y-2">
                {/* Gelen verinin yapısına göre buradaki alanları (name, id vs.) güncelleyebilirsin */}
                {assets.map((asset, index) => (
                  <li key={index} className="p-3 bg-gray-100 rounded border border-gray-200">
                    {asset.name || `Varlık ID: ${asset.id}`} 
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
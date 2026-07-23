import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. YENİ: Yönlendirme için eklendi
import axiosInstance from '../services/axiosInstance'; 

const Dashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const userRole = localStorage.getItem('role');
  const navigate = useNavigate(); // 2. YENİ: Yönlendirme fonksiyonunu tanımladık

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const endpoint = userRole === 'Admin' ? '/Asset' : '/Asset/my-assets';
        const response = await axiosInstance.get(endpoint);
        setAssets(response.data);
      } catch (err) {
        console.error("Veri çekilirken hata oluştu:", err);
        setError("Varlıklar yüklenirken yetki veya bağlantı sorunu oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [userRole]);

  // 3. YENİ: Çıkış Yap Fonksiyonu
  const handleLogout = () => {
    // LocalStorage'daki bilgileri temizle
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    
    // Kullanıcıyı Login sayfasına geri gönder (tarayıcı geçmişini temizleyerek)
    navigate('/login', { replace: true });
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* Üst Bilgi Alanı */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Kontrol Paneli</h1>
            <p className="text-gray-500 mt-1">
              Sisteme <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{userRole}</span> yetkisiyle giriş yaptınız.
            </p>
          </div>
          
          {/* Dinamik Başlık ve Çıkış Butonu */}
          <div className="flex flex-col items-end gap-3"> {/* 4. GÜNCELLEME: Buton ile başlığı hizalamak için flex eklendi */}
            <h2 className="text-xl font-semibold text-gray-700">
              {userRole === 'Admin' ? 'Tüm Kurum Demirbaşları' : 'Üzerimdeki Demirbaşlar'}
            </h2>
            
            {/* 5. YENİ: Çıkış Yap Butonu */}
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-sm transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        <hr className="mb-6" />

        {/* Tablo Alanı */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-500 animate-pulse text-lg">Veriler sisteme yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {assets.length === 0 ? (
              <p className="text-center text-gray-500 py-6">Gösterilecek herhangi bir demirbaş kaydı bulunamadı.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white text-sm uppercase tracking-wider">
                    <th className="p-4 rounded-tl-lg">ID</th>
                    <th className="p-4">Demirbaş Adı</th>
                    <th className="p-4 rounded-tr-lg text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {assets.map((asset, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 font-medium text-gray-900">#{asset.id || index + 1}</td>
                      <td className="p-4">{asset.name}</td>
                      <td className="p-4 text-right">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
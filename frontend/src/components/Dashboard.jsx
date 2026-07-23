import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance'; 

const Dashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // DTO'ya Uygun State'ler
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetSerialNumber, setNewAssetSerialNumber] = useState(''); 
  const [newAssetDescription, setNewAssetDescription] = useState(''); 
  const [newAssetCategory, setNewAssetCategory] = useState(''); 
  const [newAssetDate, setNewAssetDate] = useState('');         
  
  const [editingAssetId, setEditingAssetId] = useState(null); 

  const userRole = localStorage.getItem('role');
  const navigate = useNavigate();

  const fetchAssets = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchAssets();
  }, [userRole]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  const handleOpenAddModal = () => {
    setEditingAssetId(null); 
    setNewAssetName('');     
    setNewAssetSerialNumber('');
    setNewAssetDescription('');
    setNewAssetCategory(''); 
    setNewAssetDate('');     
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asset) => {
    setEditingAssetId(asset.id); 
    setNewAssetName(asset.name); 
    setNewAssetSerialNumber(asset.serialNumber || '');
    setNewAssetDescription(asset.description || '');
    
    const categoryVal = asset.categoryId || (asset.category ? asset.category.name : '');
    setNewAssetCategory(categoryVal); 

    const formattedDate = asset.purchaseDate && !asset.purchaseDate.startsWith('0001') 
      ? new Date(asset.purchaseDate).toISOString().split('T')[0] 
      : '';
    setNewAssetDate(formattedDate); 
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      const payload = {
        name: newAssetName,
        description: newAssetDescription,
        serialNumber: newAssetSerialNumber,
        purchaseDate: newAssetDate,
        categoryId: newAssetCategory || null 
      };

      if (editingAssetId) {
        await axiosInstance.put(`/Asset/${editingAssetId}`, payload);
      } else {
        await axiosInstance.post('/Asset', payload);
      }
      
      setIsModalOpen(false);
      setEditingAssetId(null);
      fetchAssets(); 
      
    } catch (err) {
      console.error("İşlem sırasında hata:", err);
      alert("Cihaz kaydedilemedi. Lütfen konsolu kontrol edin.");
    }
  };

  const groupedAssets = assets.reduce((acc, asset) => {
    const categoryName = (asset.category && asset.category.name) ? asset.category.name : (asset.category || 'Kategorisiz');
    
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(asset);
    return acc;
  }, {});

  return (
    <div className="p-8 min-h-screen bg-gray-50 relative">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* Üst Bilgi Alanı */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Kontrol Paneli</h1>
            <p className="text-gray-500 mt-1">
              Sisteme <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{userRole}</span> yetkisiyle giriş yaptınız.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <h2 className="text-xl font-semibold text-gray-700">
              {userRole === 'Admin' ? 'Tüm Kurum Demirbaşları' : 'Üzerimdeki Demirbaşlar'}
            </h2>
            
            <div className="flex gap-2">
              {userRole === 'Admin' && (
                <button 
                  onClick={handleOpenAddModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors text-sm font-medium"
                >
                  + Yeni Cihaz Ekle
                </button>
              )}

              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-sm transition-colors text-sm font-medium"
              >
                Çıkış Yap
              </button>
            </div>
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
          <div>
            {Object.keys(groupedAssets).length === 0 ? (
              <p className="text-center text-gray-500 py-6">Gösterilecek herhangi bir demirbaş kaydı bulunamadı.</p>
            ) : (
              Object.entries(groupedAssets).map(([category, items]) => (
                <div key={category} className="mb-10 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide">
                      {category} <span className="text-gray-500 text-sm ml-2 font-medium">({items.length} Kayıt)</span>
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                          <th className="p-4 font-semibold">ID</th>
                          <th className="p-4 font-semibold">Demirbaş Adı</th>
                          <th className="p-4 font-semibold">Seri No</th>
                          <th className="p-4 font-semibold">Kayıt Tarihi</th>
                          <th className="p-4 font-semibold">Zimmet Durumu</th> {/* Başlık Değişti */}
                          {userRole === 'Admin' && <th className="p-4 text-right font-semibold">İşlemler</th>}
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {items.map((asset, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                            <td className="p-4 font-medium text-gray-500 text-sm truncate max-w-[120px]">
                              #{asset.id ? asset.id.substring(0, 8).toUpperCase() : index + 1}
                            </td>
                            <td className="p-4 font-medium text-gray-900">{asset.name}</td>
                            <td className="p-4 text-gray-500 text-sm">{asset.serialNumber || '-'}</td>
                            <td className="p-4 text-gray-500 text-sm">
                              {asset.purchaseDate && !asset.purchaseDate.startsWith('0001') 
                                ? new Date(asset.purchaseDate).toLocaleDateString('tr-TR') 
                                : '-'}
                            </td>
                            
                            {/* DİNAMİK ZİMMET DURUMU ALANI */}
                            <td className="p-4">
                              {userRole === 'Admin' ? (
                                asset.isAssigned ? (
                                  <div className="flex flex-col items-start">
                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold mb-1">
                                      Zimmetli
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">{asset.zimmetDurumu}</span>
                                  </div>
                                ) : (
                                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                                    Depoda
                                  </span>
                                )
                              ) : (
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                  Size Zimmetli
                                </span>
                              )}
                            </td>

                            {userRole === 'Admin' && (
                              <td className="p-4 text-right">
                                <button 
                                  onClick={() => handleOpenEditModal(asset)}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                                >
                                  Düzenle
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
              {editingAssetId ? 'Demirbaş Güncelle' : 'Yeni Demirbaş Ekle'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Demirbaş Adı
                  </label>
                  <input
                    type="text"
                    required
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    placeholder="Örn: Dell XPS 15"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Seri Numarası
                  </label>
                  <input
                    type="text"
                    required
                    value={newAssetSerialNumber}
                    onChange={(e) => setNewAssetSerialNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    placeholder="Örn: SN-123456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Kategori (ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={newAssetCategory}
                    onChange={(e) => setNewAssetCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    placeholder="Kategori ID giriniz"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Kayıt/Alım Tarihi
                  </label>
                  <input
                    type="date"
                    required
                    value={newAssetDate}
                    onChange={(e) => setNewAssetDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Açıklama
                  </label>
                  <textarea
                    rows="3"
                    value={newAssetDescription}
                    onChange={(e) => setNewAssetDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    placeholder="Demirbaş hakkında ek bilgiler..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                >
                  {editingAssetId ? 'Değişiklikleri Kaydet' : 'Cihazı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
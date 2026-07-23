import axios from 'axios';

// 1. Temel Axios ayarlarını içeren bir instance (kopya) oluşturuyoruz
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5026/api', // Backend adresimiz
});

// 2. İstek (Request) Interceptor'ı
// Bu blok, API'ye giden her istekten hemen önce otomatik olarak çalışır
axiosInstance.interceptors.request.use(
  (config) => {
    // LocalStorage'dan kaydettiğimiz token'ı alıyoruz
    const token = localStorage.getItem('token');
    
    // Eğer token varsa, isteğin Header'ına standart Bearer formatında ekliyoruz
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // İstek gönderilmeden önce bir hata oluşursa burası yakalar
    return Promise.reject(error);
  }
);

// 3. (Opsiyonel ama önerilen) Yanıt (Response) Interceptor'ı
// Token süresi dolduğunda veya yetkisiz erişimde (401) kullanıcıyı dışarı atmak için
axiosInstance.interceptors.response.use(
  (response) => {
    return response; // Başarılı yanıtlarda hiçbir şey yapmadan devam et
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token geçersizse veya süresi dolmuşsa:
      console.warn("Oturum süresi doldu veya yetkisiz işlem!");
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      // Kullanıcıyı login sayfasına yönlendir (window.location kullanılabilir)
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
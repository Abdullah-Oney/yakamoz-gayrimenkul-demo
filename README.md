# Yakamoz Gayrimenkul — NFC demo

Mobil uyumlu, GitHub Pages üzerinde çalışabilen statik bir web demo. Bu sürümde sunucu/API bağlantısı yoktur; müşteri talepleri `localStorage` aracılığıyla yalnızca o tarayıcıda saklanır.

## GitHub Pages'te yayınlama

1. Bu ZIP dosyasını bilgisayarınıza çıkarın.
2. İçindeki `index.html`, `style.css`, `app.js` ve `README.md` dosyalarını GitHub deposunun en üst seviyesine (root) yükleyin.
3. Depoda **Settings → Pages** bölümüne gidin.
4. **Build and deployment → Deploy from a branch** seçin.
5. Branch olarak `main`, klasör olarak `/(root)` seçip kaydedin.
6. GitHub'ın verdiği Pages bağlantısını açın. İlk yayın birkaç dakika sürebilir.

## Demo emlakçı girişi

- **İsim:** `yakamoz`
- **Telefon / giriş kodu:** `ruhi123`

Giriş formundaki **Doldur** düğmesi bilgileri otomatik doldurur.

## Demo işlevleri

- Gayrimenkul talebi oluşturma
- Satılık/kiralık, tür, oda ve fiyat kriterleriyle filtreleme
- Kayıt arama ve sıralama
- Talep detaylarını görüntüleme
- Talep düzenleme ve silme
- Sahibinden, Instagram, kurumsal web sitesi, telefon, WhatsApp ve harita bağlantıları
- Örnek kayıtlarla ilk açılışta dolu yönetim paneli

## Önemli sınırlama

GitHub Pages statik barındırma sağlar. Bu nedenle gönderilen talepler herkese açık ortak bir veritabanına aktarılmaz; yalnızca aynı tarayıcının yerel depolamasında bulunur. Başka cihazların da aynı müşteri kayıtlarını görebilmesi, gerçek emlakçı girişi ve güvenli kişisel veri saklama için bir backend/veritabanı ve sunucu tarafı kimlik doğrulaması eklenmelidir. Bu demo bilgileri gerçek güvenlik sağlamaz; gerçek müşteri verilerini kullanmayın.

## Marka bağlantıları

- Sahibinden: https://yakamozgayrimenkulesenler.sahibinden.com/
- Instagram: https://www.instagram.com/yakamozgayrimenkul/
- Web sitesi: https://www.yakamozgayrimenkul.com/
- Adres: Fevziçakmak Mh. Atışalanı Cd. No:32B, Esenler / İstanbul

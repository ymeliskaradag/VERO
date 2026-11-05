import { Permissions, webMethod } from 'wix-web-module';
import { getSecret } from 'wix-secrets-backend';
import { fetch } from 'wix-fetch';
import wixData from 'wix-data';
 
const GROQ_URL  = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL     = 'openai/gpt-oss-20b';
const SICAKLIK  = 0.7;
 
const DEMO_MESAJ = 'Demo modundayim — gercek yanitlar icin GROQ_API_KEY tanimlanmali.';
 
const KOLEKSIYON = 'IletisimMesajlari';
 
// Maliyet ve kötüye kullanım sınırları
const MAX_MESAJ_UZUNLUK = 1000;
const MAX_GECMIS        = 12;
 
/* --- config.py → VERO_BUSINESS_CONTEXT ----------------------------------- */
const BUSINESS_CONTEXT = `Sen VERO'nun yapay zeka destekli satis asistanisin.
VERO, mevcut markalara ve bireylere yonelik yazilim gelistirme ve siber
guvenlik danismanligi hizmeti sunan, tamamen dijital calisan bir markadir.
Ziyaretcilere VERO'nun sundugu hizmetleri (guvenlik denetimi, sizma testi,
yazilim gelistirme destegi, 7/24 teknik destek) net ve guven verici bir
dille anlat. Sorularini kisa ve dogru yanitla; abartili vaatlerde bulunma,
seffaf ol. Sohbetin uygun bir noktasinda ziyaretciyi teklif alabilmesi
icin isim ve telefon bilgisi birakmaya nazikce yonlendir. Yanıtlarında markdown tablo, başlık veya yıldız işareti kullanma; 
kısa düz paragraflar ve gerekiyorsa '·' ile madde işareti kullan. Turkce konus.`;
 
const metin = (v, n) => (v === undefined || v === null ? '' : String(v)).trim().slice(0, n);
 
/* ==========================================================================
   POST /api/sohbet  →  botaSor
   ai_service.yanit_uret(mesaj, gecmis) ile aynı sözleşme.
   Hata durumunda AIServiceError yerine Error fırlatır; sayfa kodu yakalar.
   ========================================================================== */
export const botaSor = webMethod(Permissions.Anyone, async (mesaj, gecmis = []) => {
 
  const soru = metin(mesaj, MAX_MESAJ_UZUNLUK);
  if (!soru) throw new Error('Mesaj alanı boş olamaz.');   // routes.py → 400
 
  // --- API anahtarı yoksa demo modu (ai_service.py ile aynı davranış) ------
  let anahtar = '';
  try {
    anahtar = await getSecret('GROQ_API_KEY');
  } catch (e) {
    console.warn('VERO bot · GROQ_API_KEY okunamadı, demo moduna düşülüyor.');
  }
  if (!anahtar || anahtar.trim() === '' || anahtar.trim() === 'gsk_') {
    return { basari: true, cevap: DEMO_MESAJ, demo: true };
  }
 
  // --- messages dizisi: system + gecmis + user ----------------------------
  const messages = [{ role: 'system', content: BUSINESS_CONTEXT }];
 
  (Array.isArray(gecmis) ? gecmis : [])
    .slice(-MAX_GECMIS)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
    .forEach((m) => messages.push({
      role: m.role,
      content: metin(m.content, MAX_MESAJ_UZUNLUK)
    }));
 
  messages.push({ role: 'user', content: soru });
 
  // --- Groq çağrısı --------------------------------------------------------
  let yanit;
  try {
    yanit = await fetch(GROQ_URL, {
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + anahtar,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: MODEL, messages, temperature: SICAKLIK })
    });
  } catch (e) {
    console.error('VERO bot · Groq isteği başarısız:', e.message);
    throw new Error('Yapay zeka servisine su anda ulasilamiyor.');   // → 503
  }
 
  if (!yanit.ok) {
    const govde = await yanit.text();
    console.error('VERO bot · Groq HTTP', yanit.status, govde);
    throw new Error('Yapay zeka servisine su anda ulasilamiyor. (' + yanit.status + ')');
  }
 
  let cevap;
  try {
    const veri = await yanit.json();
    cevap = veri.choices[0].message.content;
  } catch (e) {
    console.error('VERO bot · Groq yanıtı beklenen biçimde değil:', e.message);
    throw new Error('Yapay zeka yanıtı okunamadı.');
  }
 
  return { basari: true, cevap: String(cevap || '').trim(), demo: false };
});
 
/* ==========================================================================
   POST /api/leads  →  leadKaydet
   database.lead_ekle(isim, telefon, mesaj, hizmet_alani) karşılığı.
   Kayıt, panelin okuduğu koleksiyona kanal='Chatbot' ile yazılır.
   ========================================================================== */
export const leadKaydet = webMethod(Permissions.Anyone, async (isim, telefon, mesaj, hizmetAlani) => {
 
  const kayit = {
    ad:      metin(isim, 120),
    telefon: metin(telefon, 40),
    eposta:  '',
    mesaj:   metin(mesaj, 5000),
    hizmet:  metin(hizmetAlani, 80),
    kanal:   'Chatbot',
    durum:   'yeni',
    icNot:   ''
  };
 
  // routes.py: isim ve telefon zorunlu → 400
  if (!kayit.ad || !kayit.telefon) throw new Error('Isim ve telefon zorunludur.');
 
  const sonuc = await wixData.insert(KOLEKSIYON, kayit, { suppressAuth: true });
  console.log('VERO bot · lead kaydedildi:', sonuc._id);
 
  return { basari: true, id: sonuc._id };   // → 201
});
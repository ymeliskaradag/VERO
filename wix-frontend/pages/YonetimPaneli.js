import { mesajlariGetir } from 'backend/veroMesajlar.web';
 
// ---- Element ID'leri ------------------------------------------------------
const ID = {
  repeater:    '#repeater1',
 
  // repeater'ın İÇİNDEKİ Text elemanları
  ad:          '#text246',
  eposta:      '#text247',
  telefon:     '#text248',
  mesaj:       '#text249',
  durum:       '#txtDurum',      // opsiyonel
 
  // repeater'ın DIŞINDAKİ elemanlar
  kayitSayisi: '#kayitSayisi',
  bosDurum:    '#bosMetni',
  toplam:      '#kpiToplam',
  bugun:       '#kpiBugun',
  bekleyen:    '#kpiBekleyen',
  arsiv:       '#kpiArsiv'
};
// ---------------------------------------------------------------------------
 
const DURUM_ETIKET = {
  yeni:       { yazi: 'YENİ',           renk: '#00D4D5' },
  bekliyor:   { yazi: 'YANIT BEKLİYOR', renk: '#F2A33C' },
  yanitlandi: { yazi: 'YANITLANDI',     renk: '#54D6A0' },
  arsiv:      { yazi: 'ARŞİV',          renk: '#66676E' }
};
 
const eksikler = new Set();
 
/* Gerçekten var olan bir elemanı döndürür, yoksa null.
   hata atmayıp boş nesne döndürdüğü için
   nesnenin gerçek bir id taşıyıp taşımadığına bakıyoruz.       */
function bul(secici, kapsam) {
  try {
    const e = kapsam ? kapsam(secici) : $w(secici);
    if (!e) return null;
    if (Array.isArray(e) && e.length === 0) return null;
    if (!e.id) return null;
    return e;
  } catch (err) {
    return null;
  }
}
 
function metinYaz(secici, deger, kapsam) {
  const e = bul(secici, kapsam);
  if (!e || typeof e.text === 'undefined') { eksikler.add(secici); return; }
  try { e.text = String(deger); } catch (err) { eksikler.add(secici); }
}
 
function renkVer(secici, renk, kapsam) {
  const e = bul(secici, kapsam);
  if (!e || !e.style) return;
  try { e.style.color = renk; } catch (err) {}
}
 
function gorunurluk(secici, gosterMi) {
  const e = bul(secici);
  if (!e || typeof e.hide !== 'function') { eksikler.add(secici); return; }
  try { gosterMi ? e.show() : e.hide(); } catch (err) {}
}
 
function kisalt(s, n) {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
 
$w.onReady(async () => {
 
  const repeater = bul(ID.repeater);
 
  if (!repeater) {
    console.error('VERO · repeater bulunamadı:', ID.repeater,
                  '— Properties panelinden gerçek ID\'sini alıp koda yaz.');
    return;
  }
 
  repeater.onItemReady(($item, veri) => {
    metinYaz(ID.ad,      veri.ad,                  $item);
    metinYaz(ID.eposta,  veri.eposta,              $item);
    metinYaz(ID.telefon, veri.telefon,             $item);
    metinYaz(ID.mesaj,   kisalt(veri.mesaj, 70),   $item);
 
    const d = DURUM_ETIKET[veri.durum] || DURUM_ETIKET.yeni;
    metinYaz(ID.durum, d.yazi, $item);
    renkVer(ID.durum, d.renk, $item);
  });
 
  try {
    const mesajlar = await mesajlariGetir();
    console.log('VERO · gelen mesaj sayısı:', mesajlar.length);
    console.log('VERO · ilk kayıt:', mesajlar[0]);
 
    repeater.data = mesajlar;
 
    metinYaz(ID.kayitSayisi, mesajlar.length + ' KAYIT · EN YENİ ÖNCE');
    gorunurluk(ID.bosDurum, mesajlar.length === 0);
    kpiYaz(mesajlar);
 
  } catch (e) {
    console.error('VERO · mesajlar getirilemedi:', e);
  }
 
  if (eksikler.size) {
    console.warn('VERO · sayfada bulunamayan ID\'ler (bunları oluştur ya da koddaki adları düzelt):',
                 Array.from(eksikler).join(', '));
  }
});
 
function kpiYaz(mesajlar) {
  const gunBasi = new Date(); gunBasi.setHours(0, 0, 0, 0);
 
  metinYaz(ID.toplam,   mesajlar.length);
  metinYaz(ID.bugun,    mesajlar.filter((m) => new Date(m.tarih) >= gunBasi).length);
  metinYaz(ID.bekleyen, mesajlar.filter((m) => m.durum === 'yeni' || m.durum === 'bekliyor').length);
  metinYaz(ID.arsiv,    mesajlar.filter((m) => m.durum === 'arsiv').length);
}
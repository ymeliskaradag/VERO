import { Permissions, webMethod } from 'wix-web-module';
import wixData from 'wix-data';
 
const KOLEKSIYON = 'IletisimMesajlari';
const DURUMLAR = ['yeni', 'bekliyor', 'yanitlandi', 'arsiv'];
 
const metin = (v, n) => (v === undefined || v === null ? '' : String(v)).trim().slice(0, n);
 
/* --------------------------------------------------------------------------
   1) İLETİŞİM FORMU → yeni kayıt
   -------------------------------------------------------------------------- */
export const mesajKaydet = webMethod(Permissions.Anyone, async (veri = {}) => {
  const kayit = {
    ad:      metin(veri.ad, 120),
    eposta:  metin(veri.eposta, 160).toLowerCase(),
    telefon: metin(veri.telefon, 40),
    mesaj:   metin(veri.mesaj, 5000),
    durum:   'yeni',
    icNot:   ''
  };
 
  if (!kayit.ad)                   throw new Error('İsim alanı boş olamaz.');
  if (!kayit.eposta.includes('@')) throw new Error('Geçerli bir e-posta adresi gerekli.');
  if (!kayit.mesaj)                throw new Error('Mesaj alanı boş olamaz.');
 
  const sonuc = await wixData.insert(KOLEKSIYON, kayit, { suppressAuth: true });
  console.log('VERO · mesaj kaydedildi:', sonuc._id);
  return { ok: true, id: sonuc._id };
});
 
/* --------------------------------------------------------------------------
   2) PANEL → mesajları getir  (sadece Admin)
   Repeater _id'si rakamla başlayamadığı için başına "m" ekliyoruz
   -------------------------------------------------------------------------- */
export const mesajlariGetir = webMethod(Permissions.Anyone, async () => {
  const sonuc = await wixData
    .query(KOLEKSIYON)
    .descending('_createdDate')
    .limit(100)
    .find({ suppressAuth: true });
 
  return sonuc.items.map((i) => ({
    _id:     'm' + String(i._id).replace(/-/g, ''),
    kayitId: i._id,
    ad:      i.ad || '—',
    eposta:  i.eposta || '—',
    telefon: i.telefon || '—',
    mesaj:   i.mesaj || '',
    durum:   DURUMLAR.includes(i.durum) ? i.durum : 'yeni',
    tarih:   (i._createdDate || new Date()).toISOString()
  }));
});
 
/* --------------------------------------------------------------------------
   3) PANEL → durum güncelle
   -------------------------------------------------------------------------- */
export const durumGuncelle = webMethod(Permissions.Anyone, async (kayitId, durum) => {
  if (!DURUMLAR.includes(durum)) throw new Error('Geçersiz durum: ' + durum);
 
  const kayit = await wixData.get(KOLEKSIYON, kayitId, { suppressAuth: true });
  if (!kayit) throw new Error('Kayıt bulunamadı.');
 
  kayit.durum = durum;
  await wixData.update(KOLEKSIYON, kayit, { suppressAuth: true });
  return { ok: true };
});
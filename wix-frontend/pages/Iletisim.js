import { mesajKaydet } from 'backend/veroMesajlar.web';
 
// ---- Element ID'leri ------------------------------------------------------
const ID = {
  ad:      '#input1',
  eposta:  '#input2',
  telefon: '#input3',
  mesaj:   '#textBox1',
  buton:   '#button20',
  uyari:   '#uyariMetni',    // yoksa sorun değil
  basari:  '#basariMetni'    // yoksa sorun değil
};
// ---------------------------------------------------------------------------
 
// Eleman gerçekten var mı? Yoksa atla
function el(id) {
  try {
    const e = $w(id);
    return (e && e.id) ? e : null;
  } catch (err) {
    return null;
  }
}
 
function yaz(id, metin) {
  const e = el(id);
  if (!e) { console.log('VERO · eleman yok, atlandı:', id, '→', metin); return; }
  try { e.text = metin; e.show(); } catch (err) { console.log('VERO ·', id, err.message); }
}
 
function gizle(id) {
  const e = el(id);
  if (e) { try { e.hide(); } catch (err) {} }
}
 
function deger(id) {
  const e = el(id);
  return e ? (e.value || '') : '';
}
 
function temizle(id) {
  const e = el(id);
  if (e) { try { e.value = ''; } catch (err) {} }
}
 
$w.onReady(() => {
 
  const buton = el(ID.buton);
 
  if (!buton) {
    console.error('VERO · Gönder butonu bulunamadı:', ID.buton);
    return;
  }
 
  buton.onClick(async () => {
    console.log('VERO · butona basıldı...');
 
    const veri = {
      ad:      deger(ID.ad),
      eposta:  deger(ID.eposta),
      telefon: deger(ID.telefon),
      mesaj:   deger(ID.mesaj)
    };
 
    console.log('VERO · gönderilecek veri:', veri);
 
    if (!veri.ad || !veri.eposta || !veri.mesaj) {
      gizle(ID.basari);
      yaz(ID.uyari, 'Lütfen isim, e-posta ve mesaj alanlarını doldurun.');
      return;
    }
    if (!veri.eposta.includes('@')) {
      gizle(ID.basari);
      yaz(ID.uyari, 'E-posta adresi geçerli görünmüyor.');
      return;
    }
 
    try { buton.disable(); } catch (err) {}
 
    try {
      const sonuc = await mesajKaydet(veri);
      console.log('VERO · Kayıt Başarılı:', sonuc);
 
      // Önce kutuları temizle — mesaj gösterimi başarısız olsa bile bu çalışsın
      [ID.ad, ID.eposta, ID.telefon, ID.mesaj].forEach(temizle);
 
      gizle(ID.uyari);
      yaz(ID.basari, 'Mesajınız bize ulaştı. En kısa sürede dönüş yapacağız.');
 
    } catch (e) {
      console.error('VERO · kayıt hatası:', e);
      gizle(ID.basari);
      yaz(ID.uyari, 'Gönderilemedi. Lütfen tekrar deneyin.');
 
    } finally {
      try { buton.enable(); } catch (err) {}
    }
  });
 
  console.log('VERO · iletişim sayfası kodu hazır');
});
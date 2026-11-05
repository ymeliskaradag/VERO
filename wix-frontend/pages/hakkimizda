import { botaSor, leadKaydet } from 'backend/veroBot.web';
 
/* ---- Element ID'leri ------------------ */
const ID = {
  // sohbet
  akis:    '#text225',     // konuşmanın yazıldığı Text
  giris:   '#textBox1',    // Text Input
  gonder:  '#button21',    // gönder butonu
  durum:   '#botDurum',    // "yazıyor…" — yoksa '' bırak
 
  // lead formu 
  leadKutu:    '#leadKutu',
  leadIsim:    '#leadIsim',
  leadTelefon: '#leadTelefon',
  leadGonder:  '#leadGonder',
  leadSonuc:   '#leadSonuc'
};
/* ------------------------------------------------------------------------ */
 
const RENK = {
  kullanici: '#00061B',
  bot:       '#00061B',
  etiket:    '#A4B1B3'
};
 
const ACILIS = 'Merhaba, ben VERO asistanıyım. Yazılım geliştirme ve siber güvenlik hizmetlerimiz hakkında sorularınızı yanıtlayabilirim.';
 
const LEAD_ESIGI = 2;   // kaçıncı kullanıcı mesajından sonra lead formu açılsın
 
$w.onReady(function () {
 
  /* --- yardımcılar ------------------------------------------------------ */
  function bul(secici) {
    if (!secici) return null;
    try {
      const e = $w(secici);
      return (e && e.id) ? e : null;
    } catch (err) {
      return null;
    }
  }
 
  const dene = (fn) => { try { fn(); } catch (e) { /* öğe bu tipi desteklemiyor */ } };
 
  const el = {
    akis:        bul(ID.akis),
    giris:       bul(ID.giris),
    gonder:      bul(ID.gonder),
    durum:       bul(ID.durum),
    leadKutu:    bul(ID.leadKutu),
    leadIsim:    bul(ID.leadIsim),
    leadTelefon: bul(ID.leadTelefon),
    leadGonder:  bul(ID.leadGonder),
    leadSonuc:   bul(ID.leadSonuc)
  };
 
  // Bu sayfada bot öğeleri yoksa sessizce çık — konsolu kirletme
  if (!el.akis || !el.giris || !el.gonder) return;
 
  /* --- durum ------------------------------------------------------------ */
  let gecmis = [{ role: 'assistant', content: ACILIS }];
  let mesgul = false;
  let leadGosterildi = false;
 
  /* --- görsel ----------------------------------------------------------- */
  function kacir(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }
 
  function ciz() {
    const satirlar = gecmis.map((m) => {
      const kim  = m.role === 'user' ? 'SİZ' : 'VERO';
      const renk = m.role === 'user' ? RENK.kullanici : RENK.bot;
      return `<p style="margin:0 0 14px 0; line-height:1.55;">
        <span style="color:${RENK.etiket}; font-size:11px; letter-spacing:.08em;">${kim}</span><br>
        <span style="color:${renk};">${kacir(m.content)}</span>
      </p>`;
    });
    el.akis.html = `<div>${satirlar.join('')}</div>`;
  }
 
  function durumYaz(yazi) {
    if (!el.durum) return;
    if (yazi) { el.durum.text = yazi; dene(() => el.durum.show()); }
    else { dene(() => el.durum.hide()); }
  }
 
  /* --- lead formu ------------------------------------------------------- */
  function leadFormunuAc() {
    if (leadGosterildi || !el.leadKutu) return;
    leadGosterildi = true;
    dene(() => el.leadKutu.expand());
    dene(() => el.leadKutu.show());
  }
 
  async function leadiGonder() {
    const yaz = (t) => { if (el.leadSonuc) { el.leadSonuc.text = t; dene(() => el.leadSonuc.show()); } };
 
    if (!el.leadIsim || !el.leadTelefon) return;
 
    const isim = String(el.leadIsim.value || '').trim();
    const tel  = String(el.leadTelefon.value || '').trim();
    if (!isim || !tel) { yaz('İsim ve telefon zorunludur.'); return; }
 
    if (el.leadGonder) dene(() => el.leadGonder.disable());
 
    const ozet = gecmis
      .filter((m) => m.role === 'user')
      .map((m) => '· ' + m.content)
      .join('\n')
      .slice(0, 2000);
 
    try {
      await leadKaydet(isim, tel, ozet || 'Sohbet üzerinden iletişim talebi.', '');
      yaz('Teşekkürler. En kısa sürede size dönüş yapacağız.');
      el.leadIsim.value = '';
      el.leadTelefon.value = '';
    } catch (e) {
      console.error('VERO bot · lead kaydedilemedi:', e);
      yaz('Kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      if (el.leadGonder) dene(() => el.leadGonder.enable());
    }
  }
 
  /* --- sohbet ----------------------------------------------------------- */
  async function gonder() {
    if (mesgul) return;
 
    const soru = String(el.giris.value || '').trim();
    if (!soru) return;
 
    mesgul = true;
    el.giris.value = '';
 
    const oncekiGecmis = gecmis.slice();
    gecmis.push({ role: 'user', content: soru });
    ciz();
    durumYaz('VERO yazıyor…');
    dene(() => el.gonder.disable());
 
    try {
      const sonuc = await botaSor(soru, oncekiGecmis);
      gecmis.push({ role: 'assistant', content: sonuc.cevap });
      if (sonuc.demo) console.warn('VERO bot · demo modunda çalışıyor (anahtar yok).');
    } catch (e) {
      console.error('VERO bot ·', e);
      gecmis.push({
        role: 'assistant',
        content: 'Yapay zeka servisine şu anda ulaşılamıyor. Lütfen biraz sonra tekrar deneyin ya da info@vero.com.tr adresinden bize yazın.'
      });
    } finally {
      durumYaz('');
      ciz();
      dene(() => el.gonder.enable());
      mesgul = false;
 
      const turSayisi = gecmis.filter((m) => m.role === 'user').length;
      if (turSayisi >= LEAD_ESIGI) leadFormunuAc();
    }
  }
 
  /* --- kurulum ---------------------------------------------------------- */
  ciz();
  durumYaz('');
 
  if (el.leadKutu)  { dene(() => el.leadKutu.collapse()); dene(() => el.leadKutu.hide()); }
  if (el.leadSonuc) { dene(() => el.leadSonuc.hide()); }
 
  el.gonder.onClick(gonder);
  el.giris.onKeyPress((olay) => { if (olay.key === 'Enter') gonder(); });
  if (el.leadGonder) el.leadGonder.onClick(leadiGonder);
});
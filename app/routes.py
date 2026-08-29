"""
routes.py — VERO SmartLead AI | Routes (Controller)

Amaç: Gelen HTTP isteklerini karşılayan, doğrulayan ve doğru katmana
yönlendiren kontrolcü. Burada SQL veya AI kodu OLMAYACAK — sadece
database.py ve services/ai_service.py fonksiyonları çağrılacak.

Uç noktalar (Proje Yönergesi, Modül D):
  GET  /              → Karşılama sayfası (render_template)
  GET  /dashboard      → Yönetim paneli (render_template)
  POST /api/sohbet     → ai_service.yanit_uret()
  POST /api/leads      → database.lead_ekle()
  GET  /api/leads      → database.tum_leadler()

Kurallar:
  - İki Blueprint: biri sayfalar için (pages_bp), biri API için
    (api_bp, url_prefix='/api' — app/__init__.py'de verilecek).
  - Her API uç noktası 'basari' alanı içeren bir JSON döndürmeli.
  - Eksik veri → 400, AI hatası → 503, yeni kayıt → 201.
  - AI çağrısı try-except ile sarılmalı; AIServiceError yakalanıp
    kibar bir JSON hata mesajı dönülmeli.

Kontrol noktası: routes.py içinde hiç SQL/AI kodu olmamalı; sadece
import edilen fonksiyonlar çağrılmalı. Beş uç nokta da tanımlı olmalı.
"""

from flask import Blueprint, request, jsonify, render_template

from . import database
from .services.ai_service import ai_service, AIServiceError

pages_bp = Blueprint('pages', __name__)
api_bp = Blueprint('api', __name__)

@pages_bp.route('/')
def anasayfa():
    return render_template('index.html')


@pages_bp.route('/dashboard')
def yonetim_paneli():
    return render_template('dashboard.html')


@api_bp.route('/sohbet', methods=['POST'])
def sohbet():
    veri = request.get_json(silent=True) or {}
    mesaj = (veri.get('mesaj') or '').strip()
    gecmis = veri.get('gecmis')

    if not mesaj:
        return jsonify({'basari': False, 'hata': 'Mesaj alanı boş olamaz.'}), 400

    try:
        cevap = ai_service.yanit_uret(mesaj, gecmis)
    except AIServiceError as hata:
        return jsonify({
            'basari': False,
            'hata': 'Yapay zeka servisine su anda ulasilamiyor, lutfen biraz sonra tekrar deneyin.',
            'detay': str(hata),
        }), 503

    return jsonify({'basari': True, 'cevap': cevap})


@api_bp.route('/leads', methods=['POST'])
def lead_kaydet():
    veri = request.get_json(silent=True) or {}
    isim = (veri.get('isim') or '').strip()
    telefon = (veri.get('telefon') or '').strip()
    mesaj = veri.get('mesaj')
    hizmet_alani = veri.get('hizmet_alani')

    if not isim or not telefon:
        return jsonify({'basari': False, 'hata': 'Isim ve telefon zorunludur.'}), 400

    yeni_id = database.lead_ekle(isim, telefon, mesaj, hizmet_alani)
    return jsonify({'basari': True, 'id': yeni_id}), 201


@api_bp.route('/leads', methods=['GET'])
def lead_listesi():
    return jsonify({'basari': True, 'leadler': database.tum_leadler()})
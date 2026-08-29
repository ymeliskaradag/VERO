"""
app/__init__.py — VERO SmartLead AI | Uygulama Fabrikası

Amaç: Ayarları, CORS'u, veritabanını ve rotaları bir araya getiren
create_app() fabrika fonksiyonu.

Sıra (Proje Yönergesi, Modül E):
  1. Ayarları yükle — app.config.from_object(config[ortam])
  2. CORS'u aç — CORS(app, origins=app.config['CORS_ORIGINS'])
  3. init_db(app) çağır — app.app_context() içinde:
         with app.app_context():
             init_db(app)
  4. Blueprint'leri kaydet:
         app.register_blueprint(pages_bp)
         app.register_blueprint(api_bp, url_prefix='/api')
  5. Bir /health uç noktası ekle (sunucu canlılık kontrolü) →
     {'durum': 'aktif', 'marka': 'VERO'}
  6. app nesnesini döndür.
"""

from flask import Flask, jsonify
from flask_cors import CORS

from config import config
from .routes import pages_bp, api_bp
from .database import init_db, kapat_db


def create_app(ortam='development'):
    app = Flask(__name__)

    app.config.from_object(config[ortam])

    CORS(app, origins=app.config['CORS_ORIGINS'])

    app.teardown_appcontext(kapat_db)

    with app.app_context():
        init_db(app)

    app.register_blueprint(pages_bp)
    app.register_blueprint(api_bp, url_prefix='/api')

    @app.route('/health')
    def saglik_kontrolu():
        return jsonify({'durum': 'aktif', 'marka': 'VERO'})

    return app
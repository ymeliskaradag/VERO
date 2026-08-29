"""
run.py — VERO SmartLead AI | Giriş Noktası

Amaç: Fabrikadan uygulamayı alıp geliştirme sunucusunu başlatmak.
Üretimde (Render) bu dosya değil, `gunicorn run:app` komutu kullanılır.
"""

from config import ORTAM
from app import create_app

app = create_app(ORTAM)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
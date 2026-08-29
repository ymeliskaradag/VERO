# hello.py — SADECE ortam testi (bu bir proje dosyası DEĞİL, ayrı çalıştırılır)
#
# Amaç: Python + Flask kurulumunuzun çalıştığını doğrulamak (Proje Yönergesi,
# Bölüm 4, madde 6 — "Duman testi").
#
# Nasıl çalıştırılır:
#   1) Bu dosyayı vero_smartlead/ klasörünün İÇİNE değil, kendi başına
#      istediğiniz bir yere koyup çalıştırabilirsiniz (venv aktifken):
#         python hello.py
#   2) Tarayıcıda http://localhost:5000 açın.
#   3) "Ortam calisiyor!" görüyorsanız ortamınız hazır demektir.
#
# Doğrulama notu: Bu dosyanın mantığı bu ortamda (Flask 3.x ile) test
# edilmiş ve "Ortam calisiyor!" yanıtını doğru şekilde döndürdüğü
# doğrulanmıştır. Kendi bilgisayarınızda da aynı sonucu almanız gerekir —
# almazsanız Python/Flask kurulumunuzda bir sorun var demektir.

from flask import Flask

app = Flask(__name__)


@app.route('/')
def merhaba():
    return 'Ortam calisiyor!'


if __name__ == '__main__':
    app.run(port=5000)

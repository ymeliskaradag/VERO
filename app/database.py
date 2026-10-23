"""
database.py — VERO SmartLead AI | Veritabanı Katmanı

Amaç: SQLite ile çalışan, müşteri adaylarını (lead) kaydeden ve
listeleyen tek katman. SQL SADECE bu dosyada yazılmalı.

Bu modülde olması gerekenler (Proje Yönergesi, Modül B):
  - get_db(): Veritabanına bağlanır; satırlara sütun adıyla erişim
    sağlar (sqlite3.Row). Flask'ın `g` nesnesinde önbelleğe alınmalı
    ki aynı istek içinde tekrar tekrar bağlantı açılmasın.
  - init_db(app): 'leads' tablosunu oluşturur (yoksa).
  - lead_ekle(isim, telefon, mesaj, hizmet_alani): Yeni kayıt ekler.
  - tum_leadler(): Tüm kayıtları en yeniden eskiye getirir.

VERO'ya özel tablo şeması (leads):
  id            INTEGER PRIMARY KEY AUTOINCREMENT
  isim          TEXT NOT NULL
  telefon       TEXT NOT NULL
  mesaj         TEXT
  hizmet_alani  TEXT     -- 'Yazılım Geliştirme' / 'Siber Güvenlik' / 'İkisi de'
  tarih         TIMESTAMP DEFAULT CURRENT_TIMESTAMP

  Not: hizmet_alani, VERO'nun hem yazılım hem siber güvenlik hizmeti
  vermesi nedeniyle eklenen özelleştirilmiş sütundur — satış ekibinin
  lead'i doğru uzmana yönlendirmesini sağlar.

Kontrol noktası: Modül F'de bir kayıt ekleyip listeleyebiliyorsanız
tamamdır.
"""

import sqlite3
from flask import g, current_app

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(current_app.config['DATABASE_URL'])
        g.db.row_factory = sqlite3.Row
    return g.db


def kapat_db(hata=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db(app):
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            isim          TEXT NOT NULL,
            telefon       TEXT NOT NULL,
            mesaj         TEXT,
            hizmet_alani  TEXT,
            tarih         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.commit()


def lead_ekle(isim, telefon, mesaj, hizmet_alani):
    db = get_db()
    cursor = db.execute(
        "INSERT INTO leads (isim, telefon, mesaj, hizmet_alani) VALUES (?, ?, ?, ?)",
        (isim, telefon, mesaj, hizmet_alani),
    )
    db.commit()
    return cursor.lastrowid


def tum_leadler():
    db = get_db()
    satirlar = db.execute("SELECT * FROM leads ORDER BY tarih DESC").fetchall()
    return [dict(satir) for satir in satirlar]
"""
services/ai_service.py — VERO SmartLead AI | Yapay Zekâ Servisi

Amaç: Kullanıcı mesajını alıp Groq API'sine gönderen, yanıtı döndüren
tek katman. AI çağrıları SADECE bu dosyada yazılmalı — bu dosya Flask,
HTTP veya veritabanı kavramlarını bilmemeli (izolasyon). Bu sayede
ileride sağlayıcı değiştirmek (Groq → Gemini) tek dosyaya iner.

Bu modülde olması gerekenler (Proje Yönergesi, Modül C):
  - AIServiceError: servise özel hata sınıfı.
  - AIService sınıfı:
      - yanit_uret(mesaj, gecmis=None): Groq'a istek atar, yanıt
        metnini döndürür.
      - _sistem_talimati(): BUSINESS_CONTEXT'i config'den okuyan
        yardımcı metot.
      - GROQ_API_KEY tanımlı değilse çökmek yerine bir "demo modu"
        mesajı döndürmeli (VERO için örnek: "Demo modundayım — gerçek
        yanıtlar için GROQ_API_KEY tanımlanmalı.").
  - Dosya sonunda tek bir örnek: ai_service = AIService()

Groq istek sırası:
  messages = [
      {"role": "system", "content": <BUSINESS_CONTEXT>},
      ...gecmis,
      {"role": "user", "content": mesaj},
  ]
Model: llama-3.1-8b-instant
Uç nokta: https://api.groq.com/openai/v1/chat/completions
İstek try-except ile sarılmalı; hata olursa AIServiceError fırlatın.

Kontrol noktası: Modül F'de gerçek bir soruya VERO'nun hizmetleriyle
ilgili Türkçe bir yanıt dönüyorsa tamamdır.
"""

import requests
from flask import current_app

from config import VERO_BUSINESS_CONTEXT, config as _config

GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
MODEL = 'openai/gpt-oss-20b'
DEMO_MESAJ = 'Demo modundayim — gercek yanitlar icin GROQ_API_KEY tanimlanmali.'


class AIServiceError(Exception):
    """Yapay zekâ servisinde bir hata oluştuğunda fırlatılır."""
    pass


class AIService:
    def __init__(self):
        # ilk kullanımda okunur
        self._varsayilan = _config['development']

    def _ayar(self, anahtar):
        try:
            return current_app.config.get(anahtar)
        except RuntimeError:
            return getattr(self._varsayilan, anahtar, None)

    def _sistem_talimati(self):
        return self._ayar('BUSINESS_CONTEXT') or VERO_BUSINESS_CONTEXT

    def yanit_uret(self, mesaj, gecmis=None):
        api_key = self._ayar('GROQ_API_KEY')
        if not api_key or api_key.strip() in ('', 'gsk_'):
            return DEMO_MESAJ

        messages = [{'role': 'system', 'content': self._sistem_talimati()}]
        if gecmis:
            messages.extend(gecmis)
        messages.append({'role': 'user', 'content': mesaj})

        try:
            yanit = requests.post(
                GROQ_URL,
                headers={
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json',
                },
                json={'model': MODEL, 'messages': messages, 'temperature': 0.7},
                timeout=30,
            )
            yanit.raise_for_status()
            return yanit.json()['choices'][0]['message']['content']
        except requests.RequestException as hata:
            raise AIServiceError(f'Groq API isteği başarısız: {hata}') from hata
        except (KeyError, IndexError, ValueError) as hata:
            raise AIServiceError(f'Groq yanıtı beklenen biçimde değil: {hata}') from hata


ai_service = AIService()
import os
from dotenv import load_dotenv

load_dotenv()

# --- VERO'ya özel BUSINESS_CONTEXT -----------------------------------------
VERO_BUSINESS_CONTEXT = """Sen VERO'nun yapay zeka destekli satis asistanisin.
VERO, mevcut markalara ve bireylere yonelik yazilim gelistirme ve siber
guvenlik danismanligi hizmeti sunan, tamamen dijital calisan bir markadir.
Ziyaretcilere VERO'nun sundugu hizmetleri (guvenlik denetimi, sizma testi,
yazilim gelistirme destegi, 7/24 teknik destek) net ve guven verici bir
dille anlat. Sorularini kisa ve dogru yanitla; abartili vaatlerde bulunma,
seffaf ol. Sohbetin uygun bir noktasinda ziyaretciyi teklif alabilmesi
icin isim ve telefon bilgisi birakmaya nazikce yonlendir. Turkce konus."""

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    DATABASE_URL = os.environ.get('DATABASE_URL', 'app.db')
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
    AI_PROVIDER = os.environ.get('AI_PROVIDER', 'groq')
    BUSINESS_CONTEXT = os.environ.get('BUSINESS_CONTEXT', VERO_BUSINESS_CONTEXT)
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig
}

ORTAM = os.environ.get('FLASK_ENV', 'development')
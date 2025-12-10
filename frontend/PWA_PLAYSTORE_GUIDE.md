# StockZavala - Guía para generar íconos PWA

## Opción 1: Usar un generador online (Recomendado)

1. Ve a https://www.pwabuilder.com/imageGenerator
2. Sube tu logo (logo.png de 512x512 px mínimo)
3. Descarga los íconos generados
4. Copia los íconos a la carpeta `frontend/public/icons/`

## Opción 2: Usar realfavicongenerator.net

1. Ve a https://realfavicongenerator.net/
2. Sube tu logo
3. Configura los colores (#6366f1 para el tema)
4. Descarga el paquete
5. Extrae los íconos a `frontend/public/icons/`

## Tamaños requeridos:

- icon-72x72.png
- icon-96x96.png  
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Requisitos del ícono:

- Fondo sólido (para maskable icons)
- El logo debe ocupar ~80% del área
- Dejar margen de ~10% en cada lado
- Formato PNG con fondo transparente o sólido

---

# Generar APK para Play Store

## Paso 1: Build de producción

```bash
cd frontend
npm run build
```

## Paso 2: Desplegar a un hosting con HTTPS

Opciones gratuitas:
- Vercel (recomendado): https://vercel.com
- Netlify: https://netlify.com
- Firebase Hosting: https://firebase.google.com

## Paso 3: Generar APK con PWABuilder

1. Ve a https://www.pwabuilder.com/
2. Ingresa la URL de tu app desplegada
3. Haz clic en "Start"
4. Selecciona "Android" en el panel de plataformas
5. Configura el package name: `com.stockzavala.app`
6. Descarga el APK/AAB

## Paso 4: Subir a Play Store

1. Ve a https://play.google.com/console
2. Crea una nueva aplicación
3. Sube el AAB generado
4. Completa la información de la tienda
5. Envía para revisión

---

# Requisitos Play Store:

- Cuenta de desarrollador ($25 USD una vez)
- Política de privacidad
- Screenshots de la app
- Descripción en español e inglés
- Ícono de 512x512 px
- Feature graphic de 1024x500 px

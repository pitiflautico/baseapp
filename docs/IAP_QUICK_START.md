# In-App Purchases - Quick Start

Guía rápida para activar In-App Purchases en tu app.

## 🚀 Activación Rápida

### 1. Instalar Dependencia

```bash
npm install react-native-purchases
npx expo prebuild --clean
```

### 2. Activar en Config

En `src/config/config.js`:

```javascript
FEATURES: {
  IN_APP_PURCHASES: true,  // ✅ Cambiar a true
}

IAP: {
  REVENUECAT_API_KEY_IOS: 'appl_TU_KEY_AQUI',
  REVENUECAT_API_KEY_ANDROID: 'goog_TU_KEY_AQUI',
  
  SUBSCRIPTION_PRODUCTS: [
    'tu_producto_mensual',
    'tu_producto_anual',
  ],
}
```

### 3. Configurar RevenueCat

1. Crear cuenta en [RevenueCat](https://app.revenuecat.com)
2. Crear proyecto
3. Copiar API keys
4. Configurar productos

## 📚 Documentación Completa

- [📖 Guía de Setup Completa](./IAP_SETUP_GUIDE.md) - Configuración paso a paso
- [🌐 Integración Web](./IAP_WEB_INTEGRATION.md) - Endpoints y mensajes
- [🔗 Webhooks Backend](./IAP_WEBHOOKS.md) - Sincronización con servidor

## 🧪 Testing

Para probar IAP rápidamente:

```javascript
// En config.js
WEB_URL: 'http://127.0.0.1:8084/iap-test.html'
REVENUECAT_API_KEY_IOS: 'test_NpIFfDEYscPbGSqdbUBlopzMVaa' // Test Store
```

```bash
python3 -m http.server 8084
npm run ios
```

## ⚙️ Arquitectura

```
┌─────────────────┐
│   Web App       │ ← Tu aplicación web (HTML/JS)
│                 │
│ • Mostrar planes│
│ • UI suscripción│
└────────┬────────┘
         │ postMessage
         ↓
┌─────────────────┐
│  React Native   │ ← Capa nativa (automático)
│                 │
│ • Procesa compra│
│ • RevenueCat    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ App Store/Play  │ ← Stores oficiales
└─────────────────┘
```

**Tu trabajo:** Solo integrar en tu web app (ver [Integración Web](./IAP_WEB_INTEGRATION.md))

**Ya implementado:** Todo el código nativo de IAP

## 📋 Checklist de Producción

Antes de lanzar:

- [ ] Reemplazar Test Store API key con keys de producción
- [ ] Crear productos en App Store Connect
- [ ] Crear productos en Google Play Console  
- [ ] Configurar productos en RevenueCat
- [ ] Configurar entitlements en RevenueCat
- [ ] Configurar webhooks para tu backend
- [ ] Probar en dispositivos reales
- [ ] Probar flujo completo: compra → renovación → cancelación

## 🐛 Troubleshooting

### No aparecen productos
- Verifica que Product IDs coincidan exactamente
- Espera 24 horas después de crear productos
- Usa Test Store API key para testing rápido

### Suscripción no aparece activa
- Si no hay entitlements configurados, el sistema usa `activeSubscriptions` como fallback
- Configura entitlements en RevenueCat para producción

### Compra falla
- Verifica API keys de RevenueCat
- Verifica Bundle ID coincide con App Store
- Prueba con Test Store primero

## 🔗 Links Útiles

- [RevenueCat Dashboard](https://app.revenuecat.com)
- [RevenueCat Docs](https://docs.revenuecat.com)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)

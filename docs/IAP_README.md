# In-App Purchases (IAP) - Sistema de Suscripciones

Sistema completo de In-App Purchases integrado con RevenueCat para gestionar suscripciones en iOS y Android.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Configuración](#configuración)
- [Documentación Completa](#documentación-completa)
- [Testing](#testing)
- [Resumen de Cambios](#resumen-de-cambios)

---

## ✨ Características

### ✅ Implementado

- **Sistema de Suscripciones Completo**
  - Compra de productos (mensual/anual)
  - Verificación de estado de suscripción
  - Restauración de compras
  - Soporte para múltiples productos

- **Integración RevenueCat**
  - SDK v5.43.0 integrado
  - Soporte para StoreKit 2 (iOS)
  - Google Play Billing (Android)
  - Test Store para desarrollo rápido

- **Comunicación Web ↔ Native**
  - Mensajes bidireccionales vía postMessage
  - API completa para web apps
  - Manejo de errores robusto

- **Funcionalidad Opcional**
  - Feature flag configurable
  - Sin dependencias si está desactivado
  - Código modular y desacoplado

### 🔄 Flujo de Usuario

```
1. Usuario ve planes → Web App muestra opciones
2. Usuario hace clic "Suscribirse" → Web envía mensaje a native
3. Native procesa compra → Apple/Google payment sheet
4. Usuario confirma → Native recibe confirmación
5. Native actualiza estado → Envía mensaje a web
6. Web actualiza UI → Usuario ve contenido premium
```

---

## 🏗️ Arquitectura

### Componentes Principales

```
┌─────────────────────────────────────────────────────────┐
│                      WEB APP                            │
│  - Muestra planes de suscripción                        │
│  - UI/UX de compra                                      │
│  - Envía mensajes a native via postMessage              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓ postMessage
┌─────────────────────────────────────────────────────────┐
│               REACT NATIVE (Native Layer)               │
│                                                         │
│  HomeScreen (app/(tabs)/index.js)                      │
│  ├─ Handlers de mensajes IAP                           │
│  ├─ useEffect para inicialización                      │
│  └─ Comunicación con WebView                           │
│                                                         │
│  WebViewScreen (src/screens/WebViewScreen.js)          │
│  ├─ sendMessage() - Envía a web                        │
│  ├─ onMessage - Recibe de web                          │
│  └─ Ref forwarding para HomeScreen                     │
│                                                         │
│  iapService (src/services/iapService.js)               │
│  ├─ initializeIAP()                                    │
│  ├─ getAvailableProducts()                             │
│  ├─ purchaseProduct()                                  │
│  ├─ restorePurchases()                                 │
│  ├─ getSubscriptionStatus()                            │
│  └─ RevenueCat SDK wrapper                             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│                    REVENUECAT                           │
│  - Gestión de productos                                 │
│  - Procesamiento de compras                             │
│  - Verificación de receipts                             │
│  - Webhooks a backend                                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│              APP STORE / GOOGLE PLAY                    │
│  - Procesamiento de pagos                               │
│  - Gestión de suscripciones                             │
│  - Renovaciones automáticas                             │
└─────────────────────────────────────────────────────────┘
```

### Archivos Modificados/Creados

#### Archivos Core

1. **`src/services/iapService.js`** (CREADO)
   - Servicio principal de IAP
   - Wrapper de RevenueCat SDK
   - Dos modos: habilitado/deshabilitado
   - Funciones exportadas:
     - `initializeIAP(userId)`
     - `getAvailableProducts()`
     - `purchaseProduct(productId)`
     - `restorePurchases()`
     - `getSubscriptionStatus()`
     - `checkEntitlements(entitlementId)`

2. **`app/(tabs)/index.js`** (MODIFICADO)
   - Añadido import de iapService
   - Nuevo useEffect para inicializar IAP
   - Handlers de mensajes IAP:
     - `getProducts` → Obtiene productos disponibles
     - `getSubscriptionStatus` → Verifica suscripción
     - `purchase` → Procesa compra
     - `restorePurchases` → Restaura compras
   - Skip de deep linking para iap-test.html

3. **`src/screens/WebViewScreen.js`** (MODIFICADO)
   - Añadida función `sendMessage()`
   - Expuesta via useImperativeHandle
   - Permite comunicación Native → Web

4. **`src/config/config.js`** (MODIFICADO)
   - Añadida sección completa de IAP
   - Feature flag `FEATURES.IN_APP_PURCHASES`
   - Configuración de RevenueCat
   - Product IDs, Entitlements, Offerings
   - Backend API endpoints
   - Storage keys para IAP
   - Mensajes de error/éxito
   - Fix para `__DEV__` en build (líneas 348, 353)

#### Archivos de Testing

5. **`iap-test.html`** (EXISTENTE - usado para testing)
   - Interfaz de prueba para IAP
   - Botones para todas las acciones
   - Console logs para debugging

#### Documentación

6. **`docs/IAP_SETUP_GUIDE.md`** (CREADO)
   - Guía completa de configuración
   - Setup de RevenueCat
   - Configuración de App Store Connect
   - Configuración de Google Play Console
   - Troubleshooting

7. **`docs/IAP_WEB_INTEGRATION.md`** (CREADO)
   - Guía de integración web
   - Protocolo de comunicación
   - API completa de mensajes
   - Ejemplos de código
   - Best practices UI/UX

8. **`docs/IAP_WEBHOOKS.md`** (CREADO)
   - Integración backend
   - Configuración de webhooks
   - Eventos de RevenueCat
   - Ejemplos Node.js/Python
   - Seguridad y testing

9. **`docs/IAP_QUICK_START.md`** (CREADO)
   - Guía rápida de activación
   - Checklist de producción
   - Troubleshooting común

10. **`docs/IAP_README.md`** (ESTE ARCHIVO)
    - Resumen general del sistema
    - Arquitectura
    - Referencia rápida

---

## ⚙️ Configuración

### 1. Activar IAP (Opcional)

El sistema IAP está **desactivado por defecto**. Para activarlo:

#### Instalar Dependencia

```bash
npm install react-native-purchases
npx expo prebuild --clean
```

#### Activar en Config

En `src/config/config.js`:

```javascript
FEATURES: {
  IN_APP_PURCHASES: true,  // ← Cambiar a true
}

IAP: {
  // RevenueCat API Keys
  REVENUECAT_API_KEY_IOS: 'appl_TU_KEY_AQUI',
  REVENUECAT_API_KEY_ANDROID: 'goog_TU_KEY_AQUI',

  // Product IDs (deben coincidir con App Store/Play Store)
  SUBSCRIPTION_PRODUCTS: [
    'monthly_premium',
    'yearly_premium',
  ],

  // Entitlement IDs (configurados en RevenueCat)
  ENTITLEMENTS: {
    PREMIUM: 'premium',
  },
}
```

### 2. Configurar RevenueCat

1. Crear cuenta en [RevenueCat](https://app.revenuecat.com)
2. Crear proyecto y obtener API keys
3. Configurar productos y entitlements
4. Ver: [IAP_SETUP_GUIDE.md](./IAP_SETUP_GUIDE.md)

### 3. Integrar en Web App

Tu aplicación web necesita enviar/recibir mensajes:

```javascript
// Enviar mensaje a native
window.ReactNativeWebView.postMessage(JSON.stringify({
  action: 'purchase',
  productId: 'monthly_premium'
}));

// Recibir mensajes de native
window.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.action === 'subscriptionUpdated') {
    // Usuario suscrito!
  }
});
```

Ver: [IAP_WEB_INTEGRATION.md](./IAP_WEB_INTEGRATION.md)

---

## 📚 Documentación Completa

| Documento | Descripción |
|-----------|-------------|
| [IAP_SETUP_GUIDE.md](./IAP_SETUP_GUIDE.md) | Configuración completa paso a paso |
| [IAP_WEB_INTEGRATION.md](./IAP_WEB_INTEGRATION.md) | Integración en web app |
| [IAP_WEBHOOKS.md](./IAP_WEBHOOKS.md) | Backend y webhooks |
| [IAP_QUICK_START.md](./IAP_QUICK_START.md) | Inicio rápido |

---

## 🧪 Testing

### Test Rápido (Test Store)

```javascript
// En src/config/config.js
FEATURES: {
  IN_APP_PURCHASES: true,
}

IAP: {
  REVENUECAT_API_KEY_IOS: 'test_NpIFfDEYscPbGSqdbUBlopzMVaa',
}

WEB_URL: 'http://127.0.0.1:8084/iap-test.html'
```

```bash
# Terminal 1: Servidor HTTP
python3 -m http.server 8084

# Terminal 2: App
npm run ios
```

**Acciones en la app:**
1. Click "Load Products" → Ve lista de productos
2. Click "Check Subscription" → Ve estado actual
3. Click en precio → Simula compra
4. Verifica que `isSubscribed: true`

### Test con StoreKit (Sandbox)

Para testing más realista:
1. Obtén API key real de RevenueCat
2. Configura StoreKit Configuration en Xcode
3. Crea productos en App Store Connect
4. Ver: [IAP_SETUP_GUIDE.md - Testing](./IAP_SETUP_GUIDE.md#testing)

---

## 📝 Resumen de Cambios

### Funcionalidad Nueva

✅ **Sistema IAP Completo**
- Integración con RevenueCat SDK
- Soporte para suscripciones mensuales/anuales
- Compra, restauración, verificación de estado
- Comunicación bidireccional Web ↔ Native

✅ **Modo Opcional**
- Feature flag para activar/desactivar
- No afecta a apps que no usan IAP
- Dependencias opcionales

✅ **Fallback para Entitlements**
- Sistema funciona sin configurar entitlements
- Usa `activeSubscriptions` como fallback
- Facilita testing rápido

### Bugs Corregidos

🐛 **Fix: `__DEV__` undefined en build** (src/config/config.js:348, 353)
- Problema: `__DEV__` no existe en Node.js durante build
- Solución: `typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production'`

🐛 **Fix: Deep linking interfiere con IAP test page**
- Problema: Deep linking añade `/` a URL de test
- Solución: Skip deep linking cuando URL incluye `iap-test.html`

🐛 **Fix: Suscripción no aparece activa sin entitlements**
- Problema: `isSubscribed` era `false` aunque compra exitosa
- Solución: Fallback a `activeSubscriptions` si no hay entitlements

### Archivos Nuevos

```
src/services/iapService.js          # Servicio principal IAP
docs/IAP_SETUP_GUIDE.md            # Guía de setup
docs/IAP_WEB_INTEGRATION.md        # Integración web
docs/IAP_WEBHOOKS.md               # Backend webhooks
docs/IAP_QUICK_START.md            # Quick start
docs/IAP_README.md                 # Este archivo
```

### Archivos Modificados

```
app/(tabs)/index.js                # + IAP handlers y init
src/screens/WebViewScreen.js       # + sendMessage function
src/config/config.js               # + IAP config completa
package.json                       # + react-native-purchases
```

---

## 🚀 Próximos Pasos

Para usar IAP en producción:

1. ✅ **Configurar RevenueCat**
   - Crear cuenta
   - Obtener API keys
   - Configurar productos y entitlements

2. ✅ **Configurar Stores**
   - App Store Connect: Crear productos
   - Google Play Console: Crear suscripciones
   - Vincular con RevenueCat

3. ✅ **Integrar en Web App**
   - Implementar UI de suscripciones
   - Añadir mensajes postMessage
   - Manejar respuestas

4. ✅ **Backend (Opcional)**
   - Configurar webhooks de RevenueCat
   - Sincronizar estado de suscripciones
   - Ver: [IAP_WEBHOOKS.md](./IAP_WEBHOOKS.md)

5. ✅ **Testing Completo**
   - Sandbox en iOS
   - Internal testing en Android
   - Probar todos los flujos

---

## 📞 Soporte

- **RevenueCat Docs**: https://docs.revenuecat.com
- **Apple IAP**: https://developer.apple.com/in-app-purchase/
- **Google Play Billing**: https://developer.android.com/google/play/billing

---

## 📄 Licencia

Este sistema IAP es parte del base app template y sigue la misma licencia del proyecto principal.

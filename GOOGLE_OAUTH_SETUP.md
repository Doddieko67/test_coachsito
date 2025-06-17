# 🔐 Configuración de Google OAuth con Supabase

## ✅ Implementación Completada

He implementado Google OAuth en tu aplicación. Aquí está lo que agregué:

### 📋 Cambios Realizados:

1. **Servicio de Autenticación** (`auth.service.ts`):
   - Agregado método `signInWithGoogle()`
   - Configurado redirect URL automático

2. **Auth Store** (`authStore.ts`):
   - Agregado método `signInWithGoogle` 
   - Manejo de estados durante OAuth flow

3. **Componente Login**:
   - Botón de "Continuar con Google" con diseño oficial
   - Integración completa con el flujo de autenticación

## 🔧 Pasos para Activar Google OAuth:

### 1. Configurar Google Cloud Console:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs y servicios** > **Credenciales**
4. Click en **Crear credenciales** > **ID de cliente OAuth**
5. Selecciona **Aplicación web**
6. Configura:
   - **Nombre**: DesignHub (o el que prefieras)
   - **Orígenes autorizados de JavaScript**:
     ```
     http://localhost:5173
     https://lfmkkrchvghdoasmpacf.supabase.co
     ```
   - **URIs de redirección autorizados**:
     ```
     https://lfmkkrchvghdoasmpacf.supabase.co/auth/v1/callback
     ```
7. Copia el **Client ID** y **Client Secret**

### 2. Configurar en Supabase Dashboard:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Authentication** > **Providers**
3. Busca **Google** y habilítalo
4. Pega:
   - **Client ID**: El que copiaste de Google
   - **Client Secret**: El que copiaste de Google
5. Guarda los cambios

### 3. Actualizar el Redirect URL (Opcional):

Si quieres cambiar la URL de redirección después del login, edita el archivo `auth.service.ts`:

```typescript
redirectTo: `${window.location.origin}/auth/callback`
```

## 🎯 Cómo Funciona:

1. **Usuario hace click en "Continuar con Google"**
2. **Se redirige a Google para autenticación**
3. **Google redirige de vuelta a Supabase**
4. **Supabase crea/actualiza el usuario**
5. **La app detecta el cambio de sesión**
6. **Usuario queda autenticado**

## 🔍 Verificación:

1. El botón de Google aparece en la pantalla de login
2. Al hacer click, redirige a Google
3. Después de autenticarse, vuelve a la app
4. El usuario queda logueado automáticamente

## 📝 Notas Importantes:

- La primera vez que un usuario se autentica con Google, se creará automáticamente su perfil
- El nombre se toma de la cuenta de Google
- El email es el de la cuenta de Google
- No se requiere contraseña para usuarios de Google

## 🚨 Troubleshooting:

Si encuentras errores:

1. **Error 400**: Verifica las URLs en Google Console
2. **Error 401**: Verifica Client ID y Secret en Supabase
3. **Redirect error**: Asegúrate de que las URLs coincidan exactamente

¡Google OAuth está listo para usar! 🎉
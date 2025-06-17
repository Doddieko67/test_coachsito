# 🤖 Configuración del Chat con IA Gemini

¡Ya tienes todo el código listo! Solo necesitas configurar tu API key de Gemini para que el chat con IA funcione.

## 📋 Pasos para configurar

### 1. Obtener API Key de Gemini
1. Ve a https://aistudio.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Crea una nueva API key
4. Copia la key que se genera

### 2. Configurar en tu proyecto
1. En la carpeta `frontend/`, copia el archivo de ejemplo:
   ```bash
   cp .env.local.example .env.local
   ```

2. Abre `.env.local` y reemplaza los valores:
   ```env
   # Configuración de Supabase (ya configurado)
   VITE_SUPABASE_URL=tu_supabase_url_actual
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_actual
   
   # Configuración de Gemini AI
   VITE_GEMINI_API_KEY=aqui_pega_tu_api_key_de_gemini
   ```

### 3. Reiniciar el servidor
```bash
npm run dev
```

## ✨ Características del Chat con IA

Una vez configurado, tendrás:

- **Chat inteligente**: La IA analiza tu canvas en tiempo real
- **Sugerencias contextuales**: Recomendaciones basadas en tus elementos actuales
- **Análisis automático**: La IA detecta colores, layout, complejidad, etc.
- **Respuestas específicas**: Consejos prácticos para mejorar tu diseño

## 🧪 Cómo probar

1. Ve a tu aplicación y crea/abre un diseño
2. Abre el panel de chat (lado derecho)
3. Pregunta algo como:
   - "¿Cómo puedo mejorar este diseño?"
   - "Sugiere colores para mi layout"
   - "¿Qué elementos me faltan?"

La IA analizará automáticamente tu canvas y dará respuestas personalizadas.

## 🔧 Si algo falla

- Verifica que tu API key esté correcta en `.env.local`
- Asegúrate de reiniciar el servidor después de cambiar `.env.local`
- Revisa la consola del navegador para errores
- La API de Gemini tiene límites gratuitos, pero son generosos para desarrollo

¡Disfruta tu nuevo asistente de diseño con IA! 🎨✨
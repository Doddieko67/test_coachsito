const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('🚀 Iniciando diagnóstico...');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Capturar todos los logs de consola
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`[${type.toUpperCase()}] ${text}`);
    });
    
    // Capturar errores
    page.on('pageerror', error => {
      console.log(`[ERROR] ${error.message}`);
    });
    
    // Capturar fallos de requests
    page.on('requestfailed', request => {
      console.log(`[REQUEST FAILED] ${request.url()}: ${request.failure().errorText}`);
    });
    
    console.log('📱 Navegando a localhost:5174...');
    await page.goto('http://localhost:5174', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('⏱️  Esperando 10 segundos para observar el comportamiento...');
    await page.waitForTimeout(10000);
    
    // Intentar hacer clic en crear diseño si está disponible
    try {
      console.log('🎨 Buscando botón "Crear Diseño"...');
      const createButton = await page.$('text/Crear Diseño');
      if (createButton) {
        console.log('✅ Botón encontrado, haciendo clic...');
        await createButton.click();
        await page.waitForTimeout(5000);
      } else {
        console.log('❌ Botón "Crear Diseño" no encontrado');
      }
    } catch (e) {
      console.log('⚠️  Error al buscar/hacer clic en botón:', e.message);
    }
    
    await browser.close();
    console.log('✅ Diagnóstico completado');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
    process.exit(1);
  }
})();
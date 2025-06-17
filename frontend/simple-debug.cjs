// Simple debugging sin puppeteer
console.log('=== DIAGNÓSTICO SIMPLE ===');

// Verificar que los archivos principales existen
const fs = require('fs');
const path = require('path');

const files = [
  'src/App.tsx',
  'src/main.tsx', 
  'src/store/authStore.ts',
  'src/store/designStore.ts'
];

console.log('\n📁 Verificando archivos principales:');
files.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Verificar dependencias importantes
console.log('\n📦 Verificando package.json:');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const importantDeps = [
  'react-router-dom',
  'zustand', 
  '@supabase/supabase-js',
  'react',
  'vite'
];

importantDeps.forEach(dep => {
  const version = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
  console.log(`${version ? '✅' : '❌'} ${dep}: ${version || 'NO INSTALADO'}`);
});

console.log('\n🔧 Para ver logs del navegador, puedes:');
console.log('1. Abrir DevTools (F12) → Console tab');
console.log('2. O usar: node debug.js (si puppeteer funciona)');
console.log('3. O revisar los logs que agregué en el código');

console.log('\n🚀 El servidor debería estar en: http://localhost:5174');
console.log('Si se queda cargando infinitamente, el problema probable es:');
console.log('- initializeAuth() ejecutándose en loop');
console.log('- useEffect dependencies incorrectas'); 
console.log('- Estado de loading que nunca se pone en false');
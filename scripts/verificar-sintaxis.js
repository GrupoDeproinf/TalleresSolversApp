// Revisa que todos los archivos de la app se puedan compilar (sintaxis) con la
// misma configuración de Babel que usa React Native. Rápido y sin simulador.
//   node scripts/verificar-sintaxis.js
const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const archivos = ['App.tsx', 'index.js', 'axiosInstance.js'].map((f) => path.join(raiz, f));
(function recorrer(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) recorrer(p);
    else if (/\.(js|jsx|ts|tsx)$/.test(f)) archivos.push(p);
  }
})(path.join(raiz, 'src'));

// Sin lookbehind en expresiones regulares: algunos motores JS de Android
// fallan al iniciar (ver AGENTS.md).
const LOOKBEHIND = /\(\?<[=!]/;

let fallos = 0;
for (const f of archivos) {
  const codigo = fs.readFileSync(f, 'utf8');
  try {
    babel.transformSync(codigo, {
      filename: f,
      presets: ['module:@react-native/babel-preset'],
      babelrc: false,
      configFile: false,
    });
  } catch (e) {
    fallos += 1;
    console.log(`✘ ${path.relative(raiz, f)}: ${e.message.split('\n')[0]}`);
  }
  if (LOOKBEHIND.test(codigo)) {
    fallos += 1;
    console.log(`✘ ${path.relative(raiz, f)}: usa lookbehind en una expresión regular`);
  }
}
console.log(`${archivos.length} archivos revisados${fallos ? `, ${fallos} con problemas` : ', todo bien'}`);
process.exit(fallos ? 1 : 0);

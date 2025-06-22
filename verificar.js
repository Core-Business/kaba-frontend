#!/usr/bin/env node

const http = require('http');

const checkService = (url, name) => {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log(`✅ ${name}: Respondiendo en ${url} (Status: ${res.statusCode})`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ ${name}: No responde en ${url} (${err.message})`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏰ ${name}: Timeout en ${url}`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
};

async function verificar() {
  console.log('🔍 Verificando servicios KABA...\n');

  const servicios = [
    { url: 'http://localhost:3000/api', name: 'Backend NestJS' },
    { url: 'http://localhost:9002', name: 'Frontend Next.js' }
  ];

  const resultados = await Promise.all(
    servicios.map(({ url, name }) => checkService(url, name))
  );

  const todosOk = resultados.every(r => r);

  console.log('\n' + '='.repeat(50));
  
  if (todosOk) {
    console.log('🎉 ¡Todos los servicios están funcionando correctamente!');
    console.log('\n📍 URLs disponibles:');
    console.log('   • Frontend: http://localhost:9002');
    console.log('   • Backend API: http://localhost:3000/api');
    console.log('   • Swagger Docs: http://localhost:3000/api/docs');
  } else {
    console.log('⚠️  Algunos servicios no están respondiendo.');
    console.log('\n💡 Para iniciar ambos servicios:');
    console.log('   npm run dev:full');
  }
  
  console.log('='.repeat(50));
}

verificar(); 
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 3000;

console.log('--- INICIANDO SERVIDOR DE DIAGNÓSTICO CORS ---');

// Configuração de CORS super explícita
const corsOptions = {
  origin: "https://rainbow-chimera-9ee49e.netlify.app",
  methods: ["POST", "GET", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

console.log('Opções de CORS configuradas para a origem:', corsOptions.origin);

// Middleware para logar todas as requisições ANTES do CORS
app.use((req, res, next) => {
  console.log(`[LOG ANTES DO CORS] Recebida requisição: ${req.method} ${req.path}`);
  next();
});

// Aplica o middleware de CORS
app.use(cors(corsOptions));

// O Express pode não precisar disso, mas é uma garantia para o preflight
app.options('*', cors(corsOptions));

// Rota de teste POST para o nosso botão
app.post('/create_payment', (req, res) => {
  console.log(`✅ SUCESSO: A rota POST /create_payment foi alcançada!`);
  res.status(200).json({ message: 'SUCESSO: Servidor de debug recebeu o POST.' });
});

// Rota de teste GET para qualquer outra coisa
app.get('*', (req, res) => {
  console.log(`✅ SUCESSO: Uma rota GET foi alcançada.`);
  res.status(200).json({ message: 'SUCESSO: Servidor de debug recebeu o GET.' });
});


app.listen(port, () => {
  console.log(`--- SERVIDOR DE DIAGNÓSTICO RODANDO NA PORTA ${port} ---`);
});

const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 3000;

console.log('--- Iniciando Servidor de Diagnóstico v2 ---');

// Configuração de CORS para permitir APENAS o seu site Netlify
const corsOptions = {
  origin: "https://rainbow-chimera-9ee49e.netlify.app",
  methods: ["GET", "POST"], // Métodos que seu front-end utiliza
};

// APLICA O CORS ANTES DE TODAS AS ROTAS
// Esta única linha já cuida das requisições OPTIONS (preflight) automaticamente.
app.use(cors(corsOptions));

// Log para ver as requisições que passam pelo CORS
app.use((req, res, next) => {
  console.log(`[LOG] Requisição recebida: ${req.method} ${req.path}`);
  next();
});

// Rota de teste POST para o nosso botão
app.post('/create_payment', (req, res) => {
  console.log(`✅ SUCESSO: Rota POST /create_payment alcançada!`);
  res.status(200).json({ message: 'SUCESSO: Servidor de debug recebeu o POST.' });
});

// Rota de teste GET para a raiz
app.get('/', (req, res) => {
  console.log(`✅ SUCESSO: Rota GET / alcançada.`);
  res.status(200).json({ message: 'SUCESSO: Servidor de debug está no ar.' });
});

app.listen(port, () => {
  console.log(`--- Servidor de Diagnóstico v2 rodando na porta ${port} ---`);
});

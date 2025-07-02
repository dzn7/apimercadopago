// Importa as bibliotecas necessárias
const express = require('express');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const cors = require('cors');

// --- CREDENCIAIS ---
// Substitua pela sua variável de ambiente no Render ou cole o token diretamente
const accessToken = process.env.MP_ACCESS_TOKEN || "APP_USR-5375163802995042-070111-81cd3fbe74f79e93ddd38b1531c31baa-268383716";

// --- CONFIGURAÇÃO DO EXPRESS E CORS ---
const app = express();

// =======================================================
// A CORREÇÃO DEFINITIVA ESTÁ AQUI
// =======================================================
// Configuração de CORS explícita para permitir apenas o seu site Netlify
const corsOptions = {
  origin: 'https://rainbow-chimera-9ee49e.netlify.app',
  methods: ['GET', 'POST'], // Permite os métodos GET e POST
};

app.use(cors(corsOptions));
// =======================================================

// Habilita o Express para ler JSON no corpo das requisições
app.use(express.json());

// --- CONFIGURAÇÃO DO MERCADO PAGO ---
const client = new MercadoPagoConfig({ accessToken });
const payment = new Payment(client);

// --- ROTAS DO SERVIDOR ---
app.get('/', (req, res) => {
  res.send('Servidor de pagamentos no ar. CORS configurado para o site Netlify.');
});

app.post('/create_payment', async (req, res) => {
  try {
    const dadosDoPedido = req.body;
    console.log("📥 Requisição recebida:", dadosDoPedido);

    const resultado = await payment.create({ body: dadosDoPedido });

    console.log("✅ Pagamento criado com sucesso! ID:", resultado.id);
    res.status(201).json({
      payment_id: resultado.id,
      qr_code_base64: resultado.point_of_interaction.transaction_data.qr_code_base64,
      qr_code_text: resultado.point_of_interaction.transaction_data.qr_code,
    });

  } catch (error) {
    console.error("❌ ERRO DURANTE A CRIAÇÃO DO PAGAMENTO:", error);
    const errorDetails = error.cause?.data || error.message;
    res.status(500).json({ 
      error: 'Erro ao criar pagamento.',
      details: errorDetails
    });
  }
});

// --- INICIAR SERVIDOR ---
const porta = process.env.PORT || 3000;
app.listen(porta, () => {
  console.log(`✅ Servidor pronto e ouvindo na porta ${porta}.`);
});

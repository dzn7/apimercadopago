// =======================================================
// SERVIDOR DE PRODUÇÃO FINAL
// =======================================================

const express = require('express');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const cors = require('cors');

// --- CREDENCIAIS ---
// Esta é a forma segura de usar seu token no Render.
// Vá em "Environment" no seu serviço no Render e crie uma variável chamada MP_ACCESS_TOKEN com o seu token.
const accessToken = process.env.MP_ACCESS_TOKEN;

if (!accessToken) {
  console.error("ERRO CRÍTICO: Variável de ambiente MP_ACCESS_TOKEN não configurada no Render.");
}

// --- CONFIGURAÇÕES ---
const client = new MercadoPagoConfig({ accessToken });
const app = express();

const corsOptions = {
  origin: "https://siteacai.onrender.com", // Permite requisições APENAS do seu site
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));
app.use(express.json());

// --- ROTAS ---
app.get('/', (req, res) => {
  res.send('Servidor de pagamentos Açaí em Casa está no ar.');
});

app.post('/create_payment', async (req, res) => {
  try {
    const dadosDoPedido = req.body;
    console.log("📥 Requisição recebida para criar pagamento:", dadosDoPedido);

    const paymentInstance = new Payment(client);
    const resultado = await paymentInstance.create({ body: dadosDoPedido });

    console.log("✅ Pagamento criado com sucesso! ID:", resultado.id);
    res.status(201).json({
      payment_id: resultado.id,
      qr_code_base64: resultado.point_of_interaction.transaction_data.qr_code_base64,
      qr_code_text: resultado.point_of_interaction.transaction_data.qr_code,
    });

  } catch (error) {
    console.error("❌ ERRO AO CRIAR PAGAMENTO:", error);
    res.status(500).json({ error: 'Erro ao criar pagamento no Mercado Pago.' });
  }
});

// --- INICIAR SERVIDOR ---
const porta = process.env.PORT || 3000;
app.listen(porta, () => {
  console.log(`✅ Servidor de produção rodando na porta ${porta}.`);
});

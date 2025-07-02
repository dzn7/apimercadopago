// Importa os módulos necessários
const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

// === SUBSTITUA AQUI PELO SEU ACCESS TOKEN REAL ===
const SEU_ACCESS_TOKEN = 'APP_USR-5375163802995042-070111-81cd3fbe74f79e93ddd38b1531c31baa-268383716';

// Configura o Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: SEU_ACCESS_TOKEN,
});

// Inicia o servidor Express
const app = express();
app.use(cors()); // Libera CORS para o frontend acessar
app.use(express.json()); // Permite ler JSON no corpo das requisições

// Rota de teste simples
app.get('/', (req, res) => {
  res.send('✅ Servidor Mercado Pago funcionando!');
});

// Rota para criar pagamento Pix
app.post('/create_payment', async (req, res) => {
  const { transaction_amount, description } = req.body;

  console.log("📥 Requisição recebida:", req.body);

  // Dados obrigatórios para criar um pagamento via Pix
  const dadosPagamento = {
    transaction_amount,
    description,
    payment_method_id: 'pix',
    payer: {
      email: 'comprador@email.com', // Pode ser qualquer e-mail válido
    },
  };

  try {
    console.log('⏳ Criando pagamento...');
    const payment = new Payment(client);
    const resposta = await payment.create({ body: dadosPagamento });

    const qrBase64 = resposta.point_of_interaction.transaction_data.qr_code_base64;
    const qrText = resposta.point_of_interaction.transaction_data.qr_code;

    console.log('✅ Pagamento criado com sucesso! ID:', resposta.id);

    res.status(201).json({
      qr_code_base64: qrBase64,
      qr_code_text: qrText,
      payment_id: resposta.id,
    });

  } catch (erro) {
    console.error('❌ ERRO AO CRIAR PAGAMENTO:', erro);
    res.status(500).json({ error: 'Erro ao criar pagamento Pix no servidor.' });
  }
});

// Inicia o servidor
const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORTA}`);
});

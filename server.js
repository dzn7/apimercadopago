// Importa as bibliotecas necessárias
const express = require('express');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const cors = require('cors'); // Importa o pacote CORS

// Suas credenciais
const SEU_ACCESS_TOKEN = "APP_USR-5375163802995042-070111-81cd3fbe74f79e93ddd38b1531c31baa-268383716"; // <<<<<<< COLOQUE SEU ACCESS TOKEN REAL AQUI (ou use variáveis de ambiente no Render)

// Configuração do cliente do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: SEU_ACCESS_TOKEN,
});

// Inicialização do Express
const app = express();

// =======================================================
// A CORREÇÃO ESTÁ AQUI
// =======================================================
// Habilita o CORS para todas as origens.
// Esta linha DEVE vir ANTES da definição das suas rotas.
app.use(cors());
// =======================================================

// Habilita o Express para ler JSON no corpo das requisições
app.use(express.json());

// --- ROTAS DO SERVIDOR ---
app.get('/', (req, res) => {
  res.send('O servidor de pagamentos está funcionando e configurado com CORS!');
});

app.post('/create_payment', (req, res) => {
  const dadosDoPedido = req.body;
  const payment = new Payment(client);

  console.log("📥 Requisição recebida:", dadosDoPedido);

  payment.create({ body: dadosDoPedido })
    .then(resposta => {
      console.log("✅ Pagamento criado com sucesso! ID:", resposta.id);
      const qrCodeBase64 = resposta.point_of_interaction.transaction_data.qr_code_base64;
      const qrCodeTexto = resposta.point_of_interaction.transaction_data.qr_code;
      res.status(201).json({
        qr_code_base64: qrCodeBase64,
        qr_code_text: qrCodeTexto,
        payment_id: resposta.id
      });
    })
    .catch(erro => {
      console.error("❌ ERRO AO CRIAR PAGAMENTO:", erro);
      res.status(500).json({ error: 'Ops, algo deu errado no servidor ao criar o pagamento.' });
    });
});

// --- Iniciar o Servidor ---
const porta = process.env.PORT || 3000;
app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}.`);
});

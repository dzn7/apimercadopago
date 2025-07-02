// =======================================================
// SERVIDOR FINAL - COM DADOS DETALHADOS E CÁLCULO SEGURO
// =======================================================

const express = require('express');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const cors = require('cors');

// --- CREDENCIAIS E CONFIGURAÇÕES ---
const accessToken = process.env.MP_ACCESS_TOKEN;

if (!accessToken) {
  console.error("ERRO CRÍTICO: Variável de ambiente MP_ACCESS_TOKEN não configurada.");
}

const client = new MercadoPagoConfig({ accessToken });
const app = express();

const corsOptions = {
  origin: ["https://siteacai.onrender.com", "https://rainbow-chimera-9ee49e.netlify.app"], // Permite ambos os seus domínios
  methods: ["GET", "POST"],
};
app.use(cors(corsOptions));
app.use(express.json());

// --- "BANCO DE DADOS" DE PREÇOS NO SERVIDOR ---
// Esta é a sua "fonte da verdade" para os preços. Evita fraude.
const productsData = {
  tigela300: { title: 'Tigela de 300ml', unit_price: 15 },
  tigela400: { title: 'Tigela de 400ml', unit_price: 19 },
  tigela700: { title: 'Tigela de 700ml', unit_price: 35 },
  copo250: { title: 'Copo de 250ml', unit_price: 12 },
  copo300: { title: 'Copo de 300ml', unit_price: 14 },
  copo400: { title: 'Copo de 400ml', unit_price: 18 },
  barcaP: { title: 'Barca Pequena', unit_price: 35 },
  barcaG: { title: 'Barca Grande', unit_price: 65 }
};

const complementsData = {
  nutella: { name: 'Nutella', price: 2 },
  doce_leite: { name: 'Doce de leite', price: 2 },
  kiwi: { name: 'Kiwi', price: 2 },
  creme_ninho: { name: 'Ninho', price: 2 },
  creme_bacuri: { name: 'Bacuri', price: 2 },
  creme_maracuja: { name: 'Maracujá', price: 2 }
  // Complementos grátis não precisam estar aqui, pois o preço é 0.
};


// --- ROTAS ---
app.get('/', (req, res) => {
  res.send('Servidor de pagamentos Açaí em Casa está no ar.');
});

app.post('/create_payment', async (req, res) => {
  try {
    // Recebe os dados do front-end
    const { cart, customerName } = req.body;

    // --- LÓGICA DE CÁLCULO E MONTAGEM DO PEDIDO NO SERVIDOR ---
    
    // 1. Processa os itens do carrinho para o formato do Mercado Pago
    const items = cart.map(item => {
      const productInfo = productsData[item.productId];
      if (!productInfo) {
        throw new Error(`Produto inválido no carrinho: ${item.productId}`);
      }

      // Calcula o preço dos complementos para este item
      let complementsPrice = 0;
      item.complements.forEach(comp_id => {
        complementsPrice += complementsData[comp_id]?.price || 0;
      });
      
      const itemTotalPrice = productInfo.unit_price + complementsPrice;

      return {
        id: item.productId,
        title: productInfo.title,
        description: `Com ${item.complements.length} complemento(s)`,
        quantity: 1,
        unit_price: itemTotalPrice, // O preço do item já inclui os complementos
        category_id: "food"
      };
    });

    // 2. Calcula o valor total da transação no servidor (MAIS SEGURO)
    const totalAmount = items.reduce((total, item) => total + item.unit_price, 0);

    // 3. Processa o nome do comprador
    const nameParts = customerName.split(' ');
    const firstName = nameParts.shift() || 'Comprador';
    const lastName = nameParts.join(' ') || 'Anônimo';

    // 4. Monta o objeto de pagamento final
    const dadosDoPagamento = {
      transaction_amount: totalAmount,
      description: `Pedido de ${customerName}`,
      payment_method_id: 'pix',
      payer: {
        email: 'comprador-teste@email.com', // E-mail de teste obrigatório
        first_name: firstName,
        last_name: lastName,
      },
      items: items, // Envia a lista detalhada de itens
    };

    console.log("📥 Enviando para o Mercado Pago:", JSON.stringify(dadosDoPagamento, null, 2));

    const paymentInstance = new Payment(client);
    const resultado = await paymentInstance.create({ body: dadosDoPagamento });

    // Envia a resposta de sucesso para o front-end
    res.status(201).json({
      payment_id: resultado.id,
      qr_code_base64: resultado.point_of_interaction.transaction_data.qr_code_base64,
      qr_code_text: resultado.point_of_interaction.transaction_data.qr_code,
    });

  } catch (error) {
    console.error("❌ ERRO AO CRIAR PAGAMENTO:", error.cause || error.message);
    res.status(500).json({ 
        error: 'Erro interno ao criar pagamento.',
        details: error.cause?.data?.message || error.message
    });
  }
});


// --- INICIAR SERVIDOR ---
const porta = process.env.PORT || 3000;
app.listen(porta, () => {
  console.log(`✅ Servidor de produção rodando na porta ${porta}.`);
});

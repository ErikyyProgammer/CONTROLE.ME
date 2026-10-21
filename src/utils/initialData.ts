import { Produto, Venda } from '../types';

export const INITIAL_ESTOQUE: Produto[] = [
  { id: 1, nome: 'Café Moido 500g', preco: 15.50, codigo: '789123456', qtd: 10, categoria: 'Bebidas', custo: 9.80, estoqueMinimo: 3 },
  { id: 2, nome: 'Arroz Tipo 1 5kg', preco: 25.00, codigo: '789654321', qtd: 5, categoria: 'Alimentos', custo: 17.50, estoqueMinimo: 4 },
  { id: 3, nome: 'Feijão Preto 1kg', preco: 8.90, codigo: '789111222', qtd: 18, categoria: 'Alimentos', custo: 5.20, estoqueMinimo: 5 },
  { id: 4, nome: 'Óleo de Soja 900ml', preco: 6.50, codigo: '789333444', qtd: 2, categoria: 'Alimentos', custo: 4.10, estoqueMinimo: 5 },
  { id: 5, nome: 'Leite Integral 1L', preco: 4.80, codigo: '789555666', qtd: 15, categoria: 'Laticínios', custo: 3.10, estoqueMinimo: 6 },
  { id: 6, nome: 'Açúcar Refinado 1kg', preco: 4.20, codigo: '789777888', qtd: 12, categoria: 'Alimentos', custo: 2.70, estoqueMinimo: 4 },
  { id: 7, nome: 'Sabão em Pó 1kg', preco: 14.90, codigo: '789999000', qtd: 8, categoria: 'Limpeza', custo: 9.50, estoqueMinimo: 3 },
  { id: 8, nome: 'Refrigerante Cola 2L', preco: 8.50, codigo: '789123789', qtd: 20, categoria: 'Bebidas', custo: 5.00, estoqueMinimo: 5 },
  { id: 9, nome: 'Biscoito Recheado 130g', preco: 3.20, codigo: '789456123', qtd: 25, categoria: 'Snacks', custo: 1.80, estoqueMinimo: 8 },
  { id: 10, nome: 'Detergente Líquido 500ml', preco: 2.90, codigo: '789000111', qtd: 1, categoria: 'Limpeza', custo: 1.40, estoqueMinimo: 5 },
];

export const INITIAL_HISTORICO: Venda[] = [
  {
    id: 'VND-1001',
    data: new Date(Date.now() - 3600000 * 2).toISOString(),
    itens: [
      { id: 1, nome: 'Café Moido 500g', preco: 15.50, qtd: 2, subtotal: 31.00 },
      { id: 5, nome: 'Leite Integral 1L', preco: 4.80, qtd: 3, subtotal: 14.40 }
    ],
    subtotal: 45.40,
    desconto: 0,
    total: 45.40,
    formaPagamento: 'pix',
    valorPago: 45.40,
    troco: 0
  },
  {
    id: 'VND-1002',
    data: new Date(Date.now() - 3600000 * 5).toISOString(),
    itens: [
      { id: 2, nome: 'Arroz Tipo 1 5kg', preco: 25.00, qtd: 1, subtotal: 25.00 },
      { id: 3, nome: 'Feijão Preto 1kg', preco: 8.90, qtd: 2, subtotal: 17.80 }
    ],
    subtotal: 42.80,
    desconto: 2.80,
    total: 40.00,
    formaPagamento: 'dinheiro',
    valorPago: 50.00,
    troco: 10.00
  }
];

export interface StoreSettings {
  nomeLoja: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  mensagemCupom: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  nomeLoja: 'MercadoFácil PDV',
  cnpj: '12.345.678/0001-90',
  endereco: 'Rua do Comércio, 123 - Centro',
  telefone: '(11) 98765-4321',
  mensagemCupom: 'Obrigado pela preferência! Volte Sempre!'
};

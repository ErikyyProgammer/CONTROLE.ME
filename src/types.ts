export interface Produto {
  id: number;
  nome: string;
  preco: number;
  codigo: string;
  qtd: number;
  categoria?: string;
  custo?: number;
  estoqueMinimo?: number;
}

export interface ItemCarrinho {
  cartId: string;
  id: number;
  nome: string;
  preco: number;
  codigo: string;
  qtd: number;
}

export type FormaPagamento = 'dinheiro' | 'pix' | 'credito' | 'debito';

export interface Venda {
  id: string;
  data: string; // ISO string or formatted date
  itens: {
    id: number;
    nome: string;
    preco: number;
    qtd: number;
    subtotal: number;
  }[];
  subtotal: number;
  desconto: number;
  total: number;
  formaPagamento: FormaPagamento;
  valorPago?: number;
  troco?: number;
}

export type ViewType = 'vendas' | 'estoque' | 'historico';

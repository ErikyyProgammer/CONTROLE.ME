import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Search,
  Trash2,
  Plus,
  Minus,
  DollarSign,
  QrCode,
  CreditCard,
  Banknote,
  Sparkles,
  ShoppingBag,
  AlertCircle,
  Tag,
  CheckCircle2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Produto, ItemCarrinho, FormaPagamento, Venda } from '../types';
import { soundEffects } from '../utils/sound';

interface VendasViewProps {
  estoque: Produto[];
  onFinalizarVenda: (venda: Venda) => void;
  onOpenScanner: () => void;
}

export const VendasView: React.FC<VendasViewProps> = ({
  estoque,
  onFinalizarVenda,
  onOpenScanner,
}) => {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [codigoOuNome, setCodigoOuNome] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('Todos');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix');
  const [valorPagoStr, setValorPagoStr] = useState<string>('');
  const [descontoStr, setDescontoStr] = useState<string>('0');
  const [mensagemAviso, setMensagemAviso] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus barcode input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard shortcut listener (F10 for checkout, F2 focus input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F10') {
        e.preventDefault();
        executarFinalizacao();
      } else if (e.key === 'F2') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [carrinho, formaPagamento, valorPagoStr, descontoStr, estoque]);

  // Extract unique categories from current stock
  const categorias = ['Todos', ...Array.from(new Set(estoque.map((p) => p.categoria || 'Geral')))];

  // Helper to add product to cart by object
  const adicionarAoCarrinho = (produto: Produto) => {
    // Check available stock considering current items in cart
    const itemExistente = carrinho.find((item) => item.id === produto.id);
    const qtdAtualNoCarrinho = itemExistente ? itemExistente.qtd : 0;

    if (produto.qtd <= qtdAtualNoCarrinho) {
      setMensagemAviso(`Atenção: Estoque insuficiente de "${produto.nome}"! Disponível: ${produto.qtd}`);
      soundEffects.playError();
      setTimeout(() => setMensagemAviso(null), 3000);
      return;
    }

    soundEffects.playBeep();

    if (itemExistente) {
      setCarrinho(
        carrinho.map((item) =>
          item.id === produto.id
            ? { ...item, qtd: item.qtd + 1 }
            : item
        )
      );
    } else {
      setCarrinho([
        ...carrinho,
        {
          cartId: `${produto.id}-${Date.now()}`,
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          codigo: produto.codigo,
          qtd: 1,
        },
      ]);
    }

    setCodigoOuNome('');
  };

  // Helper to add product by barcode input
  const handleBipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoOuNome.trim()) return;

    const termo = codigoOuNome.trim().toLowerCase();

    // Exact barcode match first
    let produto = estoque.find((p) => p.codigo.toLowerCase() === termo);

    // If not exact barcode, match name or partial barcode
    if (!produto) {
      produto = estoque.find((p) => p.nome.toLowerCase().includes(termo) || p.codigo.includes(termo));
    }

    if (produto) {
      adicionarAoCarrinho(produto);
    } else {
      setMensagemAviso(`Produto "${codigoOuNome}" não foi encontrado no estoque.`);
      soundEffects.playError();
      setTimeout(() => setMensagemAviso(null), 3500);
    }
  };

  // Quantity modification in cart
  const alterarQtdCarrinho = (cartId: string, delta: number) => {
    setCarrinho((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const produtoOriginal = estoque.find((p) => p.id === item.id);
            const novaQtd = item.qtd + delta;

            if (novaQtd <= 0) return null;

            if (produtoOriginal && novaQtd > produtoOriginal.qtd) {
              setMensagemAviso(`Limite de estoque atingido para ${item.nome}!`);
              soundEffects.playError();
              setTimeout(() => setMensagemAviso(null), 3000);
              return item;
            }

            return { ...item, qtd: novaQtd };
          }
          return item;
        })
        .filter(Boolean) as ItemCarrinho[]
    );
  };

  const removerDoCarrinho = (cartId: string) => {
    setCarrinho((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const limparCarrinho = () => {
    setCarrinho([]);
  };

  // Calculations
  const subtotal = carrinho.reduce((acc, item) => acc + item.preco * item.qtd, 0);
  const desconto = Math.max(0, parseFloat(descontoStr.replace(',', '.')) || 0);
  const total = Math.max(0, subtotal - desconto);
  const valorPago = parseFloat(valorPagoStr.replace(',', '.')) || 0;
  const troco = formaPagamento === 'dinheiro' && valorPago > total ? valorPago - total : 0;

  // Finalize Sale handler
  const executarFinalizacao = () => {
    if (carrinho.length === 0) {
      setMensagemAviso('O carrinho está vazio!');
      soundEffects.playError();
      setTimeout(() => setMensagemAviso(null), 3000);
      return;
    }

    if (formaPagamento === 'dinheiro' && valorPago < total) {
      setMensagemAviso('O valor pago em dinheiro é menor do que o total da venda!');
      soundEffects.playError();
      setTimeout(() => setMensagemAviso(null), 3500);
      return;
    }

    const novaVenda: Venda = {
      id: `VND-${Math.floor(1000 + Math.random() * 9000)}`,
      data: new Date().toISOString(),
      itens: carrinho.map((item) => ({
        id: item.id,
        nome: item.nome,
        preco: item.preco,
        qtd: item.qtd,
        subtotal: item.preco * item.qtd,
      })),
      subtotal,
      desconto,
      total,
      formaPagamento,
      valorPago: formaPagamento === 'dinheiro' ? valorPago : total,
      troco: formaPagamento === 'dinheiro' ? troco : 0,
    };

    // Confetti & Sound
    soundEffects.playSuccess();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Ignore
    }

    onFinalizarVenda(novaVenda);

    // Reset state
    setCarrinho([]);
    setValorPagoStr('');
    setDescontoStr('0');
    setCodigoOuNome('');
    inputRef.current?.focus();
  };

  // Products filtered by search and category
  const produtosFiltrados = estoque.filter((prod) => {
    const combinaCategoria = categoriaAtiva === 'Todos' || prod.categoria === categoriaAtiva;
    const combinaBusca =
      !codigoOuNome.trim() ||
      prod.nome.toLowerCase().includes(codigoOuNome.toLowerCase()) ||
      prod.codigo.includes(codigoOuNome);

    return combinaCategoria && combinaBusca;
  });

  return (
    <div className="space-y-6">
      {/* Warning Banner if any */}
      {mensagemAviso && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-xl shadow-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-sm font-medium">{mensagemAviso}</span>
          </div>
          <button
            onClick={() => setMensagemAviso(null)}
            className="text-amber-700 hover:text-amber-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid: 2 Columns on desktop (Catalog/Input on left, Cart on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7/12): Product Scan, Search, Catalog */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Bar: Scan Button & Barcode Search Field */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              {/* Camera Trigger */}
              <button
                type="button"
                onClick={onOpenScanner}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2.5 transition active:scale-[0.98] shrink-0"
              >
                <Camera className="w-5 h-5" />
                <span>Bipar Câmera</span>
              </button>

              {/* Barcode/Name Input Form */}
              <form onSubmit={handleBipSubmit} className="flex-1 relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={codigoOuNome}
                  onChange={(e) => setCodigoOuNome(e.target.value)}
                  placeholder="Bipe o código ou digite nome/código (Enter ou F2)..."
                  className="w-full pl-11 pr-24 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition"
                >
                  Adicionar
                </button>
              </form>
            </div>

            {/* Quick Categories Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
                <Tag className="w-3.5 h-3.5" /> Fazer busca:
              </span>
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaAtiva(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    categoriaAtiva === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid of Products */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                Catálogo Rápido ({produtosFiltrados.length})
              </h3>
              <span className="text-xs text-slate-400">Clique no item para adicionar</span>
            </div>

            {produtosFiltrados.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500 text-sm font-medium">Nenhum produto encontrado</p>
                <p className="text-slate-400 text-xs mt-1">
                  Tente alterar os termos da busca ou filtre por outra categoria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
                {produtosFiltrados.map((prod) => {
                  const semEstoque = prod.qtd <= 0;
                  const estoqueBaixo = prod.qtd <= (prod.estoqueMinimo ?? 3) && !semEstoque;

                  return (
                    <button
                      key={prod.id}
                      onClick={() => !semEstoque && adicionarAoCarrinho(prod)}
                      disabled={semEstoque}
                      className={`group relative text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between h-32 ${
                        semEstoque
                          ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                          : 'bg-slate-50 hover:bg-blue-50/60 border-slate-200/80 hover:border-blue-300 hover:shadow-md cursor-pointer active:scale-[0.98]'
                      }`}
                    >
                      {/* Top row: Category badge & Stock indicator */}
                      <div className="flex items-center justify-between w-full text-[10px]">
                        <span className="bg-slate-200/80 text-slate-600 font-semibold px-2 py-0.5 rounded uppercase tracking-wider truncate max-w-[90px]">
                          {prod.categoria || 'Geral'}
                        </span>
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded ${
                            semEstoque
                              ? 'bg-red-100 text-red-700'
                              : estoqueBaixo
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {semEstoque ? 'Sem Estoque' : `${prod.qtd} un`}
                        </span>
                      </div>

                      {/* Title & Barcode */}
                      <div>
                        <h4 className="font-semibold text-xs text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-700">
                          {prod.nome}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{prod.codigo}</p>
                      </div>

                      {/* Bottom Price */}
                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60">
                        <span className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600">
                          R$ {prod.preco.toFixed(2)}
                        </span>
                        <span className="bg-white group-hover:bg-blue-600 text-slate-600 group-hover:text-white p-1 rounded-md text-[10px] font-bold shadow-2xs transition">
                          + Add
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (5/12): Cart & Checkout Panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col sticky top-20">
          {/* Cart Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-base text-white">
                Itens da Venda <span className="text-xs font-normal text-slate-400">({carrinho.length})</span>
              </h3>
            </div>
            {carrinho.length > 0 && (
              <button
                onClick={limparCarrinho}
                className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Esvaziar
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="p-4 flex-1 min-h-[220px] max-h-[320px] overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
            {carrinho.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                <ShoppingBag className="w-12 h-12 stroke-[1.2] text-slate-300 mb-2" />
                <p className="font-medium text-sm text-slate-600">O carrinho está vazio</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                  Bipe o código do produto ou selecione itens do catálogo
                </p>
              </div>
            ) : (
              carrinho.map((item) => (
                <div key={item.cartId} className="py-3 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-slate-800 truncate">{item.nome}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      R$ {item.preco.toFixed(2)} / un
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                    <button
                      onClick={() => alterarQtdCarrinho(item.cartId, -1)}
                      className="p-1 hover:bg-slate-100 text-slate-600 rounded transition"
                      title="Diminuir"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-800">{item.qtd}</span>
                    <button
                      onClick={() => alterarQtdCarrinho(item.cartId, 1)}
                      className="p-1 hover:bg-slate-100 text-slate-600 rounded transition"
                      title="Aumentar"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal & Delete */}
                  <div className="text-right pl-2">
                    <p className="font-extrabold text-xs text-slate-900">
                      R$ {(item.preco * item.qtd).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removerDoCarrinho(item.cartId)}
                      className="text-slate-400 hover:text-red-600 text-[10px] mt-0.5 inline-block"
                      title="Remover item"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment & Totals Section */}
          <div className="p-4 bg-white border-t border-slate-200 space-y-3">
            {/* Discount Field */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Desconto (R$):
              </span>
              <input
                type="number"
                min="0"
                step="0.50"
                value={descontoStr}
                onChange={(e) => setDescontoStr(e.target.value)}
                placeholder="0.00"
                className="w-24 text-right border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Payment Method Selector */}
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1.5">Forma de Pagamento:</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'pix', label: 'PIX', icon: QrCode },
                  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
                  { id: 'credito', label: 'Crédito', icon: CreditCard },
                  { id: 'debito', label: 'Débito', icon: CreditCard },
                ].map((met) => {
                  const Icon = met.icon;
                  const isSelected = formaPagamento === met.id;
                  return (
                    <button
                      key={met.id}
                      type="button"
                      onClick={() => setFormaPagamento(met.id as FormaPagamento)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 border transition ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{met.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Payment Details (Amount Paid & Change) */}
            {formaPagamento === 'dinheiro' && (
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-2 text-xs animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-900">Valor Recebido:</span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-amber-700 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.5"
                      value={valorPagoStr}
                      onChange={(e) => setValorPagoStr(e.target.value)}
                      placeholder={total.toFixed(2)}
                      className="w-28 text-right pl-7 pr-2 py-1 bg-white border border-amber-300 rounded-lg font-extrabold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Quick note buttons */}
                <div className="flex items-center gap-1 justify-end pt-1">
                  {[total, 10, 20, 50, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setValorPagoStr(val.toFixed(2))}
                      className="px-2 py-0.5 bg-amber-200/60 hover:bg-amber-200 text-amber-900 rounded font-semibold text-[10px]"
                    >
                      {val === total ? 'Exato' : `R$${val}`}
                    </button>
                  ))}
                </div>

                {/* Change */}
                <div className="flex items-center justify-between border-t border-amber-200 pt-2 font-bold text-xs">
                  <span className="text-amber-900">Troco a Devolver:</span>
                  <span className={`text-sm ${troco > 0 ? 'text-emerald-700 font-extrabold' : 'text-slate-500'}`}>
                    R$ {troco.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Total Display */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold block">TOTAL DA VENDA</span>
                {desconto > 0 && (
                  <span className="text-[10px] text-emerald-600 font-medium">
                    (Economia de R$ {desconto.toFixed(2)})
                  </span>
                )}
              </div>
              <span className="text-2xl font-black text-emerald-600 tracking-tight">
                R$ {total.toFixed(2)}
              </span>
            </div>

            {/* Submit Button */}
            <button
              onClick={executarFinalizacao}
              disabled={carrinho.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold py-4 rounded-xl text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:shadow-none"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>FINALIZAR VENDA (F10)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

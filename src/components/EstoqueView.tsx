import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Barcode,
  Download,
  Upload,
  X,
  Check,
  RefreshCw,
  Tag,
  Eye,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Produto } from '../types';

interface EstoqueViewProps {
  estoque: Produto[];
  onAddProduto: (produto: Omit<Produto, 'id'>) => void;
  onEditProduto: (produto: Produto) => void;
  onDeleteProduto: (id: number) => void;
  onUpdateQtd: (id: number, delta: number) => void;
  onResetData: () => void;
}

export const EstoqueView: React.FC<EstoqueViewProps> = ({
  estoque,
  onAddProduto,
  onEditProduto,
  onDeleteProduto,
  onUpdateQtd,
  onResetData,
}) => {
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [apenasBaixoEstoque, setApenasBaixoEstoque] = useState(false);

  // Modal states
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);

  // Barcode Label modal state
  const [barcodeModalProduto, setBarcodeModalProduto] = useState<Produto | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [custo, setCusto] = useState('');
  const [codigo, setCodigo] = useState('');
  const [qtd, setQtd] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('3');
  const [categoria, setCategoria] = useState('Alimentos');

  const categorias = ['Todas', ...Array.from(new Set(estoque.map((p) => p.categoria || 'Geral')))];

  const abrirModalNovo = () => {
    setProdutoEditando(null);
    setNome('');
    setPreco('');
    setCusto('');
    setCodigo(gerarCodigoAleatorio());
    setQtd('10');
    setEstoqueMinimo('3');
    setCategoria('Alimentos');
    setModalAberto(true);
  };

  const abrirModalEditar = (prod: Produto) => {
    setProdutoEditando(prod);
    setNome(prod.nome);
    setPreco(prod.preco.toString());
    setCusto(prod.custo ? prod.custo.toString() : '');
    setCodigo(prod.codigo);
    setQtd(prod.qtd.toString());
    setEstoqueMinimo((prod.estoqueMinimo ?? 3).toString());
    setCategoria(prod.categoria || 'Geral');
    setModalAberto(true);
  };

  const gerarCodigoAleatorio = () => {
    // Generate 9 digit mock barcode starting with 789 (Brazil Prefix)
    return `789${Math.floor(100000000 + Math.random() * 900000000)}`;
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !preco || !codigo.trim()) {
      alert('Por favor, preencha Nome, Preço e Código de Barras.');
      return;
    }

    const payload = {
      nome: nome.trim(),
      preco: Math.max(0, parseFloat(preco) || 0),
      custo: custo ? Math.max(0, parseFloat(custo) || 0) : undefined,
      codigo: codigo.trim(),
      qtd: Math.max(0, parseInt(qtd, 10) || 0),
      estoqueMinimo: Math.max(1, parseInt(estoqueMinimo, 10) || 3),
      categoria: categoria.trim() || 'Geral',
    };

    if (produtoEditando) {
      onEditProduto({ ...payload, id: produtoEditando.id });
    } else {
      onAddProduto(payload);
    }

    setModalAberto(false);
  };

  // Export inventory to CSV
  const exportarCSV = () => {
    const headers = 'ID,Nome,Codigo,Categoria,Preco,Custo,Quantidade,EstoqueMinimo\n';
    const rows = estoque
      .map(
        (p) =>
          `${p.id},"${p.nome.replace(/"/g, '""')}",${p.codigo},${p.categoria || 'Geral'},${p.preco},${
            p.custo || 0
          },${p.qtd},${p.estoqueMinimo ?? 3}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `estoque_mercadofacil_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter products
  const produtosFiltrados = estoque.filter((p) => {
    const combinaBusca =
      !busca.trim() ||
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigo.includes(busca);

    const combinaCategoria = categoriaFiltro === 'Todas' || p.categoria === categoriaFiltro;
    const combinaBaixoEstoque = !apenasBaixoEstoque || p.qtd <= (p.estoqueMinimo ?? 3);

    return combinaBusca && combinaCategoria && combinaBaixoEstoque;
  });

  // Financial Stats
  const valorTotalEstoque = estoque.reduce((acc, p) => acc + p.preco * p.qtd, 0);
  const totalItens = estoque.reduce((acc, p) => acc + p.qtd, 0);
  const itensBaixoEstoque = estoque.filter((p) => p.qtd <= (p.estoqueMinimo ?? 3)).length;

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Produtos</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{estoque.length} <span className="text-xs font-normal text-slate-500">({totalItens} unidades)</span></h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor do Estoque</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              R$ {valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setApenasBaixoEstoque(!apenasBaixoEstoque)}
          className={`p-5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
            itensBaixoEstoque > 0
              ? 'bg-amber-50/80 border-amber-300 hover:bg-amber-100/80'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Estoque Crítico / Baixo</p>
            <h3 className="text-2xl font-black text-amber-700 mt-1">{itensBaixoEstoque} itens</h3>
          </div>
          <div className="p-3 bg-amber-200/60 text-amber-900 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-5 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/50">
          {/* Search bar */}
          <div className="flex-1 relative flex items-center min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por produto ou código de barras..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  Categoria: {cat}
                </option>
              ))}
            </select>

            {/* Low stock filter toggle */}
            <button
              onClick={() => setApenasBaixoEstoque(!apenasBaixoEstoque)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border shadow-2xs ${
                apenasBaixoEstoque
                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Apenas Baixo</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={exportarCSV}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
              title="Exportar planilha CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {/* New Product Button */}
            <button
              onClick={abrirModalNovo}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">Produto</th>
                <th className="p-4">Código de Barras</th>
                <th className="p-4 text-right">Preço Venda</th>
                <th className="p-4 text-right">Custo</th>
                <th className="p-4 text-center">Quantidade</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    Nenhum produto cadastrado com esses filtros.
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((prod) => {
                  const baixoEstoque = prod.qtd <= (prod.estoqueMinimo ?? 3);
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                      {/* Name & Category */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{prod.nome}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold text-[10px]">
                          {prod.categoria || 'Geral'}
                        </span>
                      </td>

                      {/* Barcode & Printable label */}
                      <td className="p-4 font-mono text-slate-600">
                        <button
                          onClick={() => setBarcodeModalProduto(prod)}
                          className="flex items-center gap-1.5 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition"
                          title="Clique para visualizar etiqueta de código de barras"
                        >
                          <Barcode className="w-4 h-4 text-slate-400" />
                          <span>{prod.codigo}</span>
                        </button>
                      </td>

                      {/* Sale Price */}
                      <td className="p-4 text-right font-extrabold text-emerald-700 text-sm">
                        R$ {prod.preco.toFixed(2)}
                      </td>

                      {/* Cost */}
                      <td className="p-4 text-right text-slate-500 font-mono">
                        {prod.custo ? `R$ ${prod.custo.toFixed(2)}` : '-'}
                      </td>

                      {/* Quantity & Adjustment Controls */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onUpdateQtd(prod.id, -1)}
                            className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded flex items-center justify-center transition"
                            title="Diminuir 1"
                          >
                            -
                          </button>
                          <span
                            className={`font-black text-sm px-2.5 py-1 rounded-lg ${
                              prod.qtd === 0
                                ? 'bg-red-100 text-red-700'
                                : baixoEstoque
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {prod.qtd}
                          </span>
                          <button
                            onClick={() => onUpdateQtd(prod.id, 1)}
                            className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded flex items-center justify-center transition"
                            title="Aumentar 1"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => abrirModalEditar(prod)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja excluir "${prod.nome}"?`)) {
                                onDeleteProduto(prod.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Novo / Editar Produto */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {produtoEditando ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Leite Integral 1L"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Barcode with Generator */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Código de Barras *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="789123456"
                    className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setCodigo(gerarCodigoAleatorio())}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition shrink-0"
                    title="Gerar código aleatório"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Gerar
                  </button>
                </div>
              </div>

              {/* Prices: Preço Venda & Custo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    placeholder="15.50"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preço de Custo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={custo}
                    onChange={(e) => setCusto(e.target.value)}
                    placeholder="9.80"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Qtd, Min Stock, Category */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qtd Atual</label>
                  <input
                    type="number"
                    min="0"
                    value={qtd}
                    onChange={(e) => setQtd(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qtd Mínima</label>
                  <input
                    type="number"
                    min="1"
                    value={estoqueMinimo}
                    onChange={(e) => setEstoqueMinimo(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Alimentos"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  {produtoEditando ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Barcode Label Preview */}
      {barcodeModalProduto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between no-print">
              <h3 className="font-bold text-sm">Etiqueta de Código de Barras</h3>
              <button
                onClick={() => setBarcodeModalProduto(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Label Box */}
            <div className="p-6 bg-white text-center space-y-3 printable-receipt">
              <p className="font-extrabold text-sm text-slate-900">{barcodeModalProduto.nome}</p>
              <p className="text-xl font-black text-emerald-600">R$ {barcodeModalProduto.preco.toFixed(2)}</p>

              {/* Simulated barcode visual lines */}
              <div className="py-2 flex flex-col items-center justify-center">
                <div className="h-16 w-full flex items-center justify-center gap-0.5 bg-white p-2 border border-slate-200 rounded">
                  {barcodeModalProduto.codigo.split('').map((char, i) => {
                    const num = parseInt(char, 10) || 1;
                    const isWide = num % 2 === 0;
                    return (
                      <span
                        key={i}
                        className={`h-12 bg-slate-950 ${isWide ? 'w-1.5' : 'w-0.5'}`}
                      />
                    );
                  })}
                </div>
                <p className="font-mono text-xs font-bold text-slate-700 mt-1">
                  {barcodeModalProduto.codigo}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 text-white font-bold py-2 rounded-xl text-xs hover:bg-slate-800 transition"
              >
                Imprimir Etiqueta
              </button>
              <button
                onClick={() => setBarcodeModalProduto(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-300 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

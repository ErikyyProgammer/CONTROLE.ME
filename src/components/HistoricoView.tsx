import React, { useState } from 'react';
import {
  History,
  Search,
  Calendar,
  Printer,
  Trash2,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  QrCode,
  Banknote,
  FileText
} from 'lucide-react';
import { Venda } from '../types';

interface HistoricoViewProps {
  historico: Venda[];
  onSelectVendaParaReimprimir: (venda: Venda) => void;
  onExcluirVenda: (id: string) => void;
}

export const HistoricoView: React.FC<HistoricoViewProps> = ({
  historico,
  onSelectVendaParaReimprimir,
  onExcluirVenda,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroPagamento, setFiltroPagamento] = useState('todos');

  // Filter sales
  const vendasFiltradas = historico.filter((v) => {
    const combinaBusca =
      !busca.trim() ||
      v.id.toLowerCase().includes(busca.toLowerCase()) ||
      v.itens.some((i) => i.nome.toLowerCase().includes(busca.toLowerCase()));

    const combinaPagamento =
      filtroPagamento === 'todos' || v.formaPagamento === filtroPagamento;

    return combinaBusca && combinaPagamento;
  });

  // Calculate Metrics
  const totalFaturado = historico.reduce((acc, v) => acc + v.total, 0);
  const totalVendas = historico.length;
  const ticketMedio = totalVendas > 0 ? totalFaturado / totalVendas : 0;

  const getIconePagamento = (forma: string) => {
    switch (forma) {
      case 'pix':
        return <QrCode className="w-3.5 h-3.5 text-teal-600" />;
      case 'dinheiro':
        return <Banknote className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <CreditCard className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faturamento Total</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              R$ {totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendas Realizadas</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalVendas} vendas</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket Médio</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              R$ {ticketMedio.toFixed(2)}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sales History List Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Header & Search */}
        <div className="p-5 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Histórico de Transações</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex items-center min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar ID ou produto..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Payment Filter */}
            <select
              value={filtroPagamento}
              onChange={(e) => setFiltroPagamento(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos Pagamentos</option>
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="credito">Crédito</option>
              <option value="debito">Débito</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">CÓDIGO / DATA</th>
                <th className="p-4">ITENS VENDIDOS</th>
                <th className="p-4">PAGAMENTO</th>
                <th className="p-4 text-right">TOTAL</th>
                <th className="p-4 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {vendasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                    Nenhuma venda encontrada no histórico.
                  </td>
                </tr>
              ) : (
                vendasFiltradas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-slate-50/80 transition">
                    {/* Sale ID & Date */}
                    <td className="p-4">
                      <span className="font-extrabold text-slate-900 font-mono">{venda.id}</span>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(venda.data).toLocaleString('pt-BR')}
                      </p>
                    </td>

                    {/* Summary Items */}
                    <td className="p-4 max-w-xs">
                      <div className="line-clamp-2 text-slate-700 font-medium">
                        {venda.itens.map((i) => `${i.qtd}x ${i.nome}`).join(', ')}
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        ({venda.itens.reduce((acc, i) => acc + i.qtd, 0)} itens)
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800 font-bold text-[11px] uppercase">
                        {getIconePagamento(venda.formaPagamento)}
                        {venda.formaPagamento}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="p-4 text-right font-black text-emerald-600 text-sm">
                      R$ {venda.total.toFixed(2)}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectVendaParaReimprimir(venda)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs flex items-center gap-1 transition"
                          title="Reimprimir Cupom"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-600" />
                          <span>Cupom</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja cancelar/excluir a venda ${venda.id}?`)) {
                              onExcluirVenda(venda.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Excluir Venda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

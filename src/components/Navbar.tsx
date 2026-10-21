import React from 'react';
import { ShoppingCart, Package, History, Store, AlertTriangle, RefreshCw } from 'lucide-react';
import { ViewType, Produto, Venda } from '../types';

interface NavbarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  estoque: Produto[];
  historico: Venda[];
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  estoque,
  historico,
  onResetData,
}) => {
  // Calculate low stock items count (below or equal to min quantity or < 3)
  const itensEstoqueBaixo = estoque.filter(
    (p) => p.qtd <= (p.estoqueMinimo ?? 3)
  );

  // Calculate today's sales total
  const hoje = new Date().toISOString().split('T')[0];
  const vendasHoje = historico.filter((v) => v.data.startsWith(hoje));
  const faturamentoHoje = vendasHoje.reduce((acc, v) => acc + v.total, 0);

  return (
    <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Store Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl shadow-md text-white">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white italic">
                  MercadoFácil <span className="text-blue-400 font-extrabold not-italic text-xs bg-blue-950 px-2 py-0.5 rounded border border-blue-800">PDV 2.0</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Ponto de Venda & Gestão Inteligente</p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => onSelectView('vendas')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                currentView === 'vendas'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Vendas</span>
            </button>

            <button
              onClick={() => onSelectView('estoque')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl font-medium text-sm transition-all relative ${
                currentView === 'estoque'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Estoque</span>
              {itensEstoqueBaixo.length > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold text-xs px-1.5 py-0.5 rounded-full flex items-center justify-center animate-pulse">
                  {itensEstoqueBaixo.length}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectView('historico')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                currentView === 'historico'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden md:inline">Histórico</span>
            </button>
          </nav>

          {/* Right Section: Today's Revenue + Alert + Reset */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Low stock pill */}
            {itensEstoqueBaixo.length > 0 && (
              <div
                onClick={() => onSelectView('estoque')}
                className="cursor-pointer bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-xs font-medium hover:bg-amber-500/20 transition"
                title="Ver itens em falta/baixo estoque"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{itensEstoqueBaixo.length} item(ns) repor</span>
              </div>
            )}

            {/* Today's total sales */}
            <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-xl text-right">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                Vendas Hoje ({vendasHoje.length})
              </span>
              <span className="text-sm font-bold text-emerald-400">
                R$ {faturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Reset button */}
            <button
              onClick={onResetData}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Restaurar dados de demonstração"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { ViewType, Produto, Venda } from './types';
import { INITIAL_ESTOQUE, INITIAL_HISTORICO } from './utils/initialData';
import { Navbar } from './components/Navbar';
import { VendasView } from './components/VendasView';
import { EstoqueView } from './components/EstoqueView';
import { HistoricoView } from './components/HistoricoView';
import { ScannerModal } from './components/ScannerModal';
import { ReceiptModal } from './components/ReceiptModal';

export default function App() {
  const [view, setView] = useState<ViewType>('vendas');

  // Load estoque from localStorage or default initial set
  const [estoque, setEstoque] = useState<Produto[]>(() => {
    try {
      const salvo = localStorage.getItem('estoque');
      return salvo ? JSON.parse(salvo) : INITIAL_ESTOQUE;
    } catch {
      return INITIAL_ESTOQUE;
    }
  });

  // Load sales history from localStorage or default initial set
  const [historico, setHistorico] = useState<Venda[]>(() => {
    try {
      const salvo = localStorage.getItem('historico_vendas');
      return salvo ? JSON.parse(salvo) : INITIAL_HISTORICO;
    } catch {
      return INITIAL_HISTORICO;
    }
  });

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Completed or selected sale for receipt modal
  const [vendaParaCupom, setVendaParaCupom] = useState<Venda | null>(null);

  // Persist estoque to localStorage
  useEffect(() => {
    localStorage.setItem('estoque', JSON.stringify(estoque));
  }, [estoque]);

  // Persist sales history to localStorage
  useEffect(() => {
    localStorage.setItem('historico_vendas', JSON.stringify(historico));
  }, [historico]);

  // Handle completed sale
  const handleFinalizarVenda = (novaVenda: Venda) => {
    // 1. Deduct quantity from inventory
    setEstoque((prevEstoque) =>
      prevEstoque.map((prod) => {
        const itemVendido = novaVenda.itens.find((i) => i.id === prod.id);
        if (itemVendido) {
          const novaQtd = Math.max(0, prod.qtd - itemVendido.qtd);
          return { ...prod, qtd: novaQtd };
        }
        return prod;
      })
    );

    // 2. Add to sales history
    setHistorico((prev) => [novaVenda, ...prev]);

    // 3. Open receipt modal
    setVendaParaCupom(novaVenda);
  };

  // Inventory Management Handlers
  const handleAddProduto = (novo: Omit<Produto, 'id'>) => {
    const id = Date.now();
    const produto: Produto = { id, ...novo };
    setEstoque((prev) => [produto, ...prev]);
  };

  const handleEditProduto = (produtoAtualizado: Produto) => {
    setEstoque((prev) =>
      prev.map((p) => (p.id === produtoAtualizado.id ? produtoAtualizado : p))
    );
  };

  const handleDeleteProduto = (id: number) => {
    setEstoque((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateQtd = (id: number, delta: number) => {
    setEstoque((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, qtd: Math.max(0, p.qtd + delta) };
        }
        return p;
      })
    );
  };

  const handleExcluirVenda = (id: string) => {
    setHistorico((prev) => prev.filter((v) => v.id !== id));
  };

  // Reset to demo data
  const handleResetData = () => {
    if (confirm('Deseja restaurar os dados iniciais de demonstração do estoque e histórico?')) {
      localStorage.removeItem('estoque');
      localStorage.removeItem('historico_vendas');
      setEstoque(INITIAL_ESTOQUE);
      setHistorico(INITIAL_HISTORICO);
    }
  };

  // Camera scan success handler in Vendas view
  const handleScanSuccessFromModal = (codigoScaneado: string) => {
    setIsScannerOpen(false);
    // Find item and add to cart directly or fill input
    const itemEncontrado = estoque.find(
      (p) => p.codigo.toLowerCase() === codigoScaneado.trim().toLowerCase()
    );

    if (itemEncontrado) {
      // Trigger scan dispatch or switch to sales view if in another tab
      setView('vendas');
      // Pass code via DOM dispatch event or global handler
      const input = document.querySelector('input[placeholder*="Bipe"]') as HTMLInputElement;
      if (input) {
        input.value = codigoScaneado;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        const form = input.closest('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    } else {
      alert(`Produto com código "${codigoScaneado}" não foi encontrado no estoque.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Navigation Top Header */}
      <Navbar
        currentView={view}
        onSelectView={setView}
        estoque={estoque}
        historico={historico}
        onResetData={handleResetData}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'vendas' && (
          <VendasView
            estoque={estoque}
            onFinalizarVenda={handleFinalizarVenda}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {view === 'estoque' && (
          <EstoqueView
            estoque={estoque}
            onAddProduto={handleAddProduto}
            onEditProduto={handleEditProduto}
            onDeleteProduto={handleDeleteProduto}
            onUpdateQtd={handleUpdateQtd}
            onResetData={handleResetData}
          />
        )}

        {view === 'historico' && (
          <HistoricoView
            historico={historico}
            onSelectVendaParaReimprimir={(venda) => setVendaParaCupom(venda)}
            onExcluirVenda={handleExcluirVenda}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print">
        <p>
          MercadoFácil PDV • Sistema de Ponto de Venda & Estoque • Leitor de Código de Barras Integrado
        </p>
      </footer>

      {/* Barcode Camera Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccessFromModal}
      />

      {/* Receipt Printable Modal */}
      <ReceiptModal
        venda={vendaParaCupom}
        onClose={() => setVendaParaCupom(null)}
      />
    </div>
  );
}

import React from 'react';
import { X, Printer, CheckCircle, ShoppingBag } from 'lucide-react';
import { Venda } from '../types';
import { DEFAULT_STORE_SETTINGS } from '../utils/initialData';

interface ReceiptModalProps {
  venda: Venda | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ venda, onClose }) => {
  if (!venda) return null;

  const handlePrint = () => {
    window.print();
  };

  const getNomePagamento = (forma: string) => {
    switch (forma) {
      case 'dinheiro':
        return 'Dinheiro';
      case 'pix':
        return 'PIX';
      case 'credito':
        return 'Cartão de Crédito';
      case 'debito':
        return 'Cartão de Débito';
      default:
        return forma;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 animate-fadeIn">
      {/* Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-slate-100 max-h-[90vh]">
        {/* Header bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wide text-white">Venda Finalizada!</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Content */}
        <div className="p-6 overflow-y-auto bg-slate-50 font-mono text-xs text-slate-800 space-y-4 printable-receipt">
          {/* Header Store Info */}
          <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
            <h2 className="font-bold text-base text-slate-900 font-sans flex items-center justify-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-blue-600 inline" />
              {DEFAULT_STORE_SETTINGS.nomeLoja}
            </h2>
            <p className="text-[11px] text-slate-500">{DEFAULT_STORE_SETTINGS.cnpj}</p>
            <p className="text-[11px] text-slate-500">{DEFAULT_STORE_SETTINGS.endereco}</p>
            <p className="text-[11px] text-slate-500">Tel: {DEFAULT_STORE_SETTINGS.telefone}</p>
          </div>

          {/* Sale details */}
          <div className="flex justify-between text-[11px] text-slate-600 border-b border-dashed border-slate-300 pb-2">
            <div>
              <p><span className="font-semibold">CUPOM:</span> #{venda.id}</p>
              <p><span className="font-semibold">DATA:</span> {new Date(venda.data).toLocaleString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <p className="bg-slate-200 text-slate-800 font-bold px-1.5 py-0.5 rounded uppercase text-[10px] inline-block">
                NÃO FISCAL
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-12 font-bold text-[11px] border-b border-slate-300 pb-1 text-slate-700">
              <span className="col-span-6">ITEM</span>
              <span className="col-span-2 text-center">QTD</span>
              <span className="col-span-4 text-right">TOTAL</span>
            </div>
            {venda.itens.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 text-[11px] py-0.5 border-b border-slate-100">
                <span className="col-span-6 font-semibold truncate pr-1">{item.nome}</span>
                <span className="col-span-2 text-center">{item.qtd}x</span>
                <span className="col-span-4 text-right">
                  R$ {item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-dashed border-slate-300 pt-3 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>R$ {venda.subtotal.toFixed(2)}</span>
            </div>
            {venda.desconto > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Desconto:</span>
                <span>- R$ {venda.desconto.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-300 pt-1.5">
              <span>TOTAL A PAGAR:</span>
              <span className="text-emerald-600">R$ {venda.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment & Change */}
          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px] bg-slate-100/70 p-2.5 rounded-lg">
            <div className="flex justify-between font-semibold">
              <span>Forma de Pagamento:</span>
              <span className="uppercase text-blue-700">{getNomePagamento(venda.formaPagamento)}</span>
            </div>
            {venda.valorPago !== undefined && venda.valorPago > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Valor Recebido:</span>
                <span>R$ {venda.valorPago.toFixed(2)}</span>
              </div>
            )}
            {venda.troco !== undefined && venda.troco > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold text-xs pt-1 border-t border-slate-200">
                <span>TROCO:</span>
                <span>R$ {venda.troco.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Footer message */}
          <div className="text-center pt-2 text-[10px] text-slate-500 border-t border-dashed border-slate-300">
            <p className="font-semibold text-slate-700">{DEFAULT_STORE_SETTINGS.mensagemCupom}</p>
            <p className="mt-1 text-[9px] text-slate-400">Sistema MercadoFácil PDV</p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-100 flex gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition shadow-md"
          >
            <Printer className="w-4 h-4" />
            Imprimir Cupom
          </button>
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-xl text-sm transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

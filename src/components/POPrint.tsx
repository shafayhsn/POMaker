import React from 'react';
import { PurchaseOrder } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { formatCurrency } from '../lib/utils';

export function POPrint({ po, copyType }: { po: PurchaseOrder, copyType: 'Original' | 'Duplicate' | 'Triplicate' }) {
  return (
    <div className="bg-white p-12 max-w-[8.5in] mx-auto text-black font-serif print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold uppercase tracking-tighter">Garment Factory Co.</h1>
          <p className="text-sm">123 Industrial Zone, Sector 4, Dhaka, Bangladesh</p>
          <p className="text-sm">Phone: +880 1234 567890 | Email: sourcing@factory.com</p>
        </div>
        <div className="text-right space-y-1">
          <h2 className="text-2xl font-bold uppercase">Purchase Order</h2>
          <p className="text-lg font-bold font-mono">{po.poNumber}</p>
          <div className="inline-block border border-black px-3 py-1 mt-2 font-bold uppercase">
            {copyType} Copy
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-8 py-8 border-b border-black">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase">Supplier:</p>
            <p className="text-lg font-bold">{po.supplierId}</p>
            <p className="text-sm text-gray-600 italic">Approved Vendor</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase">Job Number:</p>
              <p className="font-bold">{po.jobId}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase">Issue Date:</p>
              <p>{format(new Date(po.issueDate), 'dd/MM/yyyy')}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase">Delivery Date:</p>
              <p className="font-bold">{format(new Date(po.deliveryDate), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase">Delivery Place:</p>
              <p>{po.deliveryPlace}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase">Revision No:</p>
            <p>{po.revisionNumber}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mt-8 border-collapse border border-black">
        <thead>
          <tr className="bg-gray-100 uppercase text-xs font-bold">
            <th className="border border-black px-2 py-2 text-left">Item</th>
            <th className="border border-black px-2 py-2 text-left">Description</th>
            <th className="border border-black px-2 py-2 text-center">Unit</th>
            <th className="border border-black px-2 py-2 text-right">Qty</th>
            <th className="border border-black px-2 py-2 text-right">Rate</th>
            <th className="border border-black px-2 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {po.items.map((item) => (
            <tr key={item.id} className="text-sm">
              <td className="border border-black px-2 py-2 font-bold">{item.item}</td>
              <td className="border border-black px-2 py-2">{item.description}</td>
              <td className="border border-black px-2 py-2 text-center">{item.unit}</td>
              <td className="border border-black px-2 py-2 text-right">{item.qty}</td>
              <td className="border border-black px-2 py-2 text-right">{formatCurrency(item.rate, po.currency)}</td>
              <td className="border border-black px-2 py-2 text-right font-bold">{formatCurrency(item.amount, po.currency)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td colSpan={5} className="border border-black px-2 py-2 text-right uppercase">Total Amount</td>
            <td className="border border-black px-2 py-2 text-right">{formatCurrency(po.totalAmount, po.currency)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Footer / Verification */}
      <div className="mt-12 grid grid-cols-3 gap-8 items-end">
        <div className="space-y-4">
          <div className="p-2 border border-black inline-block">
            <QRCodeSVG value={`https://po-maker.app/verify/${po.verificationCode}`} size={100} />
          </div>
          <p className="text-[10px] uppercase font-bold">
            Verify at: po-maker.app/verify<br/>
            Code: {po.verificationCode}
          </p>
        </div>
        <div className="text-center space-y-8">
          <div className="border-t border-black pt-2">
            <p className="text-xs font-bold uppercase">Prepared By</p>
          </div>
        </div>
        <div className="text-center space-y-8">
          <div className="border-t border-black pt-2">
            <p className="text-xs font-bold uppercase">Authorized Signature</p>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="mt-12 text-[10px] space-y-2 border-t border-black pt-4">
        <p className="font-bold uppercase">Terms & Conditions:</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Goods must be delivered as per the specified delivery date.</li>
          <li>Quality must match the approved sample/specification.</li>
          <li>This PO is valid only with a unique system-generated verification code.</li>
          <li>Any discrepancy must be reported within 24 hours of receipt.</li>
        </ol>
      </div>

      {/* Watermark for non-approved */}
      {po.status !== 'approved' && po.status !== 'issued' && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] rotate-45">
          <p className="text-[120px] font-bold uppercase">{po.status}</p>
        </div>
      )}
    </div>
  );
}

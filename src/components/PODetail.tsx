import React from 'react';
import { PurchaseOrder } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { formatCurrency, cn } from '../lib/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ChevronLeft, Printer, History, ShieldCheck, ExternalLink } from 'lucide-react';

export function PODetail({ po, onBack, onPrint }: { po: PurchaseOrder, onBack: () => void, onPrint: () => void }) {
  return (
    <div className="space-y-8 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-0.5">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{po.poNumber}</h2>
              <Badge variant="secondary" className={cn(
                "text-[10px] uppercase font-bold border",
                po.status === 'approved' ? "bg-green-50 text-green-700 border-green-100" :
                po.status === 'draft' ? "bg-gray-50 text-gray-600 border-gray-100" :
                "bg-yellow-50 text-yellow-700 border-yellow-100"
              )}>
                {po.status}
              </Badge>
            </div>
            <p className="text-[13px] text-[#6B6B6B]">Verification Code: <span className="font-mono font-bold text-black">{po.verificationCode}</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 h-9 border-[#E5E5E5] bg-white">
            <History className="w-4 h-4" />
            <span>History</span>
          </Button>
          <Button onClick={onPrint} className="gap-2 h-9 bg-black text-white hover:bg-black/90">
            <Printer className="w-4 h-4" />
            <span>Print PO</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border shadow-none bg-[#FBFBFA]">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-[#9B9B9B] uppercase tracking-wider">Supplier</p>
                  <p className="text-[15px] font-semibold">{po.supplierId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-[#9B9B9B] uppercase tracking-wider">Job / Style</p>
                  <p className="text-[15px] font-semibold">{po.jobId}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-none bg-[#FBFBFA]">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-[#9B9B9B] uppercase tracking-wider">Issue Date</p>
                  <p className="text-[15px] font-semibold">{format(new Date(po.issueDate), 'MMMM dd, yyyy')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-[#9B9B9B] uppercase tracking-wider">Delivery Date</p>
                  <p className="text-[15px] font-semibold">{format(new Date(po.deliveryDate), 'MMMM dd, yyyy')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-[#FBFBFA]">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] h-10">Item</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] h-10">Description</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] h-10 text-right">Qty</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] h-10 text-right">Rate</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] h-10 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {po.items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-transparent">
                    <TableCell className="font-semibold text-[14px] py-4">{item.item}</TableCell>
                    <TableCell className="text-[13px] py-4 text-[#6B6B6B]">{item.description}</TableCell>
                    <TableCell className="text-[13px] py-4 text-right">{item.qty} {item.unit}</TableCell>
                    <TableCell className="text-[13px] py-4 text-right font-mono">{formatCurrency(item.rate, po.currency)}</TableCell>
                    <TableCell className="text-[14px] font-bold py-4 text-right font-mono">{formatCurrency(item.amount, po.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <tfoot className="bg-[#FBFBFA] border-t">
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="text-right py-4 text-[13px] font-bold uppercase text-[#9B9B9B]">Total Amount</TableCell>
                  <TableCell className="text-right py-4 text-[18px] font-bold font-mono">{formatCurrency(po.totalAmount, po.currency)}</TableCell>
                </TableRow>
              </tfoot>
            </Table>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border shadow-none bg-[#FBFBFA]">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                Security Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-white border rounded-xl shadow-sm">
                <QRCodeSVG value={`https://po-maker.app/verify/${po.verificationCode}`} size={140} />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-[#9B9B9B] uppercase font-bold tracking-wider">Scan to Verify</p>
                <Button variant="link" size="sm" className="text-[12px] h-auto p-0 gap-1 text-blue-600">
                  Open Verification Page
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-none bg-[#FBFBFA]">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[14px] font-semibold">Audit Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-medium">PO Created</p>
                    <p className="text-[11px] text-[#6B6B6B]">{format(new Date(po.issueDate), 'MMM dd, HH:mm')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-medium">Print Logged</p>
                    <p className="text-[11px] text-[#6B6B6B]">{po.printCount} times printed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


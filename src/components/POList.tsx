import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { PurchaseOrder } from '../types';
import { format } from 'date-fns';
import { formatCurrency, cn } from '../lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';

export function POList({ onSelect }: { onSelect: (po: PurchaseOrder) => void }) {
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'purchaseOrders'), orderBy('poNumber', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const poData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseOrder));
      setPOs(poData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'purchaseOrders');
    });

    return () => unsubscribe();
  }, []);

  const filteredPOs = pos.filter(po => 
    po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    po.supplierId.toLowerCase().includes(search.toLowerCase()) ||
    po.jobId.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="py-20 text-center text-muted-foreground">Loading purchase orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Purchase Orders</h2>
          <p className="text-[13px] text-[#6B6B6B]">Manage and track all issued purchase orders.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9B9B]" />
            <Input 
              placeholder="Search POs, suppliers..." 
              className="pl-9 w-[300px] bg-[#FBFBFA] border-none focus-visible:ring-1 focus-visible:ring-black"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="bg-white border-[#E5E5E5]">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#FBFBFA]">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] h-10">PO Number</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] h-10">Job / Style</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] h-10">Supplier</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] h-10">Issue Date</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] h-10 text-right">Amount</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] h-10">Status</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] h-10 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPOs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-[#9B9B9B]">
                  No purchase orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPOs.map((po) => (
                <TableRow 
                  key={po.id} 
                  className="cursor-pointer hover:bg-[#FBFBFA] transition-colors group"
                  onClick={() => onSelect(po)}
                >
                  <TableCell className="font-semibold text-[14px] py-4">{po.poNumber}</TableCell>
                  <TableCell className="text-[13px] py-4">{po.jobId}</TableCell>
                  <TableCell className="text-[13px] py-4">{po.supplierId}</TableCell>
                  <TableCell className="text-[13px] py-4 text-[#6B6B6B]">{format(new Date(po.issueDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="text-[14px] font-bold py-4 text-right font-mono">{formatCurrency(po.totalAmount, po.currency)}</TableCell>
                  <TableCell className="py-4">
                    <Badge variant="secondary" className={cn(
                      "text-[10px] uppercase font-bold border",
                      po.status === 'approved' ? "bg-green-50 text-green-700 border-green-100" :
                      po.status === 'draft' ? "bg-gray-50 text-gray-600 border-gray-100" :
                      po.status === 'submitted' ? "bg-blue-50 text-blue-700 border-blue-100" :
                      "bg-yellow-50 text-yellow-700 border-yellow-100"
                    )}>
                      {po.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


export const money = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

export function nextPoNo(pos) {
  const currentYear = new Date().getFullYear();
  const last = pos
    .map(p => p.poNo)
    .filter(Boolean)
    .map(po => {
      const m = String(po).match(/PO-(\d{4})-(\d+)/);
      return m && Number(m[1]) === currentYear ? Number(m[2]) : 0;
    })
    .sort((a,b) => b-a)[0] || 0;
  return `PO-${currentYear}-${String(last + 1).padStart(5, '0')}`;
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyLine() {
  return { lineId: uid(), itemId: "", itemName: "", description: "", uom: "", qty: "", rate: "", amount: 0 };
}

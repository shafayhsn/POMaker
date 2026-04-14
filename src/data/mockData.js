export const currentUser = {
  name: 'Shaf R.',
  role: 'Merchandiser',
}

export const stats = [
  { label: 'Draft POs', value: '14', hint: 'Awaiting Director action' },
  { label: 'Issued This Month', value: '128', hint: 'System-generated only' },
  { label: 'Pending Approval', value: '7', hint: 'Masked suppliers' },
  { label: 'Reprint Alerts', value: '2', hint: 'Needs audit review' },
]

export const suppliers = [
  { id: 1, code: 'SUP-001', name: 'Fallon Denim', category: 'Denim Fabric', creditDays: 90, active: true },
  { id: 2, code: 'SUP-002', name: 'YKK Pakistan', category: 'Zipper', creditDays: 60, active: true },
  { id: 3, code: 'SUP-003', name: 'Lucky Thread House', category: 'Sewing Thread', creditDays: 45, active: true },
]

export const jobs = [
  { id: 1, jobNo: 'JB-24031', buyer: 'Zara', style: 'Relaxed Taper', merchandiser: 'Areeb', status: 'Active', budget: 'PKR 18,500,000' },
  { id: 2, jobNo: 'JB-24044', buyer: 'Bershka', style: 'Baggy Utility', merchandiser: 'Shaf', status: 'Active', budget: 'PKR 11,800,000' },
  { id: 3, jobNo: 'JB-24052', buyer: 'Mango', style: 'Slim Carpenter', merchandiser: 'Umair', status: 'Planning', budget: 'PKR 9,200,000' },
]

export const libraryItems = [
  {
    id: 1,
    code: 'FAB-POLYCOT-310-EXP',
    category: 'Fabric',
    genericName: 'Poly Cotton Stretch',
    description: '310 GSM before wash, width 64”–65”, export standard finishing',
    unit: 'Meter',
    lastRate: 'PKR 510',
  },
  {
    id: 2,
    code: 'ZIP-08-BLK',
    category: 'Zipper',
    genericName: 'No. 8 Black Zipper',
    description: 'Nickel finish, matte tape, garment export quality',
    unit: 'Piece',
    lastRate: 'PKR 78',
  },
  {
    id: 3,
    code: 'THR-CORESPUN-20',
    category: 'Sewing Thread',
    genericName: 'Core Spun Thread 20s',
    description: 'High strength thread for denim sewing operations',
    unit: 'Cone',
    lastRate: 'PKR 1,120',
  },
]

export const purchaseOrders = [
  {
    id: 1,
    poNo: 'DRAFT',
    revision: 'R0',
    issueDate: '2026-04-11',
    supplierName: 'Fallon Denim',
    supplierMasked: '*******',
    jobNo: 'JB-24044',
    department: 'Fabric Store',
    total: 'PKR 102,000',
    status: 'Draft',
    createdBy: 'Shaf R.',
    approvedBy: '—',
    printCount: 0,
    verificationCode: 'NA-DRAFT-001',
    lines: [
      {
        item: 'Poly Cotton Stretch',
        description: '310 GSM before wash, width 64”-65”, blue with white / black with black',
        unit: 'Meters',
        qty: 200,
        rate: 510,
      },
    ],
  },
  {
    id: 2,
    poNo: '1054',
    revision: 'R1',
    issueDate: '2026-04-10',
    supplierName: 'YKK Pakistan',
    supplierMasked: 'YKK Pakistan',
    jobNo: 'JB-24031',
    department: 'Trims',
    total: 'PKR 468,000',
    status: 'Issued',
    createdBy: 'Areeb',
    approvedBy: 'Director Salman',
    printCount: 1,
    verificationCode: 'NA-1054-R1-H3Q8K',
    lines: [
      {
        item: 'No. 8 Black Zipper',
        description: 'Nickel finish zipper for denim utility program',
        unit: 'Pieces',
        qty: 6000,
        rate: 78,
      },
    ],
  },
  {
    id: 3,
    poNo: '1055',
    revision: 'R1',
    issueDate: '2026-04-12',
    supplierName: 'Lucky Thread House',
    supplierMasked: '*******',
    jobNo: 'JB-24052',
    department: 'Sewing',
    total: 'PKR 112,000',
    status: 'Submitted',
    createdBy: 'Umair',
    approvedBy: '—',
    printCount: 0,
    verificationCode: 'NA-SUB-003',
    lines: [
      {
        item: 'Core Spun Thread 20s',
        description: 'High strength thread for inseam and outseam',
        unit: 'Cones',
        qty: 100,
        rate: 1120,
      },
    ],
  },
]

export const approvalChecks = [
  'Supplier remains masked until Director approval.',
  'No PO number exists while status is Draft or Submitted.',
  'Backend must block print/export on Draft and Submitted.',
  'Director can unmask supplier, approve, issue, and lock the PO.',
]

export const appSettings = {
  companyName: 'Nizamia Apparels',
  visibleFormat: '4-digit sequence',
  generalPaymentTerms: '90 days',
  defaultDepartment: 'Fabric Store',
  copyTypes: ['Original', 'Duplicate', 'Triplicate'],
}

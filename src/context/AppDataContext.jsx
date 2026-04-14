import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'po-maker-control-system'

const defaultState = {
  currentUser: { name: 'Shaf R.', role: 'Merchandiser' },
  suppliers: [],
  jobs: [],
  libraryItems: [],
  purchaseOrders: [],
  appSettings: {
    companyName: 'Nizamia Apparels',
    visibleFormat: '4-digit sequence',
    generalPaymentTerms: '90 days',
    defaultDepartment: 'General',
    copyTypes: ['Original', 'Duplicate', 'Triplicate'],
  },
}

const AppDataContext = createContext(null)

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function getStoredState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState
  } catch {
    return defaultState
  }
}

function nextVisiblePoNo(purchaseOrders) {
  const max = purchaseOrders.reduce((highest, po) => {
    const value = Number(po.poNo)
    return Number.isFinite(value) ? Math.max(highest, value) : highest
  }, 0)
  return String(max + 1).padStart(4, '0')
}

function calcGrandTotal(lines) {
  return lines.reduce((sum, line) => sum + Number(line.qty || 0) * Number(line.rate || 0), 0)
}

function buildVerificationCode(poNo, revision = 'R1') {
  const token = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `NA-${poNo}-${revision}-${token}`
}

export function AppDataProvider({ children }) {
  const [state, setState] = useState(defaultState)

  useEffect(() => {
    setState(getStoredState())
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const actions = useMemo(() => ({
    resetAllData() {
      setState(defaultState)
    },
    addSupplier(payload) {
      setState((current) => ({
        ...current,
        suppliers: [
          {
            id: generateId('sup'),
            code: payload.code,
            name: payload.name,
            category: payload.category,
            creditDays: payload.creditDays,
            active: true,
          },
          ...current.suppliers,
        ],
      }))
    },
    addJob(payload) {
      setState((current) => ({
        ...current,
        jobs: [
          {
            id: generateId('job'),
            jobNo: payload.jobNo,
            buyer: payload.buyer,
            style: payload.style,
            merchandiser: payload.merchandiser,
            budget: payload.budget,
            status: payload.status,
          },
          ...current.jobs,
        ],
      }))
    },
    addLibraryItem(payload) {
      setState((current) => ({
        ...current,
        libraryItems: [
          {
            id: generateId('lib'),
            code: payload.code,
            category: payload.category,
            genericName: payload.genericName,
            description: payload.description,
            unit: payload.unit,
            lastRate: payload.lastRate,
          },
          ...current.libraryItems,
        ],
      }))
    },
    createDraftPO(payload) {
      const total = calcGrandTotal(payload.lines)
      setState((current) => ({
        ...current,
        purchaseOrders: [
          {
            id: generateId('po'),
            poNo: 'DRAFT',
            revision: 'R0',
            issueDate: payload.issueDate,
            supplierName: payload.supplierName,
            supplierMasked: '*******',
            jobNo: payload.jobNo,
            department: payload.department,
            total,
            status: 'Draft',
            createdBy: current.currentUser.name,
            approvedBy: '—',
            printCount: 0,
            verificationCode: `NA-DRAFT-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            notes: payload.notes,
            lines: payload.lines,
          },
          ...current.purchaseOrders,
        ],
      }))
    },
    submitDraft(poId) {
      setState((current) => ({
        ...current,
        purchaseOrders: current.purchaseOrders.map((po) =>
          po.id === poId && po.status === 'Draft' ? { ...po, status: 'Submitted' } : po,
        ),
      }))
    },
    approvePO(poId) {
      setState((current) => ({
        ...current,
        purchaseOrders: current.purchaseOrders.map((po) => {
          if (po.id !== poId) return po
          const newPoNo = nextVisiblePoNo(current.purchaseOrders)
          return {
            ...po,
            poNo: newPoNo,
            revision: 'R1',
            status: 'Issued',
            approvedBy: 'Director Salman',
            supplierMasked: po.supplierName,
            verificationCode: buildVerificationCode(newPoNo),
          }
        }),
      }))
    },
    rejectPO(poId) {
      setState((current) => ({
        ...current,
        purchaseOrders: current.purchaseOrders.map((po) =>
          po.id === poId ? { ...po, status: 'Cancelled' } : po,
        ),
      }))
    },
    printPO(poId) {
      setState((current) => ({
        ...current,
        purchaseOrders: current.purchaseOrders.map((po) =>
          po.id === poId && po.status === 'Issued'
            ? { ...po, printCount: Number(po.printCount || 0) + 1 }
            : po,
        ),
      }))
    },
  }), [])

  return <AppDataContext.Provider value={{ ...state, actions }}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) throw new Error('useAppData must be used within AppDataProvider')
  return context
}

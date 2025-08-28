// File: src/pages/PMS/Accounting.jsx
import React, { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

/**
 * Simple, dependency-free Card components (so you don't need "@/components/...").
 */
function Card({ className = "", children }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}
function CardHeader({ title, subtitle, right }) {
  return (
    <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
function CardBody({ className = "", children }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
function Badge({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-200">
      {children}
    </span>
  );
}

/** Color palette for charts */
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16"];

/** ---------------------------
 *  MAIN ACCOUNTING MODULE
 *  --------------------------- */
export default function Accounting() {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "gl", label: "General Ledger" },
    { id: "ar", label: "Accounts Receivable" },
    { id: "ap", label: "Accounts Payable" },
    { id: "cashbank", label: "Cash & Bank" },
    { id: "revenue", label: "Revenue" },
    { id: "tax", label: "Taxation (GST/TDS)" },
    { id: "coa", label: "Chart of Accounts" },
    { id: "journals", label: "Journal Entries" },
    { id: "cost", label: "Cost Centers" },
    { id: "budget", label: "Budgeting & Forecasting" },
    { id: "assets", label: "Fixed Assets" },
    { id: "payroll", label: "Payroll & HR" },
    { id: "reports", label: "Reports & Audits" },
    { id: "integrations", label: "Integrations & Export" },
  ];

  const [active, setActive] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <Card className="mb-6">
        <CardBody className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounting</h1>
            <p className="text-gray-500 text-sm">
              PMS Accounting Suite — demo frontend (no backend required)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>Demo Mode</Badge>
            <Badge>Read-only</Badge>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
              active === t.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 hover:bg-blue-50 border-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {active === "dashboard" && <Dashboard />}
        {active === "gl" && <GeneralLedger />}
        {active === "ar" && <AccountsReceivable />}
        {active === "ap" && <AccountsPayable />}
        {active === "cashbank" && <CashBank />}
        {active === "revenue" && <Revenue />}
        {active === "tax" && <Taxation />}
        {active === "coa" && <ChartOfAccounts />}
        {active === "journals" && <JournalEntries />}
        {active === "cost" && <CostCenters />}
        {active === "budget" && <Budgeting />}
        {active === "assets" && <FixedAssets />}
        {active === "payroll" && <Payroll />}
        {active === "reports" && <ReportsAudits />}
        {active === "integrations" && <IntegrationsExport />}
      </div>
    </div>
  );
}

/** --------------------------------
 *  DASHBOARD
 *  -------------------------------- */
function Dashboard() {
  const revenueSplit = useMemo(
    () => [
      { name: "Rooms", value: 520000 },
      { name: "F&B", value: 210000 },
      { name: "Spa", value: 65000 },
      { name: "Events", value: 120000 },
      { name: "Other", value: 35000 },
    ],
    []
  );

  const expenses = useMemo(
    () => [
      { category: "Salaries", amount: 260000 },
      { category: "Utilities", amount: 52000 },
      { category: "Maintenance", amount: 38000 },
      { category: "Supplies", amount: 24000 },
      { category: "Marketing", amount: 18000 },
    ],
    []
  );

  const monthlyPnL = useMemo(
    () => [
      { month: "Jan", revenue: 720000, expense: 380000 },
      { month: "Feb", revenue: 690000, expense: 360000 },
      { month: "Mar", revenue: 740000, expense: 410000 },
      { month: "Apr", revenue: 780000, expense: 420000 },
      { month: "May", revenue: 820000, expense: 450000 },
      { month: "Jun", revenue: 790000, expense: 430000 },
    ],
    []
  );

  const totalRevenue = revenueSplit.reduce((a, b) => a + b.value, 0);
  const totalExpense = expenses.reduce((a, b) => a + b.amount, 0);
  const profit = totalRevenue - totalExpense;

  return (
    <>
      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI title="MTD Revenue" value={formatCurrency(totalRevenue)} />
        <KPI title="MTD Expense" value={formatCurrency(totalExpense)} />
        <KPI title="MTD Profit" value={formatCurrency(profit)} positive={profit >= 0} />
        <KPI title="AR Outstanding" value={formatCurrency(415000)} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Revenue Distribution" subtitle="By department" />
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenueSplit} dataKey="value" nameKey="name" label outerRadius={100}>
                  {revenueSplit.map((e, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Expense Breakdown" subtitle="Top categories" />
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Monthly P&L Trend" subtitle="Last 6 months" />
          <CardBody className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyPnL}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" />
                <Line type="monotone" dataKey="expense" />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function KPI({ title, value, positive = true }) {
  return (
    <Card>
      <CardBody>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-2xl font-semibold ${positive ? "text-emerald-600" : "text-rose-600"}`}>
          {value}
        </p>
      </CardBody>
    </Card>
  );
}

/** --------------------------------
 *  GENERAL LEDGER
 *  -------------------------------- */
function GeneralLedger() {
  const [filter, setFilter] = useState({ from: "", to: "", account: "" });
  const entries = [
    { date: "2025-06-01", account: "Room Revenue", debit: 0, credit: 120000, memo: "Folio close" },
    { date: "2025-06-01", account: "CGST Payable", debit: 0, credit: 10800, memo: "GST auto" },
    { date: "2025-06-02", account: "Cash", debit: 30000, credit: 0, memo: "Receipt #R-1021" },
    { date: "2025-06-02", account: "AR - Corporate", debit: 0, credit: 30000, memo: "Receipt applied" },
    { date: "2025-06-03", account: "Salaries Expense", debit: 210000, credit: 0, memo: "Payroll" },
  ];

  const filtered = entries.filter((e) => {
    const okAcc = !filter.account || e.account.toLowerCase().includes(filter.account.toLowerCase());
    const okFrom = !filter.from || new Date(e.date) >= new Date(filter.from);
    const okTo = !filter.to || new Date(e.date) <= new Date(filter.to);
    return okAcc && okFrom && okTo;
  });

  const totals = filtered.reduce(
    (a, b) => ({ debit: a.debit + b.debit, credit: a.credit + b.credit }),
    { debit: 0, credit: 0 }
  );

  return (
    <>
      <Card>
        <CardHeader title="Trial Balance Snapshot" />
        <CardBody>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI title="Total Debits" value={formatCurrency(totals.debit)} />
            <KPI title="Total Credits" value={formatCurrency(totals.credit)} />
            <KPI title="Balance (D-C)" value={formatCurrency(totals.debit - totals.credit)} />
            <KPI title="Ledger Count" value={String(42)} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Ledger Entries"
          right={
            <div className="flex gap-2">
              <input
                className="border rounded-lg px-3 py-1.5 text-sm"
                type="date"
                value={filter.from}
                onChange={(e) => setFilter((p) => ({ ...p, from: e.target.value }))}
              />
              <input
                className="border rounded-lg px-3 py-1.5 text-sm"
                type="date"
                value={filter.to}
                onChange={(e) => setFilter((p) => ({ ...p, to: e.target.value }))}
              />
              <input
                className="border rounded-lg px-3 py-1.5 text-sm"
                placeholder="Search account…"
                value={filter.account}
                onChange={(e) => setFilter((p) => ({ ...p, account: e.target.value }))}
              />
            </div>
          }
        />
        <CardBody className="overflow-auto">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Date", "Account", "Memo", "Debit", "Credit"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 border-b text-gray-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-b">{r.date}</td>
                  <td className="px-3 py-2 border-b">{r.account}</td>
                  <td className="px-3 py-2 border-b">{r.memo}</td>
                  <td className="px-3 py-2 border-b">{formatCurrency(r.debit)}</td>
                  <td className="px-3 py-2 border-b">{formatCurrency(r.credit)}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td className="px-3 py-3 text-center" colSpan={5}>
                    No entries
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-medium">
                <td className="px-3 py-2 border-t" colSpan={3}>
                  Totals
                </td>
                <td className="px-3 py-2 border-t">{formatCurrency(totals.debit)}</td>
                <td className="px-3 py-2 border-t">{formatCurrency(totals.credit)}</td>
              </tr>
            </tfoot>
          </table>
        </CardBody>
      </Card>
    </>
  );
}

/** --------------------------------
 *  ACCOUNTS RECEIVABLE (AR)
 *  -------------------------------- */
function AccountsReceivable() {
  const invoices = [
    { no: "INV-1001", date: "2025-06-03", customer: "Acme Corp", amount: 84000, tax: 7560, status: "Overdue", due: "2025-06-10" },
    { no: "INV-1002", date: "2025-06-05", customer: "Orbit Travels", amount: 54000, tax: 4860, status: "Partially Received", due: "2025-06-12" },
    { no: "INV-1003", date: "2025-06-07", customer: "Mr. Sharma", amount: 12000, tax: 1080, status: "Paid", due: "2025-06-07" },
  ];
  const aging = [
    { bucket: "0–30", amount: 210000 },
    { bucket: "31–60", amount: 125000 },
    { bucket: "61–90", amount: 54000 },
    { bucket: "90+", amount: 26000 },
  ];

  return (
    <>
      <Card>
        <CardHeader title="AR Aging" subtitle="Outstanding by bucket" />
        <CardBody className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aging}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Invoices" right={<button className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">+ New Invoice</button>} />
        <CardBody className="overflow-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Invoice #", "Date", "Customer", "Amount", "Tax", "Total", "Due", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 border-b text-gray-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((r) => {
                const total = r.amount + r.tax;
                return (
                  <tr key={r.no} className="odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-2 border-b font-medium">{r.no}</td>
                    <td className="px-3 py-2 border-b">{r.date}</td>
                    <td className="px-3 py-2 border-b">{r.customer}</td>
                    <td className="px-3 py-2 border-b">{formatCurrency(r.amount)}</td>
                    <td className="px-3 py-2 border-b">{formatCurrency(r.tax)}</td>
                    <td className="px-3 py-2 border-b">{formatCurrency(total)}</td>
                    <td className="px-3 py-2 border-b">{r.due}</td>
                    <td className="px-3 py-2 border-b">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-3 py-2 border-b">
                      <div className="flex gap-2">
                        <button className="px-2 py-1 border rounded hover:bg-gray-50">View</button>
                        <button className="px-2 py-1 border rounded hover:bg-gray-50">Receipt</button>
                        <button className="px-2 py-1 border rounded hover:bg-gray-50">PDF</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </>
  );
}

/** --------------------------------
 *  ACCOUNTS PAYABLE (AP)
 *  -------------------------------- */
function AccountsPayable() {
  const bills = [
    { no: "BILL-7001", vendor: "FreshFoods Pvt Ltd", date: "2025-06-04", due: "2025-06-14", amount: 38000, tds: 0, status: "Pending" },
    { no: "BILL-7002", vendor: "City Utilities", date: "2025-06-03", due: "2025-06-10", amount: 52000, tds: 0, status: "Overdue" },
    { no: "BILL-7003", vendor: "AC Service Co.", date: "2025-06-07", due: "2025-06-20", amount: 24000, tds: 1200, status: "Scheduled" },
  ];

  return (
    <>
      <Card>
        <CardHeader title="Vendor Bills" right={<button className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">+ Add Bill</button>} />
        <CardBody className="overflow-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Bill #", "Vendor", "Date", "Due", "Amount", "TDS", "Net Payable", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 border-b text-gray-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bills.map((r) => {
                const net = r.amount - r.tds;
                return (
                  <tr key={r.no} className="odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-2 border-b font-medium">{r.no}</td>
                    <td className="px-3 py-2 border-b">{r.vendor}</td>
                    <td className="px-3 py-2 border-b">{r.date}</td>
                    <td className="px-3 py-2 border-b">{r.due}</td>
                    <td className="px-3 py-2 border-b">{formatCurrency(r.amount)}</td>
                    <td className="px-3 py-2 border-b">{formatCurrency(r.tds)}</td>
                    <td className="px-3 py-2 border-b">{formatCurrency(net)}</td>
                    <td className="px-3 py-2 border-b">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-3 py-2 border-b">
                      <div className="flex gap-2">
                        <button className="px-2 py-1 border rounded hover:bg-gray-50">Schedule</button>
                        <button className="px-2 py-1 border rounded hover:bg-gray-50">Pay</button>
                        <button className="px-2 py-1 border rounded hover:bg-gray-50">Debit Note</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </>
  );
}

/** --------------------------------
 *  CASH & BANK
 *  -------------------------------- */
function CashBank() {
  const cashbook = [
    { date: "2025-06-05", ref: "PET-0012", memo: "Petty cash for supplies", debit: 2000, credit: 0, balance: 12000 },
    { date: "2025-06-06", ref: "DEP-0033", memo: "POS settlement", debit: 0, credit: 15000, balance: 27000 },
  ];

  return (
    <>
      <Card>
        <CardHeader title="Cash Book" right={<button className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">+ Add Entry</button>} />
        <CardBody className="overflow-auto">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Date", "Ref", "Memo", "Debit", "Credit", "Balance"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 border-b text-gray-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cashbook.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-b">{r.date}</td>
                  <td className="px-3 py-2 border-b">{r.ref}</td>
                  <td className="px-3 py-2 border-b">{r.memo}</td>
                  <td className="px-3 py-2 border-b">{formatCurrency(r.debit)}</td>
                  <td className="px-3 py-2 border-b">{formatCurrency(r.credit)}</td>
                  <td className="px-3 py-2 border-b">{formatCurrency(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Bank Reconciliation" subtitle="Upload statement & match" />
        <CardBody>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Bank Account</label>
              <select className="border w-full rounded-lg p-2">
                <option>HDFC – 1234</option>
                <option>ICICI – 9988</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Upload Statement (CSV/XLS)</label>
              <input className="border w-full rounded-lg p-2" type="file" />
            </div>
          </div>
          <div className="mt-4">
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">Auto Reconcile</button>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

/** --------------------------------
 *  REVENUE
 *  -------------------------------- */
function Revenue() {
  const rows = [
    { date: "2025-06-06", dept: "Rooms", desc: "Room Nights", amount: 120000, tax: 10800 },
    { date: "2025-06-06", dept: "F&B", desc: "Restaurant", amount: 48000, tax: 4320 },
    { date: "2025-06-06", dept: "Spa", desc: "Therapy", amount: 9000, tax: 810 },
    { date: "2025-06-06", dept: "Other", desc: "Laundry", amount: 3500, tax: 315 },
  ];
  return (
    <Card>
      <CardHeader title="Daily Revenue Report" subtitle="Auto-posted to GL" />
      <CardBody className="overflow-auto">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Date", "Department", "Description", "Amount", "Tax", "Total"].map((h) => (
                <th key={h} className="text-left px-3 py-2 border-b text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 border-b">{r.date}</td>
                <td className="px-3 py-2 border-b">{r.dept}</td>
                <td className="px-3 py-2 border-b">{r.desc}</td>
                <td className="px-3 py-2 border-b">{formatCurrency(r.amount)}</td>
                <td className="px-3 py-2 border-b">{formatCurrency(r.tax)}</td>
                <td className="px-3 py-2 border-b">{formatCurrency(r.amount + r.tax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}

/** --------------------------------
 *  TAXATION
 *  -------------------------------- */
function Taxation() {
  const gstSummary = [
    { slab: "0%", taxable: 12000, tax: 0 },
    { slab: "12%", taxable: 180000, tax: 21600 },
    { slab: "18%", taxable: 240000, tax: 43200 },
    { slab: "28%", taxable: 80000, tax: 22400 },
  ];
  const tds = [
    { section: "194C", base: 120000, tds: 2400 },
    { section: "194J", base: 80000, tds: 8000 },
  ];

  return (
    <>
      <Card>
        <CardHeader title="GST Summary (GSTR-1/3B Ready)" />
        <CardBody className="overflow-auto">
          <table className="min-w-[700px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Slab", "Taxable Value", "GST"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 border-b text-gray-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gstSummary.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-b">{r.slab}</td>
                  <td className="px-3 py-2 border-b">{formatCurrency(r.taxable)}</td>
                  <td className="px-3 py-2 border-b">{formatCurrency(r.tax)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex gap-2">
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">Export GSTR-1</button>
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">Export GSTR-3B</button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="TDS/TCS Compliance" />
        <CardBody className="overflow-auto">
          <table className="min-w-[700px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Section", "Base Amount", "TDS Amount"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 border-b text-gray-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tds.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-b">{r.section}</td>
                  <td className="px-3 py-2 border-b">{formatCurrency(r.base)}</td>
                  <td className="px-3 py-2 border-b">{formatCurrency(r.tds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </>
  );
}

/** --------------------------------
 *  CHART OF ACCOUNTS
 *  -------------------------------- */
function ChartOfAccounts() {
  const accounts = [
    { code: "1000", name: "Assets", type: "Header" },
    { code: "1010", name: "Cash", type: "Asset" },
    { code: "1020", name: "Bank", type: "Asset" },
    { code: "2000", name: "Liabilities", type: "Header" },
    { code: "2100", name: "GST Payable", type: "Liability" },
    { code: "3000", name: "Income", type: "Header" },
    { code: "3100", name: "Room Revenue", type: "Income" },
    { code: "3200", name: "F&B Revenue", type: "Income" },
    { code: "4000", name: "Expenses", type: "Header" },
    { code: "4100", name: "Salaries", type: "Expense" },
  ];

  return (
    <Card>
      <CardHeader title="Chart of Accounts" right={<button className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">+ Add Account</button>} />
      <CardBody className="overflow-auto">
        <table className="min-w-[700px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Code", "Account Name", "Type", "Actions"].map((h) => (
                <th key={h} className="text-left px-3 py-2 border-b text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accounts.map((r) => (
              <tr key={r.code} className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 border-b font-mono">{r.code}</td>
                <td className="px-3 py-2 border-b">{r.name}</td>
                <td className="px-3 py-2 border-b">{r.type}</td>
                <td className="px-3 py-2 border-b">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 border rounded hover:bg-gray-50">Edit</button>
                    <button className="px-2 py-1 border rounded hover:bg-gray-50">Deactivate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}

/** --------------------------------
 *  JOURNAL ENTRIES
 *  -------------------------------- */
function JournalEntries() {
  const [rows, setRows] = useState([
    { account: "Cash", debit: 0, credit: 0, memo: "" },
    { account: "Room Revenue", debit: 0, credit: 0, memo: "" },
  ]);

  const totalDebit = rows.reduce((a, b) => a + Number(b.debit || 0), 0);
  const totalCredit = rows.reduce((a, b) => a + Number(b.credit || 0), 0);

  const update = (i, field, value) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((p) => [...p, { account: "", debit: 0, credit: 0, memo: "" }]);

  return (
    <Card>
      <CardHeader title="New Journal Entry" subtitle="Manual adjustments or non-standard postings" />
      <CardBody className="overflow-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Account", "Memo", "Debit", "Credit", ""].map((h) => (
                <th key={h} className="text-left px-3 py-2 border-b text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 border-b">
                  <input className="border rounded-lg px-2 py-1 w-56" value={r.account} onChange={(e) => update(i, "account", e.target.value)} placeholder="Account name" />
                </td>
                <td className="px-3 py-2 border-b">
                  <input className="border rounded-lg px-2 py-1 w-full" value={r.memo} onChange={(e) => update(i, "memo", e.target.value)} placeholder="Memo" />
                </td>
                <td className="px-3 py-2 border-b">
                  <input className="border rounded-lg px-2 py-1 w-28" type="number" value={r.debit} onChange={(e) => update(i, "debit", Number(e.target.value))} />
                </td>
                <td className="px-3 py-2 border-b">
                  <input className="border rounded-lg px-2 py-1 w-28" type="number" value={r.credit} onChange={(e) => update(i, "credit", Number(e.target.value))} />
                </td>
                <td className="px-3 py-2 border-b">
                  <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={() => setRows((p) => p.filter((_, idx) => idx !== i))}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-medium">
              <td className="px-3 py-2 border-t" colSpan={2}>
                Totals
              </td>
              <td className="px-3 py-2 border-t">{formatCurrency(totalDebit)}</td>
              <td className="px-3 py-2 border-t">{formatCurrency(totalCredit)}</td>
              <td className="px-3 py-2 border-t">
                <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={addRow}>
                  + Add Row
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
        <div className="mt-4 flex gap-2">
          <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">Validate (D=C)</button>
          <button className="px-3 py-2 border rounded-lg bg-blue-600 text-white hover:opacity-90 disabled:opacity-50" disabled={totalDebit !== totalCredit || totalDebit === 0}>
            Post Entry
          </button>
        </div>
      </CardBody>
    </Card>
  );
}

/** --------------------------------
 *  COST CENTERS
 *  -------------------------------- */
function CostCenters() {
  const centers = [
    { code: "CC-FO", name: "Front Office", owner: "A. Singh" },
    { code: "CC-FB", name: "F&B", owner: "P. Rao" },
    { code: "CC-HK", name: "Housekeeping", owner: "T. Nair" },
  ];
  return (
    <Card>
      <CardHeader title="Cost Centers" right={<button className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">+ Add Cost Center</button>} />
      <CardBody className="overflow-auto">
        <table className="min-w-[700px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Code", "Name", "Owner", "Actions"].map((h) => (
                <th key={h} className="text-left px-3 py-2 border-b text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {centers.map((r) => (
              <tr key={r.code} className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 border-b font-mono">{r.code}</td>
                <td className="px-3 py-2 border-b">{r.name}</td>
                <td className="px-3 py-2 border-b">{r.owner}</td>
                <td className="px-3 py-2 border-b">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 border rounded hover:bg-gray-50">Allocate</button>
                    <button className="px-2 py-1 border rounded hover:bg-gray-50">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}

/** --------------------------------
 *  BUDGETING & FORECASTING
 *  -------------------------------- */
function Budgeting() {
  const items = [
    { dept: "Rooms", budget: 4200000, actual: 3980000 },
    { dept: "F&B", budget: 1800000, actual: 1725000 },
    { dept: "Spa", budget: 260000, actual: 252000 },
  ];
  return (
    <Card>
      <CardHeader title="Budget vs Actual" />
      <CardBody className="overflow-auto">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Department", "Budget", "Actual", "Variance", "Achievement %"].map((h) => (
                <th key={h} className="text-left px-3 py-2 border-b text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((r) => {
              const variance = r.actual - r.budget;
              const pct = (r.actual / r.budget) * 100;
              return (
                <tr key={r.dept} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-b">{r.dept}</td>
                  <td className="px-3 py-2 border-b">{formatCurrency(r.budget)}</td>
                  <td className="px-3 py-2 border-b">{formatCurrency(r.actual)}</td>
                  <td className={`px-3 py-2 border-b ${variance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatCurrency(variance)}
                  </td>
                  <td className="px-3 py-2 border-b">{pct.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-4 flex gap-2">
          <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">Edit Budget</button>
          <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">Forecast Next Q</button>
        </div>
      </CardBody>
    </Card>
  );
}

/** --------------------------------
 *  FIXED ASSETS
 *  -------------------------------- */
function FixedAssets() {
  const assets = [
    { code: "AS-001", name: "HVAC Main Unit", location: "Basement", cost: 650000, method: "SLM", life: "10y", accDep: 260000, nbv: 390000 },
    { code: "AS-002", name: "Kitchen Range", location: "Kitchen", cost: 240000, method: "WDV", life: "7y", accDep: 96000, nbv: 144000 },
  ];
  return (
    <Card>
      <CardHeader title="Asset Register" right={<button className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">+ Add Asset</button>} />
      <CardBody className="overflow-auto">
        <table className="min-w-[1000px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Code", "Asset Name", "Location", "Cost", "Method", "Useful Life", "Acc. Dep.", "NBV", "Actions"].map((h) => (
                <th key={h} className="text-left px-3 py-2 border-b text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((r) => (
              <tr key={r.code} className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 border-b font-mono">{r.code}</td>
                <td className="px-3 py-2 border-b">{r.name}</td>
                <td className="px-3 py-2 border-b">{r.location}</td>
                <td className="px-3 py-2 border-b">{formatCurrency(r.cost)}</td>
                <td className="px-3 py-2 border-b">{r.method}</td>
                <td className="px-3 py-2 border-b">{r.life}</td>
                <td className="px-3 py-2 border-b">{formatCurrency(r.accDep)}</td>
                <td className="px-3 py-2 border-b">{formatCurrency(r.nbv)}</td>
                <td className="px-3 py-2 border-b">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 border rounded hover:bg-gray-50">Depreciate</button>
                    <button className="px-2 py-1 border rounded hover:bg-gray-50">Transfer</button>
                    <button className="px-2 py-1 border rounded hover:bg-gray-50">Dispose</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}

/** --------------------------------
 *  PAYROLL & HR
 *  -------------------------------- */
function Payroll() {
  const payroll = [
    { month: "2025-05", employees: 58, gross: 2150000, tds: 120000, net: 2030000 },
    { month: "2025-06", employees: 60, gross: 2210000, tds: 124000, net: 2086000 },
  ];
  return (
    <Card>
      <CardHeader title="Payroll Summary" subtitle="Integrated accounting view" />
      <CardBody className="overflow-auto">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Month", "Employees", "Gross", "TDS", "Net", "Actions"].map((h) => (
                <th key={h} className="text-left px-3 py-2 border-b text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payroll.map((r) => (
              <tr key={r.month} className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 border-b">{r.month}</td>
                <td className="px-3 py-2 border-b">{r.employees}</td>
                <td className="px-3 py-2 border-b">{formatCurrency(r.gross)}</td>
                <td className="px-3 py-2 border-b">{formatCurrency(r.tds)}</td>
                <td className="px-3 py-2 border-b">{formatCurrency(r.net)}</td>
                <td className="px-3 py-2 border-b">
                  <button className="px-2 py-1 border rounded hover:bg-gray-50">Post to GL</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}

/** --------------------------------
 *  REPORTS & AUDITS
 *  -------------------------------- */
function ReportsAudits() {
  const reports = [
    "Trial Balance",
    "Profit & Loss",
    "Balance Sheet",
    "Ledger Report",
    "Daily Revenue Report",
    "GST Summary",
    "Aging (AR/AP)",
    "MIS Dashboard",
    "Audit Logs",
  ];
  return (
    <>
      <Card>
        <CardHeader title="Standard Reports" />
        <CardBody className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reports.map((r) => (
            <button key={r} className="text-left p-3 rounded-xl border hover:bg-gray-50">
              <div className="font-medium text-gray-800">{r}</div>
              <div className="text-xs text-gray-500">Click to preview/export</div>
            </button>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Audit Log (sample)" />
        <CardBody className="overflow-auto">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Time", "User", "Action", "Module", "Details"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 border-b text-gray-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { t: "2025-06-06 10:21", u: "manager@hotel", a: "POST", m: "AR", d: "Receipt R-1021 ₹30,000" },
                { t: "2025-06-06 11:04", u: "accounts@hotel", a: "PUT", m: "AP", d: "Scheduled payment BILL-7003" },
                { t: "2025-06-06 12:33", u: "gm@hotel", a: "POST", m: "GL", d: "Journal J-204 balanced" },
              ].map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-b">{r.t}</td>
                  <td className="px-3 py-2 border-b">{r.u}</td>
                  <td className="px-3 py-2 border-b">{r.a}</td>
                  <td className="px-3 py-2 border-b">{r.m}</td>
                  <td className="px-3 py-2 border-b">{r.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </>
  );
}

/** --------------------------------
 *  INTEGRATIONS & EXPORT
 *  -------------------------------- */
function IntegrationsExport() {
  return (
    <Card>
      <CardHeader title="Integrations & Export" subtitle="Tally / QuickBooks / Zoho / Payment Gateways" />
      <CardBody>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Accounting Export</label>
            <select className="border w-full rounded-lg p-2">
              <option>Tally (CSV)</option>
              <option>QuickBooks (IIF/CSV)</option>
              <option>Zoho Books (CSV)</option>
            </select>
            <button className="mt-2 px-3 py-2 border rounded-lg hover:bg-gray-50">Export Now</button>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Payment Gateway</label>
            <select className="border w-full rounded-lg p-2">
              <option>Razorpay</option>
              <option>PayU</option>
              <option>HDFC</option>
            </select>
            <button className="mt-2 px-3 py-2 border rounded-lg hover:bg-gray-50">Connect</button>
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Channel Manager / OTA Commission Reconciliation</label>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">Import OTA Statement</button>
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">Match to Folios</button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/** --------------------------------
 *  UTIL & SMALL COMPONENTS
 *  -------------------------------- */
function StatusPill({ status }) {
  const map = {
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Overdue: "bg-rose-50 text-rose-700 border-rose-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    "Partially Received": "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return <span className={`px-2 py-0.5 text-xs rounded-full border ${map[status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>{status}</span>;
}

function formatCurrency(n) {
  if (typeof n !== "number") return "₹0";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

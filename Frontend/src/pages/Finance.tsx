// Finance — Loan Calculator, Revenue Projections, Government Schemes
import { useState, useMemo } from 'react';
import {
  Landmark, TrendingUp, TrendingDown, Calculator, IndianRupee,
  BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const LOAN_SCHEMES = [
  {
    name: 'Kisan Credit Card (KCC)',
    rate: 4, maxAmount: 300000, tenure: '12 months',
    description: 'Short-term credit for crops, maintenance and allied activities.',
    color: 'from-green-500 to-emerald-600',
    badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  },
  {
    name: 'Agriculture Term Loan',
    rate: 7, maxAmount: 1000000, tenure: 'Up to 7 years',
    description: 'Medium-long term finance for farm infrastructure and machinery.',
    color: 'from-blue-500 to-blue-700',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  },
  {
    name: 'NABARD Warehouse Receipt',
    rate: 6.5, maxAmount: 500000, tenure: '6–12 months',
    description: 'Pledge stored produce in registered warehouses for immediate credit.',
    color: 'from-purple-500 to-violet-600',
    badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  },
];

const generateProjectionData = (baseIncome: number, growthRate: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, i) => ({
    month,
    projected: Math.round(baseIncome * (1 + (growthRate / 100) * (i / 12))),
    actual: i < 6 ? Math.round(baseIncome * (1 + (growthRate / 100) * (i / 12)) * (0.9 + Math.random() * 0.2)) : 0,
  }));
};

const Finance = () => {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [loanRate, setLoanRate] = useState(7);
  const [loanTenure, setLoanTenure] = useState(12);
  const [baseIncome, setBaseIncome] = useState(150000);
  const [growthRate, setGrowthRate] = useState(15);
  const [activeTab, setActiveTab] = useState<'projection' | 'loan' | 'schemes'>('projection');

  const emi = useMemo(() => {
    const r = loanRate / 1200;
    const n = loanTenure;
    if (r === 0) return loanAmount / n;
    return (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [loanAmount, loanRate, loanTenure]);

  const totalPayable = emi * loanTenure;
  const totalInterest = totalPayable - loanAmount;
  const projectionData = useMemo(() => generateProjectionData(baseIncome, growthRate), [baseIncome, growthRate]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Landmark size={28} className="text-primary-600" /> Finance & Projections
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Revenue forecasting, loan calculator, and agri-finance schemes</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Annual Revenue', value: `₹${(baseIncome * 1.2).toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Total Expenses', value: `₹${(baseIncome * 0.6).toLocaleString()}`, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Net Profit', value: `₹${(baseIncome * 0.6).toLocaleString()}`, icon: IndianRupee, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Growth Rate', value: `${growthRate}%`, icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map(kpi => (
          <div key={kpi.label} className={`rounded-2xl p-3 sm:p-4 ${kpi.bg} border border-transparent`}>
            <div className={`${kpi.color} mb-1`}><kpi.icon size={18} /></div>
            <p className={`text-lg sm:text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
        {(['projection', 'loan', 'schemes'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-fit px-4 py-2 rounded-lg text-xs sm:text-sm font-bold capitalize transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}>
            {tab === 'projection' ? '📈 Revenue Projection' : tab === 'loan' ? '🏦 Loan Calculator' : '💰 Loan Schemes'}
          </button>
        ))}
      </div>

      {/* Revenue Projection Tab */}
      {activeTab === 'projection' && (
        <div className="card border-none shadow-xl space-y-4 sm:space-y-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-primary-600" size={20} /> Annual Revenue Projection
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Base Monthly Income (₹)</label>
              <input
                type="range" min={20000} max={500000} step={5000} value={baseIncome}
                onChange={e => setBaseIncome(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>₹20K</span>
                <span className="font-black text-primary-600">₹{baseIncome.toLocaleString()}</span>
                <span>₹5L</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Annual Growth Rate (%)</label>
              <input
                type="range" min={0} max={50} step={1} value={growthRate}
                onChange={e => setGrowthRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span className="font-black text-primary-600">{growthRate}%</span>
                <span>50%</span>
              </div>
            </div>
          </div>

          <div className="h-52 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, '']} />
                <Legend />
                <Area type="monotone" dataKey="projected" stroke="#16a34a" strokeWidth={2} fill="url(#projGrad)" name="Projected" />
                <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} fill="url(#actGrad)" name="Actual" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Loan Calculator Tab */}
      {activeTab === 'loan' && (
        <div className="card border-none shadow-xl space-y-4 sm:space-y-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calculator className="text-primary-600" size={20} /> EMI Calculator
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Loan Amount (₹)', min: 10000, max: 2000000, step: 10000, value: loanAmount, setter: setLoanAmount, format: (v: number) => `₹${v.toLocaleString()}`, lo: '₹10K', hi: '₹20L' },
              { label: 'Interest Rate (% p.a.)', min: 1, max: 20, step: 0.5, value: loanRate, setter: setLoanRate, format: (v: number) => `${v}%`, lo: '1%', hi: '20%' },
              { label: 'Tenure (months)', min: 3, max: 120, step: 3, value: loanTenure, setter: setLoanTenure, format: (v: number) => `${v} mo`, lo: '3', hi: '120' },
            ].map(item => (
              <div key={item.label}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">{item.label}</label>
                <input
                  type="range" min={item.min} max={item.max} step={item.step} value={item.value}
                  onChange={e => item.setter(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{item.lo}</span>
                  <span className="font-black text-primary-600">{item.format(item.value)}</span>
                  <span>{item.hi}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Monthly EMI', value: `₹${Math.round(emi).toLocaleString()}`, color: 'from-primary-500 to-emerald-600', textColor: 'text-white' },
              { label: 'Total Interest', value: `₹${Math.round(totalInterest).toLocaleString()}`, color: 'from-amber-400 to-orange-500', textColor: 'text-white' },
              { label: 'Total Payable', value: `₹${Math.round(totalPayable).toLocaleString()}`, color: 'from-blue-500 to-blue-700', textColor: 'text-white' },
            ].map(kpi => (
              <div key={kpi.label} className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-4 sm:p-5 shadow-lg`}>
                <p className="text-xs text-white/70 font-bold uppercase tracking-wide mb-1">{kpi.label}</p>
                <p className="text-2xl sm:text-3xl font-black text-white">{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="h-44 sm:h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Loan', principal: loanAmount, interest: Math.round(totalInterest) }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, '']} />
                <Bar dataKey="principal" fill="#16a34a" name="Principal" radius={[4,4,0,0]} />
                <Bar dataKey="interest" fill="#f59e0b" name="Interest" radius={[4,4,0,0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Loan Schemes Tab */}
      {activeTab === 'schemes' && (
        <div className="space-y-3 sm:space-y-4">
          {LOAN_SCHEMES.map(scheme => (
            <div key={scheme.name} className="card border-none shadow-md overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${scheme.color}`} />
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white sm:text-lg">{scheme.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{scheme.description}</p>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full whitespace-nowrap ${scheme.badge}`}>{scheme.rate}% p.a.</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Max Amount</p>
                    <p className="font-black text-gray-900 dark:text-white mt-0.5">₹{scheme.maxAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Tenure</p>
                    <p className="font-black text-gray-900 dark:text-white mt-0.5">{scheme.tenure}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setLoanRate(scheme.rate); setLoanAmount(Math.min(scheme.maxAmount, 200000)); setActiveTab('loan'); toast.success(`Loaded ${scheme.name} parameters into calculator!`); }}
                  className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2"
                >
                  <Calculator size={16} /> Calculate EMI for this scheme
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Finance;

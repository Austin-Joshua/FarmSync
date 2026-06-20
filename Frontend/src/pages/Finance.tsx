import { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Briefcase, Plus, AlertCircle } from 'lucide-react';
import ApiService from '../services/api';
import toast from 'react-hot-toast';
import { formatDateDisplay } from '../utils/dateFormatter';

const Finance = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [projections, setProjections] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loansData, projData] = await Promise.all([
        ApiService.getLoans(),
        ApiService.getProfitLossProjections()
      ]);
      setLoans(loansData || []);
      setProjections(projData);
    } catch (err) {
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!amount || !purpose) return;
    try {
      await ApiService.applyForLoan({
        amount: parseFloat(amount),
        purpose
      });
      toast.success('Loan application submitted successfully!');
      setShowApply(false);
      setAmount('');
      setPurpose('');
      fetchData();
    } catch (err) {
      toast.error('Failed to submit loan application');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finance & Projections</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage loans and view AI-driven profit/loss projections</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading financial data...</div>
      ) : (
        <>
          {/* P&L Projections */}
          {projections && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
                <div className="flex items-center gap-3 text-green-600 dark:text-green-400 mb-2">
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg"><TrendingUp size={20} /></div>
                  <h3 className="font-semibold">Projected Revenue</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{projections.projectedRevenue.toLocaleString()}</p>
              </div>
              <div className="card bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-2">
                  <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg"><TrendingDown size={20} /></div>
                  <h3 className="font-semibold">Projected Expenses</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{projections.projectedExpenses.toLocaleString()}</p>
              </div>
              <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800">
                <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400 mb-2">
                  <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-lg"><IndianRupee size={20} /></div>
                  <h3 className="font-semibold">Estimated Profit</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{projections.projectedProfit.toLocaleString()}</p>
              </div>
              <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg"><AlertCircle size={20} /></div>
                  <h3 className="font-semibold">Risk Factor</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{projections.riskFactor}</p>
              </div>
            </div>
          )}

          {/* Loans Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agricultural Loans</h2>
            <button onClick={() => setShowApply(!showApply)} className="btn-primary flex items-center gap-2">
              <Plus size={20} /> Apply for Loan
            </button>
          </div>

          {showApply && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4">New Loan Application</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Requested (₹)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose</label>
                  <input 
                    type="text" 
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Tractor Purchase, Seeds"
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setShowApply(false)} className="btn-secondary">Cancel</button>
                  <button onClick={handleApply} className="btn-primary">Submit Application</button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {loans.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No loan history found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                    <tr>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Purpose</th>
                      <th className="p-4 font-semibold">Amount</th>
                      <th className="p-4 font-semibold">Term & Rate</th>
                      <th className="p-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {loans.map(loan => (
                      <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-4 text-sm text-gray-900 dark:text-white">{formatDateDisplay(loan.createdAt)}</td>
                        <td className="p-4 text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <Briefcase size={16} className="text-gray-400"/> {loan.purpose}
                        </td>
                        <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">₹{loan.amount.toLocaleString()}</td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{loan.termMonths} months @ {loan.interestRate}%</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            loan.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            loan.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {loan.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Finance;

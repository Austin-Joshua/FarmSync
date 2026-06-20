import { useState, useEffect } from 'react';
import { ShieldCheck, Plus, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import ApiService from '../services/api';
import toast from 'react-hot-toast';
import { formatDateDisplay } from '../utils/dateFormatter';

const Compliance = () => {
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [certType, setCertType] = useState('ORGANIC');

  const farmId = '00000000-0000-0000-0000-000000000000'; // Real app would fetch user's farmId

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      // In a real flow, we need the actual farmId. For now we will try and fail gracefully.
      const data = await ApiService.getCertifications(farmId);
      setCertifications(data || []);
    } catch (err) {
      console.warn('Could not load certifications, farmId may be invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      await ApiService.applyForCertification(farmId, { type: certType, notes: 'Initial application via web portal' });
      toast.success('Application submitted successfully!');
      setShowApply(false);
      fetchCertifications();
    } catch (err) {
      toast.error('Failed to submit application. Make sure you have a registered farm.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="text-green-500" size={20} />;
      case 'PENDING': return <Clock className="text-yellow-500" size={20} />;
      case 'REJECTED': return <XCircle className="text-red-500" size={20} />;
      default: return <FileText className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compliance & Certification</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your organic and export certifications</p>
        </div>
        <button onClick={() => setShowApply(!showApply)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Apply for Certification
        </button>
      </div>

      {showApply && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">New Certification Application</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certification Type</label>
              <select 
                value={certType} 
                onChange={(e) => setCertType(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              >
                <option value="ORGANIC">Organic Farming Certification</option>
                <option value="EXPORT_EU">EU Export Compliance</option>
                <option value="EXPORT_US">USDA Export Compliance</option>
                <option value="FAIR_TRADE">Fair Trade Certification</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowApply(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleApply} className="btn-primary">Submit Application</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Guidelines Card */}
        <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-2xl border border-primary-100 dark:border-primary-800">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Organic Guidelines</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Review the latest standards for maintaining your organic status. Avoid synthetic pesticides and fertilizers.
          </p>
          <button className="text-primary-600 font-semibold text-sm hover:underline">Read Guidelines →</button>
        </div>

        {/* Existing Certifications */}
        {certifications.map(cert => (
          <div key={cert.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{cert.type.replace('_', ' ')}</h3>
              {getStatusIcon(cert.status)}
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>Status: <span className="font-semibold text-gray-900 dark:text-white">{cert.status}</span></p>
              <p>Applied: {formatDateDisplay(cert.createdAt)}</p>
              {cert.expiryDate && <p>Expires: {formatDateDisplay(cert.expiryDate)}</p>}
            </div>
          </div>
        ))}

        {!loading && certifications.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            You don't have any active certifications. Apply for one to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default Compliance;

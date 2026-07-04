// Compliance — Certifications, Checklists, Government Compliance
import { useState } from 'react';
import {
  ShieldCheck, Award, FileCheck, Upload, CheckCircle, Clock,
  AlertCircle, Plus, Download, ExternalLink, ChevronDown, ChevronUp,
  Leaf, Package
} from 'lucide-react';
import toast from 'react-hot-toast';

const CERTIFICATIONS = [
  {
    id: 'organic',
    title: 'Organic Certification',
    body: 'PGS-India / NPOP',
    status: 'active',
    issued: '2024-03-15',
    expiry: '2026-03-14',
    icon: Leaf,
    color: 'green',
    description: 'Certified organic producer under the Participatory Guarantee System of India.',
    documents: ['Application Form', 'Land Records', 'Input Usage Log', 'Soil Test Report'],
  },
  {
    id: 'fssai',
    title: 'FSSAI License',
    body: 'Food Safety & Standards Authority',
    status: 'pending',
    issued: '2025-01-10',
    expiry: '2026-01-09',
    icon: ShieldCheck,
    color: 'blue',
    description: 'Food business operator license for direct produce sales to consumers.',
    documents: ['ID Proof', 'Address Proof', 'Business Plan', 'Processing Unit Layout'],
  },
  {
    id: 'iso',
    title: 'ISO 22000:2018',
    body: 'Food Safety Management',
    status: 'expired',
    issued: '2023-06-01',
    expiry: '2025-05-31',
    icon: Award,
    color: 'amber',
    description: 'Food safety management system standard for agri-food supply chains.',
    documents: ['HACCP Plan', 'Audit Report', 'Corrective Action Records'],
  },
];

const COMPLIANCE_CHECKLIST = [
  { id: 1, label: 'Maintain crop input records for 3 years', category: 'Records', done: true },
  { id: 2, label: 'Submit quarterly soil health reports', category: 'Reports', done: true },
  { id: 3, label: 'Annual groundwater usage declaration', category: 'Water', done: false },
  { id: 4, label: 'Pesticide application log updated', category: 'Inputs', done: true },
  { id: 5, label: 'Labor welfare compliance (MNREGA)', category: 'Labor', done: false },
  { id: 6, label: 'Crop insurance renewal (PMFBY)', category: 'Insurance', done: false },
  { id: 7, label: 'Farm boundary geo-tagged in soil health portal', category: 'Digital', done: true },
  { id: 8, label: 'Annual PM-KISAN beneficiary verification', category: 'Schemes', done: true },
];

const colorMap: Record<string, { badge: string; border: string; bg: string; icon: string }> = {
  green: { badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800', bg: 'bg-green-50 dark:bg-green-900/10', icon: 'text-green-600 dark:text-green-400' },
  blue: { badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', bg: 'bg-blue-50 dark:bg-blue-900/10', icon: 'text-blue-600 dark:text-blue-400' },
  amber: { badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-900/10', icon: 'text-amber-600 dark:text-amber-400' },
};

const statusMap: Record<string, { label: string; cls: string; icon: any }> = {
  active: { label: 'Active', cls: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300', icon: CheckCircle },
  pending: { label: 'Renewal Pending', cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', icon: Clock },
  expired: { label: 'Expired', cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', icon: AlertCircle },
};

const Compliance = () => {
  const [checklist, setChecklist] = useState(COMPLIANCE_CHECKLIST);
  const [expanded, setExpanded] = useState<string | null>('organic');
  const [activeTab, setActiveTab] = useState<'certs' | 'checklist' | 'documents'>('certs');

  const completed = checklist.filter(i => i.done).length;

  const toggleCheck = (id: number) => {
    setChecklist(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  };

  const handleUpload = (certId: string, docName: string) => {
    toast.success(`${docName} uploaded for ${certId} certification`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck size={28} className="text-primary-600" />
            Compliance & Certifications
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage your farm certifications and regulatory compliance
          </p>
        </div>
        <button
          onClick={() => toast.success('Application form downloaded!')}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto text-sm"
        >
          <Plus size={16} /> Apply New Certification
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-3 sm:py-4 border-none bg-green-50 dark:bg-green-900/20">
          <p className="text-2xl sm:text-3xl font-black text-green-600 dark:text-green-400">1</p>
          <p className="text-[10px] sm:text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide">Active</p>
        </div>
        <div className="card text-center py-3 sm:py-4 border-none bg-amber-50 dark:bg-amber-900/20">
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">1</p>
          <p className="text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">Pending</p>
        </div>
        <div className="card text-center py-3 sm:py-4 border-none bg-red-50 dark:bg-red-900/20">
          <p className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">1</p>
          <p className="text-[10px] sm:text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wide">Expired</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
        {(['certs', 'checklist', 'documents'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-fit px-4 py-2 rounded-lg text-xs sm:text-sm font-bold capitalize transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab === 'certs' ? '🏅 Certifications' : tab === 'checklist' ? '✅ Compliance Checklist' : '📁 Documents'}
          </button>
        ))}
      </div>

      {/* Certifications Tab */}
      {activeTab === 'certs' && (
        <div className="space-y-3 sm:space-y-4">
          {CERTIFICATIONS.map(cert => {
            const c = colorMap[cert.color];
            const s = statusMap[cert.status];
            const StatusIcon = s.icon;
            const CertIcon = cert.icon;
            const isOpen = expanded === cert.id;
            return (
              <div key={cert.id} className={`rounded-2xl border-2 overflow-hidden transition-all ${c.border}`}>
                <button
                  onClick={() => setExpanded(isOpen ? null : cert.id)}
                  className={`w-full flex items-center justify-between p-4 sm:p-5 ${c.bg} text-left`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${c.badge} flex items-center justify-center flex-shrink-0`}>
                      <CertIcon size={20} className={c.icon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{cert.title}</h3>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${s.cls}`}>
                          <StatusIcon size={9} />{s.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cert.body}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Expires: {cert.expiry}</p>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 bg-white dark:bg-gray-800 space-y-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{cert.description}</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
                        <p className="text-gray-400 uppercase font-bold tracking-wide text-[9px] mb-1">Issued</p>
                        <p className="font-bold text-gray-900 dark:text-white">{cert.issued}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
                        <p className="text-gray-400 uppercase font-bold tracking-wide text-[9px] mb-1">Expires</p>
                        <p className={`font-bold ${cert.status === 'expired' ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{cert.expiry}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Required Documents</p>
                      <div className="space-y-2">
                        {cert.documents.map(doc => (
                          <div key={doc} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div className="flex items-center gap-2">
                              <FileCheck size={14} className="text-primary-600" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{doc}</span>
                            </div>
                            <button
                              onClick={() => handleUpload(cert.id, doc)}
                              className="text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                              <Upload size={12} /> Upload
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toast.success('Certificate downloaded!')} className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm py-2">
                        <Download size={14} /> Download
                      </button>
                      <button onClick={() => toast.success('Renewal application opened!')} className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm py-2">
                        <ExternalLink size={14} /> Renew
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Checklist Tab */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <div className="card border-none bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Compliance Progress</h3>
              <span className="text-sm font-black text-primary-600">{completed}/{checklist.length}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${(completed / checklist.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{completed} of {checklist.length} requirements met</p>
          </div>

          {['Records', 'Reports', 'Water', 'Inputs', 'Labor', 'Insurance', 'Digital', 'Schemes'].map(cat => {
            const items = checklist.filter(i => i.category === cat);
            if (!items.length) return null;
            return (
              <div key={cat}>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{cat}</h4>
                <div className="space-y-2">
                  {items.map(item => (
                    <label key={item.id} className="flex items-center gap-3 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                      <div
                        onClick={() => toggleCheck(item.id)}
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          item.done ? 'bg-primary-600 border-primary-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {item.done && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <span className={`text-sm ${item.done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 sm:p-12 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all"
            onClick={() => toast.success('File picker opened!')}
          >
            <Upload size={36} className="mx-auto text-gray-400 mb-3" />
            <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">Drop files here or click to upload</p>
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — max 10MB each</p>
            <button className="mt-4 btn-primary text-sm py-2 px-6">Browse Files</button>
          </div>
          <div className="space-y-2">
            {['Organic_Certificate_2024.pdf', 'Soil_Test_Report_Q1.pdf', 'FSSAI_Application.pdf'].map(file => (
              <div key={file} className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-primary-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{file}</p>
                    <p className="text-xs text-gray-400">Uploaded • 2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toast.success('Downloading...')} aria-label="Download document" className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"><Download size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Compliance;

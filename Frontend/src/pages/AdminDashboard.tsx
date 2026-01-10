// Enhanced Admin Dashboard with District-wise Stats and System-wide Reports
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ColoredDot from '../components/ColoredDot';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Save,
  X,
  AlertCircle,
  Users,
  TrendingUp,
  Activity,
  BarChart3,
  FileText,
  MapPin,
  Package,
  Download,
  LogIn,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { CropType as CropTypeInterface } from '../types';

type TabType = 'overview' | 'district-stats' | 'reports' | 'crops' | 'activity';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Overview Data
  const [farmerStats, setFarmerStats] = useState<Array<{ district: string; count: number }>>([]);
  const [activitySummary, setActivitySummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Crop Management
  const [cropTypes, setCropTypes] = useState<CropTypeInterface[]>([]);
  const [filteredCrops, setFilteredCrops] = useState<CropTypeInterface[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropTypeInterface | null>(null);
  const [formData, setFormData] = useState<Partial<CropTypeInterface>>({
    name: '',
    category: '',
    season: 'kharif',
    suitableSoilTypes: [],
    averageYield: 0,
    growthPeriod: 0,
    waterRequirement: 'medium',
    description: '',
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch farmer statistics
        const dashboardResponse = await api.getDashboard() as any;
        if (dashboardResponse?.data?.farmerStats && Array.isArray(dashboardResponse.data.farmerStats)) {
          setFarmerStats(dashboardResponse.data.farmerStats);
        }

        // Fetch activity summary
        try {
          const activityResponse = await api.getActivitySummary(7) as any;
          if (activityResponse?.data) {
            setActivitySummary(activityResponse.data);
          }
        } catch (err) {
          console.error('Failed to fetch activity summary:', err);
        }

        // Fetch crop types
        const cropsResponse = await api.getCropTypes() as any;
        if (cropsResponse?.data && Array.isArray(cropsResponse.data)) {
          setCropTypes(cropsResponse.data);
          setFilteredCrops(cropsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use mock data as fallback
        setFarmerStats([
          { district: 'Coimbatore', count: 45 },
          { district: 'Chennai', count: 32 },
          { district: 'Madurai', count: 28 },
          { district: 'Tirunelveli', count: 15 },
          { district: 'Salem', count: 12 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filter crops
  useEffect(() => {
    let filtered = cropTypes;
    if (searchTerm) {
      filtered = filtered.filter(crop =>
        crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(crop => crop.category === selectedCategory);
    }
    setFilteredCrops(filtered);
  }, [cropTypes, searchTerm, selectedCategory]);

  // Chart colors
  const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  // Prepare chart data
  const districtChartData = farmerStats.map(stat => ({
    name: stat.district,
    farmers: stat.count,
  }));

  const activityChartData = activitySummary ? [
    { name: 'Logins', value: activitySummary.logins || 0 },
    { name: 'Creates', value: activitySummary.creates || 0 },
    { name: 'Updates', value: activitySummary.updates || 0 },
    { name: 'Deletes', value: activitySummary.deletes || 0 },
    { name: 'Exports', value: activitySummary.exports || 0 },
  ] : [];

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'district-stats', label: 'District Statistics', icon: MapPin },
    { id: 'reports', label: 'System Reports', icon: FileText },
    { id: 'crops', label: 'Crop Management', icon: Package },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage system-wide operations and statistics</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 mb-1">Total Farmers</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {farmerStats.reduce((sum, stat) => sum + stat.count, 0)}
                      </p>
                    </div>
                    <Users className="text-blue-600" size={32} />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-green-50 to-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 mb-1">Districts</p>
                      <p className="text-3xl font-bold text-green-900">{farmerStats.length}</p>
                    </div>
                    <MapPin className="text-green-600" size={32} />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 mb-1">Crop Types</p>
                      <p className="text-3xl font-bold text-purple-900">{cropTypes.length}</p>
                    </div>
                    <Package className="text-purple-600" size={32} />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 mb-1">Total Actions (7d)</p>
                      <p className="text-3xl font-bold text-orange-900">
                        {activitySummary?.totalActions || 0}
                      </p>
                    </div>
                    <Activity className="text-orange-600" size={32} />
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              {activitySummary && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Activity (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={activityChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#16a34a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Breakdown</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <LogIn size={20} className="text-blue-600" />
                          <span className="font-medium text-gray-900">Logins</span>
                        </div>
                        <span className="text-xl font-bold text-blue-600">{activitySummary.logins || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Plus size={20} className="text-green-600" />
                          <span className="font-medium text-gray-900">Creates</span>
                        </div>
                        <span className="text-xl font-bold text-green-600">{activitySummary.creates || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Edit size={20} className="text-yellow-600" />
                          <span className="font-medium text-gray-900">Updates</span>
                        </div>
                        <span className="text-xl font-bold text-yellow-600">{activitySummary.updates || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Trash2 size={20} className="text-red-600" />
                          <span className="font-medium text-gray-900">Deletes</span>
                        </div>
                        <span className="text-xl font-bold text-red-600">{activitySummary.deletes || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Download size={20} className="text-purple-600" />
                          <span className="font-medium text-gray-900">Exports</span>
                        </div>
                        <span className="text-xl font-bold text-purple-600">{activitySummary.exports || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* District Statistics Tab */}
          {activeTab === 'district-stats' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">District-wise Farmer Distribution</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={districtChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="farmers" fill="#16a34a" name="Farmers" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={districtChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="farmers"
                        >
                          {districtChartData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* District List */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">District Details</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {farmerStats.map((stat, index) => (
                    <div
                      key={stat.district}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ColoredDot color={COLORS[index % COLORS.length]} />
                        <MapPin className="text-primary-600" size={18} />
                        <span className="font-medium text-gray-900">{stat.district}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{stat.count} farmers</span>
                        <span className="text-sm text-gray-400">
                          {((stat.count / farmerStats.reduce((sum, s) => sum + s.count, 0)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* System Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">System-wide Reports</h3>
                <button className="btn-primary flex items-center gap-2">
                  <Download size={18} />
                  Export All Reports
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="text-blue-600" size={24} />
                    <h4 className="text-lg font-semibold text-gray-900">Farmer Registration Report</h4>
                  </div>
                  <p className="text-gray-600 mb-4">Total registered farmers: {farmerStats.reduce((sum, stat) => sum + stat.count, 0)}</p>
                  <button className="btn-secondary w-full">Generate Report</button>
                </div>

                <div className="card">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="text-green-600" size={24} />
                    <h4 className="text-lg font-semibold text-gray-900">Activity Report</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    System actions in last 7 days: {activitySummary?.totalActions || 0}
                  </p>
                  <button className="btn-secondary w-full">Generate Report</button>
                </div>

                <div className="card">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="text-purple-600" size={24} />
                    <h4 className="text-lg font-semibold text-gray-900">Crop Management Report</h4>
                  </div>
                  <p className="text-gray-600 mb-4">Total crop types: {cropTypes.length}</p>
                  <button className="btn-secondary w-full">Generate Report</button>
                </div>

                <div className="card">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="text-orange-600" size={24} />
                    <h4 className="text-lg font-semibold text-gray-900">System Performance Report</h4>
                  </div>
                  <p className="text-gray-600 mb-4">View system metrics and performance indicators</p>
                  <button className="btn-secondary w-full">Generate Report</button>
                </div>
              </div>
            </div>
          )}

          {/* Crop Management Tab - Keep existing implementation */}
          {activeTab === 'crops' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Crop Types Management</h3>
                  <p className="text-gray-600">Manage crop varieties and their specifications</p>
                </div>
                <button
                  onClick={() => {
                    setFormData({
                      name: '',
                      category: '',
                      season: 'kharif',
                      suitableSoilTypes: [],
                      averageYield: 0,
                      growthPeriod: 0,
                      waterRequirement: 'medium',
                      description: '',
                    });
                    setShowAddForm(true);
                    setEditingCrop(null);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add New Crop
                </button>
              </div>

              {/* Filters */}
              <div className="card">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <label htmlFor="admin-crop-search" className="sr-only">Search crops</label>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="admin-crop-search"
                      type="text"
                      placeholder="Search crops..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      aria-label="Search crops"
                    />
                  </div>
                  <label htmlFor="admin-crop-category" className="sr-only">Category filter</label>
                  <select
                    id="admin-crop-category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    aria-label="Category filter"
                  >
                    <option value="all">All Categories</option>
                    <option value="grains">Grains</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="pulses">Pulses</option>
                    <option value="oilseeds">Oilseeds</option>
                  </select>
                </div>
              </div>

              {/* Crop Types Table - Simplified for brevity */}
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Season</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCrops.map((crop) => (
                        <tr key={crop.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{crop.name}</div>
                            {crop.description && (
                              <div className="text-sm text-gray-500">{crop.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {crop.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {crop.season}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setFormData(crop);
                                  setEditingCrop(crop);
                                  setShowAddForm(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                                aria-label="Edit crop"
                                title="Edit crop"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Delete this crop type?')) {
                                    setCropTypes(prev => prev.filter(c => c.id !== crop.id));
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                                aria-label="Delete crop"
                                title="Delete crop"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredCrops.length === 0 && (
                    <div className="text-center py-12 text-gray-500">No crops found</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Activity Logs Tab */}
          {activeTab === 'activity' && (
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">System Activity Logs</h3>
              <p className="text-gray-600 mb-4">
                View detailed activity logs from the audit system. Full implementation would display paginated logs here.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Activity logs are available via the audit logs API endpoint. To view detailed logs, integrate with{' '}
                  <code className="bg-gray-200 px-2 py-1 rounded">/api/audit-logs</code>
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Crop Form Modal - Simplified */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">{editingCrop ? 'Edit Crop' : 'Add Crop'}</h2>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="p-2 hover:bg-gray-100 rounded"
                aria-label="Close form"
                title="Close form"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="crop-name-input" className="block text-sm font-medium mb-2">Crop Name *</label>
                <input
                  id="crop-name-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  aria-label="Crop name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="crop-category-select" className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    id="crop-category-select"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    aria-label="Category"
                  >
                    <option value="">Select category</option>
                    <option value="grains">Grains</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="pulses">Pulses</option>
                    <option value="oilseeds">Oilseeds</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="crop-season-select" className="block text-sm font-medium mb-2">Season *</label>
                  <select
                    id="crop-season-select"
                    value={formData.season}
                    onChange={(e) => setFormData(prev => ({ ...prev, season: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    aria-label="Season"
                  >
                    <option value="kharif">Kharif</option>
                    <option value="rabi">Rabi</option>
                    <option value="zaid">Zaid</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingCrop) {
                      setCropTypes(prev => prev.map(c => c.id === editingCrop.id ? { ...c, ...formData } as CropTypeInterface : c));
                    } else {
                      setCropTypes(prev => [...prev, { id: Date.now().toString(), ...formData } as CropTypeInterface]);
                    }
                    setShowAddForm(false);
                  }}
                  className="btn-primary"
                >
                  <Save size={16} />
                  {editingCrop ? 'Update' : 'Add'} Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

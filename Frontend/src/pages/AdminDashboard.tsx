// Admin Dashboard - Crop Management
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CropType } from '../types';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Save,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [filteredCrops, setFilteredCrops] = useState<CropType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropType | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState<Partial<CropType>>({
    name: '',
    category: '',
    season: 'kharif',
    suitableSoilTypes: [],
    averageYield: 0,
    growthPeriod: 0,
    waterRequirement: 'medium',
    description: '',
  });

  // Mock data - replace with API calls
  useEffect(() => {
    const fetchCropTypes = async () => {
      setLoading(true);
      try {
        // Simulate API call
        const mockCrops: CropType[] = [
          {
            id: '1',
            name: 'Wheat',
            category: 'grains',
            season: 'rabi',
            suitableSoilTypes: ['loamy', 'clayey'],
            averageYield: 3000,
            growthPeriod: 120,
            waterRequirement: 'medium',
            description: 'Winter cereal grain',
          },
          {
            id: '2',
            name: 'Rice',
            category: 'grains',
            season: 'kharif',
            suitableSoilTypes: ['clayey', 'loamy'],
            averageYield: 4000,
            growthPeriod: 150,
            waterRequirement: 'high',
            description: 'Major staple food crop',
          },
          {
            id: '3',
            name: 'Tomato',
            category: 'vegetables',
            season: 'zaid',
            suitableSoilTypes: ['loamy', 'sandy'],
            averageYield: 2500,
            growthPeriod: 90,
            waterRequirement: 'medium',
            description: 'Popular vegetable crop',
          },
        ];

        setCropTypes(mockCrops);
        setFilteredCrops(mockCrops);
      } catch (error) {
        console.error('Error fetching crop types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCropTypes();
  }, []);

  // Filter crops based on search and category
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

  const categories = ['all', 'grains', 'vegetables', 'fruits', 'pulses', 'oilseeds'];
  const seasons = ['kharif', 'rabi', 'zaid'];
  const soilTypes = ['sandy', 'loamy', 'clayey', 'silty', 'peaty'];
  const waterRequirements = ['low', 'medium', 'high'];

  const resetForm = () => {
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
  };

  const handleAddCrop = () => {
    resetForm();
    setShowAddForm(true);
    setEditingCrop(null);
  };

  const handleEditCrop = (crop: CropType) => {
    setFormData(crop);
    setEditingCrop(crop);
    setShowAddForm(true);
  };

  const handleDeleteCrop = async (cropId: string) => {
    if (window.confirm('Are you sure you want to delete this crop type?')) {
      try {
        // Simulate API call
        setCropTypes(prev => prev.filter(crop => crop.id !== cropId));
        setFilteredCrops(prev => prev.filter(crop => crop.id !== cropId));
      } catch (error) {
        console.error('Error deleting crop:', error);
      }
    }
  };

  const handleSaveCrop = async () => {
    try {
      if (editingCrop) {
        // Update existing crop
        const updatedCrop = { ...editingCrop, ...formData };
        setCropTypes(prev => prev.map(crop =>
          crop.id === editingCrop.id ? updatedCrop : crop
        ));
      } else {
        // Add new crop
        const newCrop: CropType = {
          id: Date.now().toString(),
          ...formData as Omit<CropType, 'id'>,
        };
        setCropTypes(prev => [...prev, newCrop]);
      }

      setShowAddForm(false);
      resetForm();
      setEditingCrop(null);
    } catch (error) {
      console.error('Error saving crop:', error);
    }
  };

  const handleSoilTypeToggle = (soilType: string) => {
    setFormData(prev => ({
      ...prev,
      suitableSoilTypes: prev.suitableSoilTypes?.includes(soilType)
        ? prev.suitableSoilTypes.filter(type => type !== soilType)
        : [...(prev.suitableSoilTypes || []), soilType]
    }));
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage crop types and varieties</p>
        </div>
        <button
          onClick={handleAddCrop}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} />
          Add New Crop
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search crops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCrop ? 'Edit Crop Type' : 'Add New Crop Type'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                    setEditingCrop(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Crop Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {categories.filter(cat => cat !== 'all').map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData(prev => ({ ...prev, season: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {seasons.map(season => (
                      <option key={season} value={season}>
                        {season.charAt(0).toUpperCase() + season.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Water Requirement</label>
                  <select
                    value={formData.waterRequirement}
                    onChange={(e) => setFormData(prev => ({ ...prev, waterRequirement: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {waterRequirements.map(req => (
                      <option key={req} value={req}>
                        {req.charAt(0).toUpperCase() + req.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Average Yield (kg/acre)</label>
                  <input
                    type="number"
                    value={formData.averageYield}
                    onChange={(e) => setFormData(prev => ({ ...prev, averageYield: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Growth Period (days)</label>
                  <input
                    type="number"
                    value={formData.growthPeriod}
                    onChange={(e) => setFormData(prev => ({ ...prev, growthPeriod: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Suitable Soil Types</label>
                <div className="flex flex-wrap gap-2">
                  {soilTypes.map(soilType => (
                    <label key={soilType} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.suitableSoilTypes?.includes(soilType) || false}
                        onChange={() => handleSoilTypeToggle(soilType)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{soilType}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Optional description of the crop..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                  setEditingCrop(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCrop}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Save size={16} />
                {editingCrop ? 'Update Crop' : 'Add Crop'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crop Types Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crop Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category & Season
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requirements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCrops.map((crop) => (
                  <tr key={crop.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{crop.name}</div>
                        <div className="text-sm text-gray-500">{crop.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{crop.category}</div>
                      <div className="text-sm text-gray-500 capitalize">{crop.season}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Yield: {crop.averageYield}kg/acre
                      </div>
                      <div className="text-sm text-gray-500">
                        Water: {crop.waterRequirement} • Growth: {crop.growthPeriod} days
                      </div>
                      <div className="text-sm text-gray-500">
                        Soil: {crop.suitableSoilTypes.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCrop(crop)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCrop(crop.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
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
              <div className="text-center py-12">
                <CheckCircle size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No crops found</h3>
                <p className="text-gray-500">
                  {searchTerm || selectedCategory !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by adding your first crop type.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
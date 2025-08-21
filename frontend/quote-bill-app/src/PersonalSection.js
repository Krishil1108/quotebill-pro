import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Search, ShoppingCart, Package, ArrowLeft, Settings, Edit, BarChart3, TrendingUp, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

const API_BASE_URL = 'http://localhost:5000/api';

const PersonalSection = ({ onBack, isDarkTheme }) => {
  const [activeTab, setActiveTab] = useState('materials');
  const [materials, setMaterials] = useState([]);
  const [personalQuotations, setPersonalQuotations] = useState([]);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showEditMaterial, setShowEditMaterial] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [showCreateQuotation, setShowCreateQuotation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Material form state
  const [materialForm, setMaterialForm] = useState({
    itemName: '',
    category: 'general',
    rate: '',
    quantity: '',
    unit: 'pcs',
    supplier: '',
    notes: ''
  });

  // Quotation form state
  const [quotationForm, setQuotationForm] = useState({
    quotationName: '',
    description: ''
  });

  const [selectedMaterials, setSelectedMaterials] = useState([]);
  
  // Custom category states
  const [customCategories, setCustomCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#F0F8FF' });

  const defaultCategories = [
    { value: 'tubelights', label: 'Tubelights', color: '#E8F4F8' },
    { value: 'hanging_lights', label: 'Hanging Lights', color: '#F0F8E8' },
    { value: 'spotlights', label: 'Spotlights', color: '#FFF2E8' },
    { value: 'wire_coils', label: 'Wire Coils', color: '#F8E8F4' },
    { value: 'switches', label: 'Switches', color: '#E8F0F8' },
    { value: 'sockets', label: 'Sockets', color: '#F4F8E8' },
    { value: 'fans', label: 'Fans', color: '#E8F8F0' },
    { value: 'conduits', label: 'Conduits & Pipes', color: '#F8F0E8' },
    { value: 'cables', label: 'Cables', color: '#F0E8F8' },
    { value: 'panels', label: 'Electrical Panels', color: '#E8F8F4' },
    { value: 'transformers', label: 'Transformers', color: '#F8E8E8' },
    { value: 'motors', label: 'Motors', color: '#E8E8F8' },
    { value: 'sensors', label: 'Sensors', color: '#F8F8E8' },
    { value: 'tools', label: 'Tools & Equipment', color: '#E8F4F0' },
    { value: 'safety', label: 'Safety Equipment', color: '#F4E8F0' },
    { value: 'general', label: 'General', color: '#F8F8F8' }
  ];

  // Combine default and custom categories
  const materialCategories = [...defaultCategories, ...customCategories];

  const units = ['pcs', 'nos', 'meters', 'sets', 'feet', 'kg', 'boxes'];

  // API Functions
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/materials?search=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setMaterials(data.materials || []);
      } else {
        setError('Failed to fetch materials');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalQuotations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/personal-quotations`);
      if (response.ok) {
        const data = await response.json();
        setPersonalQuotations(data.quotations || []);
      } else {
        setError('Failed to fetch quotations');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.itemName.trim() || !materialForm.rate || !materialForm.quantity) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialForm),
      });
      
      if (response.ok) {
        const newMaterial = await response.json();
        setMaterials([newMaterial, ...materials]);
        setMaterialForm({
          itemName: '',
          category: 'general',
          rate: '',
          quantity: '',
          unit: 'pcs',
          supplier: '',
          notes: ''
        });
        setShowAddMaterial(false);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add material');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/materials/${materialId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setMaterials(materials.filter(m => m._id !== materialId));
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete material');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const editMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.itemName.trim() || !materialForm.rate || !materialForm.quantity) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/materials/${editingMaterial._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialForm),
      });
      
      if (response.ok) {
        const updatedMaterial = await response.json();
        setMaterials(materials.map(m => m._id === editingMaterial._id ? updatedMaterial : m));
        setMaterialForm({
          itemName: '',
          category: 'general',
          rate: '',
          quantity: '',
          unit: 'pcs',
          supplier: '',
          notes: ''
        });
        setShowEditMaterial(false);
        setEditingMaterial(null);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update material');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditMaterial = (material) => {
    setEditingMaterial(material);
    setMaterialForm({
      itemName: material.itemName,
      category: material.category,
      rate: material.rate,
      quantity: material.quantity,
      unit: material.unit,
      supplier: material.supplier || '',
      notes: material.notes || ''
    });
    setShowEditMaterial(true);
  };

  const createPersonalQuotation = async (e) => {
    e.preventDefault();
    if (!quotationForm.quotationName.trim()) {
      setError('Please enter a quotation name');
      return;
    }
    
    if (selectedMaterials.length === 0) {
      setError('Please select at least one material for the quotation');
      return;
    }

    try {
      setLoading(true);
      const quotationData = {
        quotationName: quotationForm.quotationName,
        description: quotationForm.description,
        materials: selectedMaterials.map(materialId => {
          const material = materials.find(m => m._id === materialId);
          return {
            materialId: material._id,
            itemName: material.itemName,
            category: material.category,
            rate: material.rate,
            quantity: material.quantity,
            unit: material.unit,
            totalAmount: material.rate * material.quantity
          };
        }),
        status: 'draft'
      };

      const response = await fetch(`${API_BASE_URL}/personal-quotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotationData),
      });
      
      if (response.ok) {
        const newQuotation = await response.json();
        setPersonalQuotations([newQuotation, ...personalQuotations]);
        setQuotationForm({
          quotationName: '',
          description: ''
        });
        setSelectedMaterials([]);
        setShowCreateQuotation(false);
        setError('');
        // Switch to quotations tab to see the new quotation
        setActiveTab('quotations');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create quotation');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Custom Category Functions
  const addCustomCategory = () => {
    if (!newCategory.name.trim()) {
      setError('Please enter a category name');
      return;
    }
    
    const categoryValue = newCategory.name.toLowerCase().replace(/\s+/g, '_');
    const newCategoryObj = {
      value: categoryValue,
      label: newCategory.name,
      color: newCategory.color,
      isCustom: true
    };
    
    setCustomCategories([...customCategories, newCategoryObj]);
    setNewCategory({ name: '', color: '#F0F8FF' });
    setShowAddCategory(false);
  };

  const removeCustomCategory = (categoryValue) => {
    setCustomCategories(customCategories.filter(cat => cat.value !== categoryValue));
  };

  // Analytics Functions
  const getCategoryAnalytics = () => {
    const categoryStats = materials.reduce((acc, material) => {
      const category = material.category || 'general';
      const categoryInfo = materialCategories.find(cat => cat.value === category);
      const categoryName = categoryInfo ? categoryInfo.label : 'General';
      
      if (!acc[categoryName]) {
        acc[categoryName] = { 
          count: 0, 
          totalValue: 0,
          color: categoryInfo ? categoryInfo.color : '#F8F8F8'
        };
      }
      acc[categoryName].count += 1;
      acc[categoryName].totalValue += (parseFloat(material.rate) || 0) * (parseFloat(material.quantity) || 0);
      return acc;
    }, {});

    return Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      count: stats.count,
      totalValue: stats.totalValue,
      color: stats.color
    }));
  };

  const getMonthlyPurchaseData = () => {
    const monthlyData = materials.reduce((acc, material) => {
      const date = new Date(material.createdAt || material.dateAdded || Date.now());
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = { month: monthYear, purchases: 0, value: 0 };
      }
      acc[monthYear].purchases += 1;
      acc[monthYear].value += (parseFloat(material.rate) || 0) * (parseFloat(material.quantity) || 0);
      return acc;
    }, {});

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  };

  const getQuotationStats = () => {
    const totalQuotations = personalQuotations.length;
    const totalQuotationValue = personalQuotations.reduce((sum, quot) => {
      return sum + (quot.materials || []).reduce((materialSum, mat) => {
        return materialSum + ((parseFloat(mat.rate) || 0) * (parseFloat(mat.quantity) || 0));
      }, 0);
    }, 0);

    return { totalQuotations, totalQuotationValue };
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ffff00'];

  // Load data on component mount and tab change
  useEffect(() => {
    if (activeTab === 'materials') {
      fetchMaterials();
    } else if (activeTab === 'quotations') {
      fetchPersonalQuotations();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'materials') {
      fetchMaterials();
    }
  }, [searchQuery]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const filteredMaterials = materials.filter(material =>
    material.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                <ArrowLeft size={16} />
                <span>Back to Home</span>
              </button>
              <h1 className="text-2xl font-bold">Personal Material Management</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button onClick={() => setError('')} className="float-right font-bold text-red-700">&times;</button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'materials'
                ? isDarkTheme ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 border border-blue-300'
                : isDarkTheme ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package size={18} />
            <span>Materials ({materials.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('quotations')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'quotations'
                ? isDarkTheme ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 border border-blue-300'
                : isDarkTheme ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShoppingCart size={18} />
            <span>Personal Quotations ({personalQuotations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'analytics'
                ? isDarkTheme ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 border border-blue-300'
                : isDarkTheme ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'settings'
                ? isDarkTheme ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 border border-blue-300'
                : isDarkTheme ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* Materials Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkTheme ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>
            <button
              onClick={() => setShowAddMaterial(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Plus size={20} />
              <span>Add Material</span>
            </button>
          </div>

          {/* Materials Grid */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2">Loading materials...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => {
                const categoryInfo = materialCategories.find(cat => cat.value === material.category);
                const bgColor = categoryInfo ? categoryInfo.color : '#F8F8F8';
                return (
                <div
                  key={material._id}
                  className={`p-6 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}
                  style={{ backgroundColor: isDarkTheme ? 'rgb(31 41 55)' : bgColor }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{material.itemName}</h3>
                      <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-white bg-opacity-80 text-gray-700'} shadow-sm`}>
                        {materialCategories.find(cat => cat.value === material.category)?.label || material.category}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditMaterial(material)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit material"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteMaterial(material._id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete material"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rate:</span>
                      <span className="font-medium">{formatCurrency(material.rate)}/{material.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-medium">{material.quantity} {material.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(material.totalAmount)}</span>
                    </div>
                    {material.supplier && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Supplier:</span>
                        <span className="font-medium">{material.supplier}</span>
                      </div>
                    )}
                    {material.notes && (
                      <div className="mt-2">
                        <span className="text-gray-500 text-xs">Notes:</span>
                        <p className="text-xs mt-1">{material.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {!loading && filteredMaterials.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No materials found</h3>
              <p className="text-gray-400">
                {searchQuery ? 'Try adjusting your search terms' : 'Add your first material to get started'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Personal Quotations Tab */}
      {activeTab === 'quotations' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* Quotations Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Personal Quotations</h2>
            <button
              onClick={() => setShowCreateQuotation(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Plus size={20} />
              <span>Create Quotation</span>
            </button>
          </div>

          {/* Quotations List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2">Loading quotations...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {personalQuotations.map((quotation) => (
                <div
                  key={quotation._id}
                  className={`p-6 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{quotation.quotationName}</h3>
                      {quotation.description && (
                        <p className="text-gray-500 mt-1">{quotation.description}</p>
                      )}
                      <span className={`inline-block px-3 py-1 text-xs rounded-full mt-2 font-medium shadow-sm ${
                        quotation.status === 'draft' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        quotation.status === 'ready' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {quotation.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(quotation.totalQuotationAmount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {quotation.materials?.length || 0} materials
                      </div>
                    </div>
                  </div>
                  
                  {quotation.materials && quotation.materials.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium mb-2">Materials:</h4>
                      <div className="space-y-1 text-sm">
                        {quotation.materials.map((material, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{material.itemName}</span>
                            <span>{material.quantity} × {formatCurrency(material.rate)} = {formatCurrency(material.totalAmount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 text-xs text-gray-500">
                    Created: {new Date(quotation.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && personalQuotations.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No quotations found</h3>
              <p className="text-gray-400">Create your first personal quotation</p>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`p-6 rounded-lg ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'} border shadow-sm`}>
                <div className="flex items-center">
                  <Package className="h-10 w-10 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-blue-600">{materials.length}</p>
                    <p className="text-sm text-gray-600">Total Materials</p>
                  </div>
                </div>
              </div>
              
              <div className={`p-6 rounded-lg ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'} border shadow-sm`}>
                <div className="flex items-center">
                  <ShoppingCart className="h-10 w-10 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-green-600">{personalQuotations.length}</p>
                    <p className="text-sm text-gray-600">Quotations Made</p>
                  </div>
                </div>
              </div>
              
              <div className={`p-6 rounded-lg ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'} border shadow-sm`}>
                <div className="flex items-center">
                  <TrendingUp className="h-10 w-10 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(materials.reduce((sum, m) => sum + ((parseFloat(m.rate) || 0) * (parseFloat(m.quantity) || 0)), 0))}
                    </p>
                    <p className="text-sm text-gray-600">Stock Value</p>
                  </div>
                </div>
              </div>
              
              <div className={`p-6 rounded-lg ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'} border shadow-sm`}>
                <div className="flex items-center">
                  <BarChart3 className="h-10 w-10 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(getQuotationStats().totalQuotationValue)}
                    </p>
                    <p className="text-sm text-gray-600">Quotation Value</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution Chart */}
              <div className={`p-6 rounded-lg ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <PieChart className="mr-2" size={20} />
                  Material Categories
                </h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <RechartsPieChart>
                      <PieChart dataKey="count" data={getCategoryAnalytics()}>
                        {getCategoryAnalytics().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </PieChart>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Purchase Trend */}
              <div className={`p-6 rounded-lg ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart3 className="mr-2" size={20} />
                  Purchase Trends (Last 6 Months)
                </h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={getMonthlyPurchaseData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="purchases" fill="#8884d8" name="Purchases" />
                      <Bar dataKey="value" fill="#82ca9d" name="Value (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Category Details Table */}
            <div className={`p-6 rounded-lg ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
              <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className={`${isDarkTheme ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                      <th className="text-left py-2">Category</th>
                      <th className="text-left py-2">Items Count</th>
                      <th className="text-left py-2">Total Value</th>
                      <th className="text-left py-2">Average Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCategoryAnalytics().map((category, index) => (
                      <tr key={index} className={`${isDarkTheme ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: category.color }}></div>
                            {category.category}
                          </div>
                        </td>
                        <td className="py-3">{category.count}</td>
                        <td className="py-3">{formatCurrency(category.totalValue)}</td>
                        <td className="py-3">{formatCurrency(category.totalValue / category.count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="max-w-4xl mx-auto">
            <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'} p-6`}>
              <h2 className="text-xl font-semibold mb-6">Personal Settings</h2>
              
              <div className="space-y-6">
                {/* Data Management */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Data Management</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Export Materials Data</h4>
                        <p className="text-sm text-gray-500">Download your materials data as CSV</p>
                      </div>
                      <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-sm hover:shadow-md">
                        Export CSV
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Export Quotations Data</h4>
                        <p className="text-sm text-gray-500">Download your quotations data as CSV</p>
                      </div>
                      <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-sm hover:shadow-md">
                        Export CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-2xl font-bold text-blue-600">{materials.length}</div>
                      <div className="text-sm text-gray-500">Total Materials</div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-2xl font-bold text-green-600">{personalQuotations.length}</div>
                      <div className="text-sm text-gray-500">Total Quotations</div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(
                          personalQuotations.reduce((sum, q) => sum + (q.totalQuotationAmount || 0), 0)
                        )}
                      </div>
                      <div className="text-sm text-gray-500">Total Quotation Value</div>
                    </div>
                  </div>
                </div>

                {/* Categories Management */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Material Categories</h3>
                    <button
                      onClick={() => setShowAddCategory(true)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-sm hover:shadow-md text-sm"
                    >
                      <Plus size={16} />
                      <span>Add Category</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {materialCategories.map((category) => (
                      <div
                        key={category.value}
                        className={`p-4 rounded-lg text-center border transition-all duration-300 ${isDarkTheme ? 'bg-gray-700 border-gray-600' : 'border-gray-200'} hover:shadow-md`}
                        style={{ backgroundColor: isDarkTheme ? 'rgb(55 65 81)' : category.color }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">{category.label}</div>
                          {category.isCustom && (
                            <button
                              onClick={() => removeCustomCategory(category.value)}
                              className="text-red-400 hover:text-red-600 text-xs"
                              title="Remove custom category"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {materials.filter(m => m.category === category.value).length} items
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {showAddMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Material</h3>
              <button
                onClick={() => setShowAddMaterial(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Item Name *</label>
                <input
                  type="text"
                  value={materialForm.itemName}
                  onChange={(e) => setMaterialForm({...materialForm, itemName: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={materialForm.category}
                  onChange={(e) => setMaterialForm({...materialForm, category: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  {materialCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rate (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={materialForm.rate}
                    onChange={(e) => setMaterialForm({...materialForm, rate: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={materialForm.quantity}
                    onChange={(e) => setMaterialForm({...materialForm, quantity: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <select
                  value={materialForm.unit}
                  onChange={(e) => setMaterialForm({...materialForm, unit: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Supplier</label>
                <input
                  type="text"
                  value={materialForm.supplier}
                  onChange={(e) => setMaterialForm({...materialForm, supplier: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={materialForm.notes}
                  onChange={(e) => setMaterialForm({...materialForm, notes: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  rows="2"
                />
              </div>

              {materialForm.rate && materialForm.quantity && (
                <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                  <div className="text-sm font-medium">
                    Total Amount: {formatCurrency(materialForm.rate * materialForm.quantity)}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMaterial(false)}
                  className={`flex-1 px-4 py-2 border rounded-lg ${isDarkTheme ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Material Modal */}
      {showEditMaterial && editingMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Material</h3>
              <button
                onClick={() => {
                  setShowEditMaterial(false);
                  setEditingMaterial(null);
                  setMaterialForm({
                    itemName: '',
                    category: 'general',
                    rate: '',
                    quantity: '',
                    unit: 'pcs',
                    supplier: '',
                    notes: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={editMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Item Name *</label>
                <input
                  type="text"
                  value={materialForm.itemName}
                  onChange={(e) => setMaterialForm({...materialForm, itemName: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={materialForm.category}
                  onChange={(e) => setMaterialForm({...materialForm, category: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  {materialCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rate (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={materialForm.rate}
                    onChange={(e) => setMaterialForm({...materialForm, rate: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={materialForm.quantity}
                    onChange={(e) => setMaterialForm({...materialForm, quantity: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <select
                  value={materialForm.unit}
                  onChange={(e) => setMaterialForm({...materialForm, unit: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Supplier</label>
                <input
                  type="text"
                  value={materialForm.supplier}
                  onChange={(e) => setMaterialForm({...materialForm, supplier: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={materialForm.notes}
                  onChange={(e) => setMaterialForm({...materialForm, notes: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  rows="2"
                />
              </div>

              {materialForm.rate && materialForm.quantity && (
                <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                  <div className="text-sm font-medium">
                    Total Amount: {formatCurrency(materialForm.rate * materialForm.quantity)}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditMaterial(false);
                    setEditingMaterial(null);
                  }}
                  className={`flex-1 px-4 py-2 border rounded-lg ${isDarkTheme ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Quotation Modal */}
      {showCreateQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Personal Quotation</h3>
              <button
                onClick={() => {
                  setShowCreateQuotation(false);
                  setSelectedMaterials([]);
                  setQuotationForm({
                    quotationName: '',
                    description: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createPersonalQuotation} className="space-y-6">
              {/* Quotation Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quotation Name *</label>
                  <input
                    type="text"
                    value={quotationForm.quotationName}
                    onChange={(e) => setQuotationForm({...quotationForm, quotationName: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="e.g., Office Renovation Quotation"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={quotationForm.description}
                    onChange={(e) => setQuotationForm({...quotationForm, description: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    rows="3"
                    placeholder="Optional description for this quotation"
                  />
                </div>
              </div>

              {/* Material Selection */}
              <div>
                <h4 className="font-medium mb-3">Select Materials *</h4>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  {materials.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No materials available. Add materials first.</p>
                  ) : (
                    <div className="space-y-2">
                      {materials.map((material) => (
                        <label
                          key={material._id}
                          className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                            selectedMaterials.includes(material._id) 
                              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedMaterials.includes(material._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMaterials([...selectedMaterials, material._id]);
                              } else {
                                setSelectedMaterials(selectedMaterials.filter(id => id !== material._id));
                              }
                            }}
                            className="mt-1 text-green-600 rounded focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{material.itemName}</div>
                                <div className="text-sm text-gray-500">
                                  {materialCategories.find(cat => cat.value === material.category)?.label}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{formatCurrency(material.rate * material.quantity)}</div>
                                <div className="text-sm text-gray-500">
                                  {material.quantity} {material.unit} × {formatCurrency(material.rate)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Materials Summary */}
              {selectedMaterials.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4 rounded-lg">
                  <h5 className="font-medium mb-2 text-emerald-700">Selected Materials Summary:</h5>
                  <div className="space-y-1 text-sm">
                    {selectedMaterials.map(materialId => {
                      const material = materials.find(m => m._id === materialId);
                      return (
                        <div key={materialId} className="flex justify-between">
                          <span>{material.itemName}</span>
                          <span>{formatCurrency(material.rate * material.quantity)}</span>
                        </div>
                      );
                    })}
                    <div className="border-t pt-2 mt-2 font-medium">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span>{formatCurrency(
                          selectedMaterials.reduce((sum, materialId) => {
                            const material = materials.find(m => m._id === materialId);
                            return sum + (material.rate * material.quantity);
                          }, 0)
                        )}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateQuotation(false);
                    setSelectedMaterials([]);
                    setQuotationForm({
                      quotationName: '',
                      description: ''
                    });
                  }}
                  className={`flex-1 px-4 py-2 border rounded-lg ${isDarkTheme ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedMaterials.length === 0}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-full max-w-md mx-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Custom Category</h3>
              <button
                onClick={() => setShowAddCategory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name *</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter category name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="h-10 w-20 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">Choose a color for this category</span>
                </div>
              </div>
              
              {/* Color Preview */}
              <div>
                <label className="block text-sm font-medium mb-2">Preview</label>
                <div 
                  className="p-3 rounded-lg border text-center text-sm font-medium"
                  style={{ backgroundColor: newCategory.color, color: '#374151' }}
                >
                  {newCategory.name || 'Category Preview'}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddCategory(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addCustomCategory}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalSection;

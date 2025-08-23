import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Search, ShoppingCart, Package, ArrowLeft, Settings, Edit, BarChart3, TrendingUp, PieChart, Menu, Sun, Moon, Download, FileEdit, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://quotebill-pro.onrender.com/api';

const PersonalSection = ({ onBack, isDarkTheme, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState('materials');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  
  // Edit quotation states
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [showEditQuotation, setShowEditQuotation] = useState(false);
  
  // Custom category states
  const [customCategories, setCustomCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
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

  // Handle browser back button and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Handle Escape key or Alt+Left to go back to landing
      if (event.key === 'Escape' || (event.altKey && event.key === 'ArrowLeft')) {
        event.preventDefault();
        onBack();
      }
      // Handle Alt+Right or Ctrl+Right to close modals/overlays
      else if ((event.altKey && event.key === 'ArrowRight') || (event.ctrlKey && event.key === 'ArrowRight')) {
        if (showAddMaterial) setShowAddMaterial(false);
        if (showEditMaterial) setShowEditMaterial(false);
        if (showCreateQuotation) setShowCreateQuotation(false);
        if (showAddCategory) setShowAddCategory(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, showAddMaterial, showEditMaterial, showCreateQuotation, showAddCategory]);

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
    
    console.log('Adding material with form data:', materialForm);
    console.log('Available custom categories:', customCategories);
    
    if (!materialForm.itemName.trim() || !materialForm.rate || !materialForm.quantity) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      // Create material data with proper category handling
      const materialData = {
        ...materialForm,
        itemName: materialForm.itemName.trim(),
        rate: parseFloat(materialForm.rate),
        quantity: parseFloat(materialForm.quantity)
      };
      
      console.log('Sending material data to API:', materialData);
      
      const response = await fetch(`${API_BASE_URL}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      });
      
      console.log('Add material response status:', response.status);
      
      if (response.ok) {
        const newMaterial = await response.json();
        console.log('New material created:', newMaterial);
        
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
        console.error('Add material API error:', errorData);
        setError(errorData.error || 'Failed to add material');
      }
    } catch (error) {
      console.error('Add material network error:', error);
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
    
    console.log('Creating quotation with data:', {
      quotationName: quotationForm.quotationName,
      description: quotationForm.description,
      selectedMaterials: selectedMaterials,
      materials: materials
    });

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
      setError(''); // Clear previous errors
      
      const quotationData = {
        quotationName: quotationForm.quotationName.trim(),
        description: quotationForm.description?.trim() || '',
        materials: selectedMaterials.map(materialId => {
          const material = materials.find(m => m._id === materialId);
          if (!material) {
            throw new Error(`Material with ID ${materialId} not found`);
          }
          return {
            materialId: material._id,
            itemName: material.itemName,
            category: material.category,
            rate: parseFloat(material.rate),
            quantity: parseFloat(material.quantity),
            unit: material.unit,
            totalAmount: parseFloat(material.rate) * parseFloat(material.quantity)
          };
        }),
        status: 'draft'
      };

      console.log('Sending quotation data to API:', quotationData);

      const response = await fetch(`${API_BASE_URL}/personal-quotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotationData),
      });
      
      console.log('API response status:', response.status);
      
      if (response.ok) {
        const newQuotation = await response.json();
        console.log('New quotation created:', newQuotation);
        
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
        console.error('API error response:', errorData);
        setError(errorData.error || 'Failed to create quotation');
      }
    } catch (error) {
      console.error('Create quotation error:', error);
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit quotation function
  const editQuotation = (quotation) => {
    console.log('🚀 editQuotation function called!');
    console.log('📋 Editing quotation:', quotation);
    console.log('🔧 Quotation materials:', quotation.materials);
    
    console.log('🎯 Setting editingQuotation state...');
    setEditingQuotation(quotation);
    
    console.log('📝 Setting quotationForm...');
    setQuotationForm({
      quotationName: quotation.quotationName,
      description: quotation.description || ''
    });
    
    // Handle different material ID structures
    const materialIds = [];
    console.log('🔧 Processing quotation materials:', quotation.materials);
    console.log('🔧 Available materials for matching:', materials.map(m => ({ id: m._id, name: m.itemName })));
    
    if (quotation.materials && Array.isArray(quotation.materials)) {
      quotation.materials.forEach((material, index) => {
        console.log(`🔧 Processing material ${index}:`, material);
        
        // Try different possible ID fields
        let materialId = material._id || material.materialId || material.id;
        
        if (materialId) {
          // Check if this ID exists in our current materials list
          const existingMaterial = materials.find(m => m._id === materialId);
          if (existingMaterial) {
            materialIds.push(materialId);
            console.log(`✅ Direct ID match found for ${material.itemName}: ${materialId}`);
          } else {
            console.log(`⚠️ Direct ID ${materialId} not found, trying name match...`);
            // If ID doesn't exist, try to find by name
            const matchingMaterial = materials.find(m => m.itemName === material.itemName);
            if (matchingMaterial) {
              materialIds.push(matchingMaterial._id);
              console.log(`✅ Name match found for ${material.itemName}: ${matchingMaterial._id}`);
            } else {
              console.error(`❌ No match found for material: ${material.itemName}`);
            }
          }
        } else {
          console.warn('⚠️ Material without ID found:', material);
          // If no ID found, try to match by name with existing materials
          const matchingMaterial = materials.find(m => m.itemName === material.itemName);
          if (matchingMaterial) {
            materialIds.push(matchingMaterial._id);
            console.log(`✅ Name-only match found for ${material.itemName}: ${matchingMaterial._id}`);
          } else {
            console.error(`❌ No name match found for material: ${material.itemName}`);
          }
        }
      });
    }
    
    console.log('🎯 Selected material IDs:', materialIds);
    setSelectedMaterials(materialIds);
    
    console.log('🔓 Setting showEditQuotation to true...');
    setShowEditQuotation(true);
    console.log('✅ Edit function completed!');
    
    setError('');
  };

  // Update quotation function
  const updateQuotation = async () => {
    if (!quotationForm.quotationName.trim()) {
      setError('Please enter a quotation name');
      return;
    }

    if (selectedMaterials.length === 0) {
      setError('Please select at least one material');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔄 Updating quotation with selected materials:', selectedMaterials);
      console.log('📦 Available materials:', materials.map(m => ({ id: m._id, name: m.itemName })));
      console.log('📝 Original quotation materials:', editingQuotation?.materials);
      
      // Enhanced material matching logic
      const selectedMaterialsData = [];
      
      for (const selectedId of selectedMaterials) {
        // First try direct ID match
        let material = materials.find(m => m._id === selectedId);
        
        if (!material) {
          // If no direct match, try to find by name from original quotation
          const originalMaterial = editingQuotation?.materials?.find(m => 
            (m._id === selectedId || m.materialId === selectedId || m.id === selectedId)
          );
          
          if (originalMaterial) {
            material = materials.find(m => m.itemName === originalMaterial.itemName);
          }
        }
        
        if (material) {
          selectedMaterialsData.push(material);
          console.log('✅ Material found:', material.itemName, 'ID:', material._id);
        } else {
          console.error('❌ Material not found for ID:', selectedId);
        }
      }
      
      console.log('🔍 Filtered materials data:', selectedMaterialsData);
      
      if (selectedMaterialsData.length === 0) {
        setError('No valid materials found for selected IDs. Please try refreshing and selecting materials again.');
        setLoading(false);
        return;
      }
      
      // Transform materials to the format expected by backend
      const transformedMaterials = selectedMaterialsData.map(material => ({
        materialId: material._id,
        quantity: material.quantity || 1,
        rate: material.rate
      }));

      const quotationData = {
        quotationName: quotationForm.quotationName.trim(),
        description: quotationForm.description?.trim() || '',
        materials: transformedMaterials,
        totalQuotationAmount: selectedMaterialsData.reduce((total, material) => {
          return total + (material.rate * material.quantity);
        }, 0),
        status: 'ready'
      };

      console.log('Sending quotation update:', quotationData);
      console.log('📋 Materials being sent to backend:');
      quotationData.materials.forEach((material, index) => {
        console.log(`  Material ${index}:`, {
          _id: material._id,
          materialId: material.materialId,
          id: material.id,
          itemName: material.itemName,
          fullObject: material
        });
      });

      const response = await fetch(`${API_BASE_URL}/personal-quotations/${editingQuotation._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotationData)
      });

      if (response.ok) {
        await fetchPersonalQuotations();
        setQuotationForm({
          quotationName: '',
          description: ''
        });
        setSelectedMaterials([]);
        setShowEditQuotation(false);
        setEditingQuotation(null);
        setError('');
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        setError(errorData.error || 'Failed to update quotation');
      }
    } catch (error) {
      console.error('Update quotation error:', error);
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete quotation function
  const deleteQuotation = async (quotationId, quotationName) => {
    if (!window.confirm(`Are you sure you want to delete "${quotationName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/personal-quotations/${quotationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPersonalQuotations();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete quotation');
      }
    } catch (error) {
      console.error('Delete quotation error:', error);
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Export to PDF function
  const exportToPDF = async (quotation) => {
    try {
      setLoading(true);
      console.log('Exporting quotation to PDF:', quotation);
      
      // Create the PDF data structure
      const pdfData = {
        type: 'estimate',
        clientInfo: {
          name: 'Personal Quotation',
          email: '',
          phone: '',
          address: ''
        },
        items: quotation.materials?.map(material => ({
          itemName: material.itemName || 'Unknown Item',
          description: material.description || material.notes || '',
          quantity: material.quantity || 1,
          unit: material.unit || 'pcs',
          rate: material.rate || 0,
          amount: (material.rate || 0) * (material.quantity || 1)
        })) || [],
        letterhead: {
          companyName: 'Personal Quotation System',
          address: '',
          phone: '',
          email: '',
          website: '',
          logo: null
        }
      };

      console.log('PDF data prepared:', pdfData);

      // Try the personal PDF generation endpoint
      const response = await fetch(`${API_BASE_URL}/generate-personal-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quotation,
          clientInfo: pdfData.clientInfo,
          items: pdfData.items,
          letterhead: pdfData.letterhead
        })
      });

      console.log('PDF Response status:', response.status);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${quotation.quotationName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('PDF downloaded successfully');
      } else {
        const errorText = await response.text();
        console.error('PDF generation failed:', errorText);
        setError(`Failed to generate PDF: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('PDF export error:', error);
      setError('Failed to export PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Custom Category Functions
  const addCustomCategory = async () => {
    if (!newCategory.name.trim()) {
      setError('Please enter a category name');
      return;
    }
    
    const categoryData = {
      name: newCategory.name.trim(),
      color: newCategory.color
    };
    
    const success = await saveCategory(categoryData);
    if (success) {
      setNewCategory({ name: '', color: '#F0F8FF' });
      setShowAddCategory(false);
      setEditingCategory(null);
      setError('');
    }
  };

  const deleteCustomCategory = async (category) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    if (category._id) {
      await deleteCategoryFromBackend(category._id);
    } else {
      // Fallback for local-only categories
      const updatedCategories = customCategories.filter(cat => cat.value !== category.value);
      setCustomCategories(updatedCategories);
    }
  };

  const removeCustomCategory = (categoryValue) => {
    setCustomCategories(customCategories.filter(cat => cat.value !== categoryValue));
  };

  // New API Functions for Backend Integration

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCustomCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/personal-analytics`);
      if (response.ok) {
        const analyticsData = await response.json();
        // Store analytics data in state if needed
        console.log('Analytics data:', analyticsData);
      }
    } catch (error) {
      setError('Failed to fetch analytics: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/personal-settings`);
      if (response.ok) {
        const settingsData = await response.json();
        // Store settings data in state if needed
        console.log('Settings data:', settingsData);
      }
    } catch (error) {
      setError('Failed to fetch settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveCategory = async (categoryData) => {
    try {
      setLoading(true);
      const url = editingCategory 
        ? `${API_BASE_URL}/categories/${editingCategory._id}`
        : `${API_BASE_URL}/categories`;
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      
      if (response.ok) {
        fetchCategories(); // Reload categories
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save category');
        return false;
      }
    } catch (error) {
      setError('Network error: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategoryFromBackend = async (categoryId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchCategories(); // Reload categories
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete category');
        return false;
      }
    } catch (error) {
      setError('Network error: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
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
      fetchCategories(); // Load categories when materials tab is active
    } else if (activeTab === 'quotations') {
      fetchPersonalQuotations();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'settings') {
      fetchPersonalSettings();
      fetchCategories(); // Load categories for settings tab
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'materials') {
      fetchMaterials();
    }
  }, [searchQuery]);

  // Filter quotations based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredQuotations(personalQuotations);
    } else {
      const filtered = personalQuotations.filter(quotation =>
        quotation.quotationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.materials?.some(material => 
          material.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredQuotations(filtered);
    }
  }, [personalQuotations, searchTerm]);

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

  // Export materials to PDF
  const exportMaterialsToPDF = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/generate-materials-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materials: filteredMaterials,
          searchQuery: searchQuery
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `materials-list-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF export error:', error);
      setError('Failed to export materials to PDF');
    } finally {
      setLoading(false);
    }
  };

  // Export materials to Excel
  const exportMaterialsToExcel = () => {
    try {
      // Create CSV content
      const headers = ['Item Name', 'Category', 'Rate (₹)', 'Quantity', 'Total Amount (₹)', 'Unit', 'Supplier', 'Purchase Date', 'Notes'];
      const csvContent = [
        headers.join(','),
        ...filteredMaterials.map(material => [
          `"${material.itemName || ''}"`,
          `"${material.category || ''}"`,
          material.rate || 0,
          material.quantity || 0,
          material.totalAmount || 0,
          `"${material.unit || ''}"`,
          `"${material.supplier || ''}"`,
          material.purchaseDate ? new Date(material.purchaseDate).toLocaleDateString() : '',
          `"${material.notes || ''}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `materials-list-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Excel export error:', error);
      setError('Failed to export materials to Excel');
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${
      isDarkTheme 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse transition-colors duration-500 ${
          isDarkTheme ? 'bg-blue-500/10' : 'bg-blue-300/20'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse transition-colors duration-500 ${
          isDarkTheme ? 'bg-purple-500/10' : 'bg-purple-300/20'
        }`} style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Header */}
      <header className={`z-10 backdrop-blur-xl border-b sticky top-0 transition-all duration-500 ${
        isDarkTheme 
          ? 'bg-black/20 border-white/10' 
          : 'bg-white/30 border-gray-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-3">
              {/* Back to Landing Button */}
              <button
                onClick={onBack}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isDarkTheme 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Back to Home (ESC or Alt+←)"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl shadow-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className={`text-xl font-black bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 ${
                  isDarkTheme 
                    ? 'from-white to-green-200' 
                    : 'from-gray-800 to-green-600'
                }`}>
                  Personal Hub
                </h1>
                <p className={`text-xs font-medium transition-colors duration-500 ${
                  isDarkTheme ? 'text-green-200/70' : 'text-gray-600'
                }`}>Materials & Quotations</p>
              </div>
            </div>
            
            {/* Desktop Navigation & Theme Toggle */}
            <div className="hidden md:flex items-center space-x-3">
              <nav className={`flex space-x-1 backdrop-blur-md rounded-2xl p-1 transition-all duration-500 ${
                isDarkTheme ? 'bg-black/30' : 'bg-white/50'
              }`}>
                <button
                  onClick={() => setActiveTab('materials')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === 'materials'
                      ? (isDarkTheme ? 'bg-green-600 text-white shadow-lg shadow-green-500/25' : 'bg-green-500 text-white shadow-lg shadow-green-500/25')
                      : (isDarkTheme ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-green-600 hover:bg-white/70')
                  }`}
                >
                  <Package className="w-4 h-4 inline mr-1" />
                  Materials
                </button>
                <button
                  onClick={() => setActiveTab('quotations')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === 'quotations'
                      ? (isDarkTheme ? 'bg-green-600 text-white shadow-lg shadow-green-500/25' : 'bg-green-500 text-white shadow-lg shadow-green-500/25')
                    : (isDarkTheme ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-green-600 hover:bg-white/70')
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 inline mr-1" />
                  Quotations
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === 'analytics'
                      ? (isDarkTheme ? 'bg-green-600 text-white shadow-lg shadow-green-500/25' : 'bg-green-500 text-white shadow-lg shadow-green-500/25')
                    : (isDarkTheme ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-green-600 hover:bg-white/70')
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === 'settings'
                      ? (isDarkTheme ? 'bg-green-600 text-white shadow-lg shadow-green-500/25' : 'bg-green-500 text-white shadow-lg shadow-green-500/25')
                    : (isDarkTheme ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-green-600 hover:bg-white/70')
                  }`}
                >
                  <Settings className="w-4 h-4 inline mr-1" />
                  Settings
                </button>
              </nav>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                  isDarkTheme 
                    ? 'bg-white/10 hover:bg-white/20 text-yellow-300' 
                    : 'bg-black/10 hover:bg-black/20 text-gray-700'
                }`}
                title={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkTheme ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Mobile menu button & Theme Toggle */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isDarkTheme 
                    ? 'bg-white/10 text-yellow-300' 
                    : 'bg-black/10 text-gray-700'
                }`}
              >
                {isDarkTheme ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isDarkTheme 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className={`md:hidden border-t backdrop-blur-xl transition-all duration-500 ${
            isDarkTheme ? 'bg-black/30 border-white/10' : 'bg-white/50 border-gray-200/50'
          }`}>
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => {
                  setActiveTab('materials');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'materials'
                    ? (isDarkTheme ? 'bg-green-600 text-white shadow-lg shadow-green-500/25' : 'bg-green-500 text-white shadow-lg shadow-green-500/25')
                    : (isDarkTheme ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-green-600 hover:bg-white/50')
                }`}
              >
                <Package className="w-5 h-5" />
                <span>Materials ({materials.length})</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('quotations');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'quotations'
                    ? (isDarkTheme ? 'bg-green-600 text-white shadow-lg shadow-green-500/25' : 'bg-green-500 text-white shadow-lg shadow-green-500/25')
                    : (isDarkTheme ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-green-600 hover:bg-white/50')
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Quotations ({personalQuotations.length})</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('analytics');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'analytics'
                    ? (isDarkTheme ? 'bg-green-600 text-white shadow-lg shadow-green-500/25' : 'bg-green-500 text-white shadow-lg shadow-green-500/25')
                    : (isDarkTheme ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-green-600 hover:bg-white/50')
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'settings'
                    ? (isDarkTheme ? 'bg-green-600 text-white shadow-lg shadow-green-500/25' : 'bg-green-500 text-white shadow-lg shadow-green-500/25')
                    : (isDarkTheme ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-green-600 hover:bg-white/50')
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Error Message */}
      {error && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`rounded-xl p-4 transition-all duration-500 ${
            isDarkTheme 
              ? 'bg-red-900/50 border border-red-500/50 text-red-200' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {error}
            <button 
              onClick={() => setError('')} 
              className={`float-right font-bold transition-colors duration-300 ${
                isDarkTheme ? 'text-red-200 hover:text-red-100' : 'text-red-700 hover:text-red-800'
              }`}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-8">
          {/* Materials Header */}
          <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-6 mb-6 transition-all duration-500 ${
            isDarkTheme 
              ? 'bg-black/20 border-white/20' 
              : 'bg-white/70 border-white/20'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-500 ${
                    isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full sm:w-64 pl-10 pr-4 py-3 border rounded-xl transition-all duration-300 shadow-sm hover:shadow-md focus:ring-3 ${
                      isDarkTheme 
                        ? 'bg-black/30 border-white/20 text-white placeholder-white/50 focus:ring-green-500/30 focus:border-green-400' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-green-100 focus:border-green-400'
                    }`}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Export Buttons */}
                <button
                  onClick={exportMaterialsToPDF}
                  disabled={loading || filteredMaterials.length === 0}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg ${
                    loading || filteredMaterials.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : isDarkTheme 
                        ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-red-500/25' 
                        : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-red-500/25'
                  }`}
                  title="Export materials to PDF"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                
                <button
                  onClick={exportMaterialsToExcel}
                  disabled={filteredMaterials.length === 0}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg ${
                    filteredMaterials.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : isDarkTheme 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/25'
                  }`}
                  title="Export materials to Excel (CSV)"
                >
                  <FileSpreadsheet size={18} />
                  <span className="hidden sm:inline">Excel</span>
                </button>

                {/* Add Material Button */}
                <button
                  onClick={() => setShowAddMaterial(true)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg ${
                    isDarkTheme 
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-green-500/25' 
                      : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-green-500/25'
                  }`}
                >
                  <Plus size={20} />
                  <span>Add Material</span>
                </button>
              </div>
            </div>
          </div>

          {/* Materials Grid */}
          {loading ? (
            <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-8 text-center transition-all duration-500 ${
              isDarkTheme 
                ? 'bg-black/20 border-white/20' 
                : 'bg-white/70 border-white/20'
            }`}>
              <div className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 transition-colors duration-500 ${
                isDarkTheme ? 'border-green-400' : 'border-green-600'
              }`}></div>
              <p className={`mt-2 transition-colors duration-500 ${
                isDarkTheme ? 'text-white/80' : 'text-gray-600'
              }`}>Loading materials...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => {
                const categoryInfo = materialCategories.find(cat => cat.value === material.category);
                return (
                <div
                  key={material._id}
                  className={`group backdrop-blur-sm rounded-2xl shadow-xl border p-6 transition-all duration-500 hover:scale-105 hover:rotate-1 ${
                    isDarkTheme 
                      ? 'bg-black/20 border-white/20 hover:border-white/40 hover:bg-black/30' 
                      : 'bg-white/70 border-white/20 hover:border-green-200 hover:bg-white/90'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
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
              onClick={() => {
                console.log('Create Quotation button clicked - New Button');
                console.log('Materials available:', materials.length);
                if (materials.length === 0) {
                  setError('Please add some materials first before creating a quotation');
                  setActiveTab('materials');
                  return;
                }
                setError('');
                setShowCreateQuotation(true);
                setQuotationForm({
                  quotationName: '',
                  description: ''
                });
                setSelectedMaterials([]);
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="Create a new quotation from your materials"
            >
              <Plus size={20} />
              <span>Create New Quotation</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search quotations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkTheme 
                    ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Quotations List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2">Loading quotations...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuotations.map((quotation) => (
                <div
                  key={quotation._id}
                  className={`p-6 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 relative ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
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
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(quotation.totalQuotationAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {quotation.materials?.length || 0} materials
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 ml-4 min-w-[80px] z-20 relative">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('PDF button clicked for:', quotation.quotationName);
                            exportToPDF(quotation);
                          }}
                          className="flex items-center justify-center space-x-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm cursor-pointer min-h-[36px] font-medium"
                          title="Export to PDF"
                          type="button"
                        >
                          <Download size={16} />
                          <span>PDF</span>
                        </button>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Edit button mouse down for:', quotation.quotationName);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Edit button clicked for:', quotation.quotationName);
                            console.log('Edit function exists:', typeof editQuotation);
                            try {
                              editQuotation(quotation);
                              console.log('Edit function called successfully');
                            } catch (error) {
                              console.error('Error calling editQuotation:', error);
                            }
                          }}
                          className="flex items-center justify-center space-x-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm cursor-pointer min-h-[36px] font-medium border-2 border-transparent hover:border-yellow-300"
                          title="Edit quotation"
                          type="button"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <FileEdit size={16} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Delete button clicked for:', quotation.quotationName);
                            deleteQuotation(quotation._id, quotation.quotationName);
                          }}
                          className="flex items-center justify-center space-x-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm cursor-pointer min-h-[36px] font-medium"
                          title="Delete quotation"
                          type="button"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
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

          {!loading && filteredQuotations.length === 0 && personalQuotations.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No quotations found</h3>
              <p className="text-gray-400">Create your first personal quotation</p>
            </div>
          )}

          {!loading && filteredQuotations.length === 0 && personalQuotations.length > 0 && (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No quotations match your search</h3>
              <p className="text-gray-400">Try adjusting your search terms</p>
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-8">
          <div className="space-y-6">
            {/* Personal Preferences */}
            <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-6 transition-all duration-500 ${
              isDarkTheme 
                ? 'bg-black/20 border-white/20' 
                : 'bg-white/70 border-white/20'
            }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className={`text-xl font-bold transition-colors duration-500 ${
                  isDarkTheme ? 'text-white' : 'text-gray-800'
                }`}>
                  Personal Preferences
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-xl border transition-all duration-500 ${
                  isDarkTheme 
                    ? 'bg-black/10 border-white/10' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className={`font-semibold mb-3 transition-colors duration-500 ${
                    isDarkTheme ? 'text-white' : 'text-gray-800'
                  }`}>
                    Theme Settings
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className={`transition-colors duration-500 ${
                      isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Dark Mode
                    </span>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        isDarkTheme ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${
                        isDarkTheme ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl border transition-all duration-500 ${
                  isDarkTheme 
                    ? 'bg-black/10 border-white/10' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className={`font-semibold mb-3 transition-colors duration-500 ${
                    isDarkTheme ? 'text-white' : 'text-gray-800'
                  }`}>
                    Data Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm transition-colors duration-500 ${
                        isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Materials
                      </span>
                      <span className={`text-sm font-medium transition-colors duration-500 ${
                        isDarkTheme ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {materials.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm transition-colors duration-500 ${
                        isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Quotations
                      </span>
                      <span className={`text-sm font-medium transition-colors duration-500 ${
                        isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {personalQuotations.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-6 transition-all duration-500 ${
              isDarkTheme 
                ? 'bg-black/20 border-white/20' 
                : 'bg-white/70 border-white/20'
            }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className={`text-xl font-bold transition-colors duration-500 ${
                  isDarkTheme ? 'text-white' : 'text-gray-800'
                }`}>
                  Category Management
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className={`font-semibold transition-colors duration-500 ${
                    isDarkTheme ? 'text-white' : 'text-gray-800'
                  }`}>
                    Material Categories
                  </h4>
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                      isDarkTheme 
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white' 
                        : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white'
                    }`}
                  >
                    <Plus size={16} />
                    <span>Add Category</span>
                  </button>
                </div>
                
                {/* Default Categories - Compact */}
                <div>
                  <h5 className={`text-sm font-medium mb-2 transition-colors duration-500 ${
                    isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Default Categories
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {defaultCategories.map((category) => (
                      <div
                        key={category.value}
                        className={`p-2 rounded-lg border transition-all duration-300 ${
                          isDarkTheme 
                            ? 'bg-black/10 border-white/10' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className={`text-sm font-medium truncate transition-colors duration-500 ${
                            isDarkTheme ? 'text-white' : 'text-gray-800'
                          }`}>
                            {category.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Categories - Compact Scrollable */}
                {customCategories.length > 0 && (
                  <div>
                    <h5 className={`text-sm font-medium mb-2 transition-colors duration-500 ${
                      isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Custom Categories ({customCategories.length})
                    </h5>
                    <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                        {customCategories.map((category) => (
                          <div
                            key={category._id || category.value}
                            className={`p-2 rounded-lg border transition-all duration-300 hover:scale-102 ${
                              isDarkTheme 
                                ? 'bg-black/10 border-white/10 hover:border-white/20' 
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: category.color }}
                                ></div>
                                <span className={`text-sm font-medium truncate transition-colors duration-500 ${
                                  isDarkTheme ? 'text-white' : 'text-gray-800'
                                }`}>
                                  {category.name || category.label}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                <button
                                  onClick={() => {
                                    setEditingCategory(category);
                                    setNewCategory({ name: category.name || category.label, color: category.color });
                                    setShowAddCategory(true);
                                  }}
                                  className={`p-1 rounded transition-all duration-200 ${
                                    isDarkTheme 
                                      ? 'text-blue-400 hover:bg-blue-900/20' 
                                      : 'text-blue-500 hover:bg-blue-50'
                                  }`}
                                  title="Edit category"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => deleteCustomCategory(category)}
                                  className={`p-1 rounded transition-all duration-200 ${
                                    isDarkTheme 
                                      ? 'text-red-400 hover:bg-red-900/20' 
                                      : 'text-red-500 hover:bg-red-50'
                                  }`}
                                  title="Delete category"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {customCategories.length === 0 && (
                  <div className={`text-center py-4 transition-colors duration-500 ${
                    isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <p className="text-sm">No custom categories yet. Add one to get started!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Data Actions */}
            <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-6 transition-all duration-500 ${
              isDarkTheme 
                ? 'bg-black/20 border-white/20' 
                : 'bg-white/70 border-white/20'
            }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl">
                  <Trash2 className="h-6 w-6 text-white" />
                </div>
                <h3 className={`text-xl font-bold transition-colors duration-500 ${
                  isDarkTheme ? 'text-white' : 'text-gray-800'
                }`}>
                  Data Management
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to clear all materials? This action cannot be undone.')) {
                      try {
                        setLoading(true);
                        setError(''); // Clear previous errors
                        console.log('Clearing all materials...');
                        
                        const response = await fetch(`${API_BASE_URL}/materials/clear`, { 
                          method: 'DELETE',
                          headers: {
                            'Content-Type': 'application/json',
                          }
                        });
                        
                        console.log('Clear materials response status:', response.status);
                        
                        if (response.ok) {
                          const result = await response.json();
                          console.log('Clear materials result:', result);
                          setMaterials([]);
                          setSelectedMaterials([]);
                          setError('');
                          alert(`Successfully cleared ${result.deletedCount || 0} materials`);
                        } else {
                          const errorData = await response.json();
                          console.error('Clear materials error:', errorData);
                          setError(errorData.error || 'Failed to clear materials');
                        }
                      } catch (error) {
                        console.error('Clear materials network error:', error);
                        setError('Network error: ' + error.message);
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  disabled={loading}
                  className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    isDarkTheme 
                      ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-white/20 hover:border-white/40 text-white' 
                      : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-300 text-gray-800'
                  }`}
                >
                  <div className="text-center">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                      isDarkTheme ? 'bg-yellow-500/20' : 'bg-yellow-100'
                    }`}>
                      <Package className={`w-6 h-6 ${isDarkTheme ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    </div>
                    <h4 className="font-semibold mb-2">Clear Materials</h4>
                    <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                      Remove all materials data
                    </p>
                  </div>
                </button>
                
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to reset all data? This will clear materials, quotations, and custom categories. This action cannot be undone.')) {
                      try {
                        setLoading(true);
                        const response = await fetch(`${API_BASE_URL}/personal/reset`, { method: 'DELETE' });
                        if (response.ok) {
                          setMaterials([]);
                          setPersonalQuotations([]);
                          setCustomCategories([]);
                          setError('');
                        } else {
                          const errorData = await response.json();
                          setError(errorData.error || 'Failed to reset data');
                        }
                      } catch (error) {
                        setError('Network error: ' + error.message);
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  disabled={loading}
                  className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                    isDarkTheme 
                      ? 'bg-gradient-to-br from-red-600/20 to-pink-600/20 border-white/20 hover:border-white/40 text-white' 
                      : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:border-red-300 text-gray-800'
                  }`}
                >
                  <div className="text-center">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                      isDarkTheme ? 'bg-red-500/20' : 'bg-red-100'
                    }`}>
                      <Trash2 className={`w-6 h-6 ${isDarkTheme ? 'text-red-400' : 'text-red-600'}`} />
                    </div>
                    <h4 className="font-semibold mb-2">Reset All Data</h4>
                    <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                      Clear all data and custom categories
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* App Information */}
            <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-6 transition-all duration-500 ${
              isDarkTheme 
                ? 'bg-black/20 border-white/20' 
                : 'bg-white/70 border-white/20'
            }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <h3 className={`text-xl font-bold transition-colors duration-500 ${
                  isDarkTheme ? 'text-white' : 'text-gray-800'
                }`}>
                  About Personal Hub
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`font-semibold mb-3 transition-colors duration-500 ${
                    isDarkTheme ? 'text-white' : 'text-gray-800'
                  }`}>
                    Features
                  </h4>
                  <ul className={`space-y-2 text-sm transition-colors duration-500 ${
                    isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <li>• Material inventory management</li>
                    <li>• Personal quotation creation</li>
                    <li>• Analytics and reporting</li>
                    <li>• Category management</li>
                    <li>• Dark/Light theme support</li>
                  </ul>
                </div>
                <div>
                  <h4 className={`font-semibold mb-3 transition-colors duration-500 ${
                    isDarkTheme ? 'text-white' : 'text-gray-800'
                  }`}>
                    Version Info
                  </h4>
                  <div className={`space-y-2 text-sm transition-colors duration-500 ${
                    isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <div>Version: 1.0.0</div>
                    <div>Last Updated: August 2025</div>
                    <div>Build: Personal Hub</div>
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
                  <optgroup label="Default Categories">
                    {defaultCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </optgroup>
                  {customCategories.length > 0 && (
                    <optgroup label="Custom Categories">
                      {customCategories.map((cat) => (
                        <option key={cat._id || cat.value} value={cat.value || cat.name?.toLowerCase().replace(/\s+/g, '_')}>
                          {cat.name || cat.label}
                        </option>
                      ))}
                    </optgroup>
                  )}
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
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg shadow-sm">
                  <div className="text-sm font-medium text-white">
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
                  <optgroup label="Default Categories">
                    {defaultCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </optgroup>
                  {customCategories.length > 0 && (
                    <optgroup label="Custom Categories">
                      {customCategories.map((cat) => (
                        <option key={cat._id || cat.value} value={cat.value || cat.name?.toLowerCase().replace(/\s+/g, '_')}>
                          {cat.name || cat.label}
                        </option>
                      ))}
                    </optgroup>
                  )}
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
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg shadow-sm">
                  <div className="text-sm font-medium text-white">
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
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">
                  {error}
                </div>
              )}

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
                              : 'hover:bg-blue-50 hover:border-blue-200 border border-transparent'
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
                    setError(''); // Clear any errors when closing
                  }}
                  className={`flex-1 px-4 py-2 border rounded-lg ${isDarkTheme ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedMaterials.length === 0}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title={selectedMaterials.length === 0 ? 'Please select at least one material' : ''}
                >
                  {loading ? 'Creating...' : 'Create Quotation'}
                </button>
              </div>

              {/* Helper text for disabled button */}
              {materials.length > 0 && selectedMaterials.length === 0 && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  ℹ️ Select at least one material above to create a quotation
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-full max-w-md mx-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingCategory ? 'Edit Category' : 'Add Custom Category'}
              </h3>
              <button
                onClick={() => {
                  setShowAddCategory(false);
                  setEditingCategory(null);
                  setNewCategory({ name: '', color: '#F0F8FF' });
                }}
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
                onClick={() => {
                  setShowAddCategory(false);
                  setEditingCategory(null);
                  setNewCategory({ name: '', color: '#F0F8FF' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addCustomCategory}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
              >
                {editingCategory ? 'Update Category' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quotation Modal */}
      {showEditQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Quotation</h3>
              <button
                onClick={() => {
                  setShowEditQuotation(false);
                  setEditingQuotation(null);
                  setSelectedMaterials([]);
                  setQuotationForm({
                    quotationName: '',
                    description: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); updateQuotation(); }}>
              {/* Quotation Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Quotation Name *</label>
                <input
                  type="text"
                  value={quotationForm.quotationName}
                  onChange={(e) => setQuotationForm({...quotationForm, quotationName: e.target.value})}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter quotation name"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={quotationForm.description}
                  onChange={(e) => setQuotationForm({...quotationForm, description: e.target.value})}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  rows="3"
                  placeholder="Enter quotation description (optional)"
                />
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
                              : 'hover:bg-blue-50 hover:border-blue-200 border border-transparent'
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
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                  <h5 className="font-medium mb-2 text-emerald-700">Selected Materials Summary:</h5>
                  <div className="space-y-1 text-sm">
                    {materials.filter(m => selectedMaterials.includes(m._id)).map((material) => (
                      <div key={material._id} className="flex justify-between text-emerald-600">
                        <span>{material.itemName}</span>
                        <span>{formatCurrency(material.rate * material.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-emerald-200 mt-2 pt-2 font-bold text-emerald-700">
                    Total: {formatCurrency(
                      materials.filter(m => selectedMaterials.includes(m._id))
                        .reduce((sum, material) => sum + (material.rate * material.quantity), 0)
                    )}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditQuotation(false);
                    setEditingQuotation(null);
                    setSelectedMaterials([]);
                    setQuotationForm({
                      quotationName: '',
                      description: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedMaterials.length === 0}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalSection;

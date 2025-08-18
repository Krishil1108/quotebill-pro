import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, FileText, Menu, X, Eye, Edit3, Trash2, Upload, ChevronDown, Check, Search, Filter, Calendar, DollarSign, TrendingUp, Users, Sparkles, Zap } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://quotebill-pro.onrender.com/api';

// Custom dropdown component for particulars
const ParticularDropdown = ({ value, onChange, particulars, onAddParticular }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredParticulars = particulars.filter(particular =>
    particular.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (particular) => {
    onChange(particular);
    setSearchTerm(particular);
    setIsOpen(false);
  };

  const handleAddNew = () => {
    if (searchTerm.trim() && !particulars.includes(searchTerm.trim())) {
      onAddParticular(searchTerm.trim());
      setIsOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="w-full p-4 pr-12 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700"
          placeholder="Select or enter particulars"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-blue-500 transition-colors duration-200"
        >
          <ChevronDown size={20} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-auto backdrop-blur-sm">
          {filteredParticulars.length > 0 && (
            <div className="py-2">
              {filteredParticulars.map((particular, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(particular)}
                  className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 flex items-center justify-between group transition-all duration-150 text-gray-700"
                >
                  <span className="font-medium">{particular}</span>
                  {value === particular && <Check size={16} className="text-blue-600" />}
                </button>
              ))}
            </div>
          )}
          
          {searchTerm.trim() && !particulars.includes(searchTerm.trim()) && (
            <div className="border-t border-gray-100">
              <button
                type="button"
                onClick={handleAddNew}
                className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 text-green-700 flex items-center transition-all duration-150 font-medium"
              >
                <Plus size={16} className="mr-2" />
                Add "{searchTerm.trim()}" as new particular
              </button>
            </div>
          )}
          
          {filteredParticulars.length === 0 && !searchTerm.trim() && (
            <div className="px-4 py-3 text-gray-500 text-sm italic">
              Start typing to search or add new particulars
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const QuoteBillApp = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [documentType, setDocumentType] = useState('quote');
  const [items, setItems] = useState([
    { id: 1, particular: '', unit: 'pcs', quantity: '', rate: '', amount: 0 }
  ]);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  const [letterhead, setLetterhead] = useState({
    firmName: 'Your Company Name',
    logo: null,
    address: 'Your Company Address',
    tagline: 'Your Company Tagline'
  });
  const [pastDocuments, setPastDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentFilter, setDocumentFilter] = useState('all'); // 'all', 'quote', 'bill'
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [appSettings, setAppSettings] = useState({
    particulars: ['Product A', 'Product B', 'Service X', 'Service Y', 'Consultation', 'Installation'],
    units: ['pcs', 'nos', 'meters', 'sets', 'approx', 'feet', 'points']
  });
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const fileInputRef = useRef(null);
  const addParticularInputRef = useRef(null);

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter documents when search or filter changes (now handled by server)
  useEffect(() => {
    setFilteredDocuments(pastDocuments);
  }, [pastDocuments]);

  // Refetch documents when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDocuments();
    }, 500); // Debounce search requests
    
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, documentFilter]);

  // Browser navigation support
  useEffect(() => {
    // Set initial URL based on activeTab
    const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '/create') {
      setActiveTab('create');
    } else if (currentPath === '/history') {
      setActiveTab('history');
    } else if (currentPath === '/settings') {
      setActiveTab('settings');
    }
    
    // Listen for browser back/forward button clicks
    const handlePopState = (event) => {
      const path = window.location.pathname;
      if (path === '/' || path === '/create') {
        setActiveTab('create');
      } else if (path === '/history') {
        setActiveTab('history');
      } else if (path === '/settings') {
        setActiveTab('settings');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update URL when activeTab changes
  useEffect(() => {
    const path = activeTab === 'create' ? '/' : `/${activeTab}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, [activeTab]);

  // Track unsaved changes
  useEffect(() => {
    const hasClientData = clientInfo.name.trim() || clientInfo.address.trim() || clientInfo.phone.trim() || clientInfo.email.trim();
    const hasItemData = items.some(item => item.particular.trim() || item.quantity || item.rate);
    const hasChanges = hasClientData || hasItemData;
    setHasUnsavedChanges(hasChanges && !currentDocument);
  }, [clientInfo, items, currentDocument]);

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorDialog(true);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessDialog(true);
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      if (response.ok) {
        const settings = await response.json();
        setAppSettings({
          particulars: settings.particulars || [],
          units: settings.units || []
        });
        setLetterhead(settings.letterhead || letterhead);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (documentFilter !== 'all') {
        params.append('type', documentFilter);
      }
      
      const url = `${API_BASE_URL}/documents${params.toString() ? '?' + params.toString() : ''}`;
      console.log('Fetching documents from:', url);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('Documents fetched:', data);
        setPastDocuments(data.documents || []);
      } else {
        console.error('Failed to fetch documents:', response.status, response.statusText);
        showError(`Failed to fetch documents: ${response.status} ${response.statusText}`);
        setPastDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      showError(`Error fetching documents: ${error.message}`);
      setPastDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      particular: '',
      unit: 'pcs',
      quantity: '',
      rate: '',
      amount: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          const quantity = parseFloat(updatedItem.quantity) || 0;
          const rate = parseFloat(updatedItem.rate) || 0;
          updatedItem.amount = quantity * rate;
        }
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const generatePDF = async (documentId = null) => {
    try {
      setLoading(true);
      let docId = documentId;
      
      // If no documentId provided, save the current document first
      if (!docId && currentDocument) {
        docId = currentDocument._id;
      } else if (!docId) {
        const savedDoc = await saveDocument();
        if (savedDoc) {
          docId = savedDoc._id;
        }
      }

      if (!docId) {
        showError('Please save the document first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/documents/${docId}/pdf`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${documentType}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showSuccess('PDF downloaded successfully!');
      } else {
        showError('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      showError('Error generating PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!clientInfo.name.trim()) {
        showError('Please enter client name');
        return null;
      }

      if (items.length === 0 || !items.some(item => item.particular.trim())) {
        showError('Please add at least one item with particulars');
        return null;
      }

      // Validate items
      const hasInvalidItems = items.some(item => 
        !item.particular.trim() || !item.quantity || !item.rate
      );

      if (hasInvalidItems) {
        showError('Please fill in all item details (particulars, quantity, and rate)');
        return null;
      }
      
      const documentData = {
        type: documentType,
        clientInfo: {
          name: clientInfo.name.trim(),
          address: clientInfo.address.trim(),
          phone: clientInfo.phone.trim(),
          email: clientInfo.email.trim()
        },
        items: items.map(item => ({
          particular: item.particular.trim(),
          unit: item.unit,
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: item.amount
        })).filter(item => item.particular), // Only include items with particulars
        letterhead
      };

      const url = currentDocument 
        ? `${API_BASE_URL}/documents/${currentDocument._id}`
        : `${API_BASE_URL}/documents`;
      
      const method = currentDocument ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (response.ok) {
        const savedDocument = await response.json();
        setCurrentDocument(savedDocument);
        setHasUnsavedChanges(false);
        showSuccess(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} saved successfully!`);
        fetchDocuments(); // Refresh the documents list
        return savedDocument;
      } else {
        const error = await response.json();
        showError(`Error saving document: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving document:', error);
      showError('Error saving document: ' + error.message);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const loadDocument = async (docId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${docId}`);
      if (response.ok) {
        const doc = await response.json();
        setCurrentDocument(doc);
        setDocumentType(doc.type);
        setClientInfo(doc.clientInfo);
        setItems(doc.items.map(item => ({ ...item, id: Date.now() + Math.random() })));
        if (doc.letterhead) {
          setLetterhead(doc.letterhead);
        }
        setActiveTab('create');
      }
    } catch (error) {
      console.error('Error loading document:', error);
    }
  };

  const deleteDocument = async (docId) => {
    setDeleteDocId(docId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteDocument = async () => {
    if (!deleteDocId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${deleteDocId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showSuccess('Document deleted successfully');
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      showError('Error deleting document');
    } finally {
      setShowDeleteDialog(false);
      setDeleteDocId(null);
    }
  };

  const uploadLogo = async (file) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`${API_BASE_URL}/settings/logo`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setLetterhead(prev => ({
          ...prev,
          logo: `${API_BASE_URL.replace('/api', '')}${result.logoUrl}`
        }));
        showSuccess('Logo uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      showError('Error uploading logo: ' + error.message);
    }
  };

  const saveSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          letterhead,
          particulars: appSettings.particulars,
          units: appSettings.units
        }),
      });

      if (response.ok) {
        showSuccess('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Error saving settings: ' + error.message);
    }
  };

  const autoSaveParticulars = async (newParticulars) => {
    try {
      await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          letterhead,
          particulars: newParticulars,
          units: appSettings.units
        }),
      });
      // Silent save - no alert needed for auto-save
    } catch (error) {
      console.error('Error auto-saving particulars:', error);
    }
  };

  const handleTabChange = (newTab) => {
    if (hasUnsavedChanges && activeTab === 'create' && newTab !== 'create') {
      setPendingTab(newTab);
      setShowUnsavedChangesDialog(true);
    } else {
      setActiveTab(newTab);
    }
  };

  const confirmTabChange = () => {
    setHasUnsavedChanges(false);
    setActiveTab(pendingTab);
    setShowUnsavedChangesDialog(false);
    setPendingTab(null);
  };

  const cancelTabChange = () => {
    setShowUnsavedChangesDialog(false);
    setPendingTab(null);
  };

  const newDocument = () => {
    setCurrentDocument(null);
    setDocumentType('quote');
    setClientInfo({ name: '', address: '', phone: '', email: '' });
    setItems([{ id: 1, particular: '', unit: 'pcs', quantity: '', rate: '', amount: 0 }]);
    setHasUnsavedChanges(false);
  };

  const PreviewModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Preview {documentType.toUpperCase()}</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="border bg-white shadow-sm">
              {/* Enhanced Letterhead Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {letterhead.logo && (
                      <div className="bg-white p-2 rounded-lg shadow-md">
                        <img 
                          src={letterhead.logo} 
                          alt="Company Logo" 
                          className="h-16 w-16 object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <h1 className="text-3xl font-bold">{letterhead.firmName}</h1>
                      {letterhead.tagline && (
                        <p className="text-blue-100 text-sm italic">{letterhead.tagline}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <p className="text-sm font-semibold">
                        {documentType.toUpperCase()} #{currentDocument?.documentNumber || 'DRAFT'}
                      </p>
                      <p className="text-xs text-blue-100">
                        Date: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                {letterhead.address && (
                  <div className="mt-4 pt-4 border-t border-blue-300">
                    <p className="text-blue-100 text-sm">{letterhead.address}</p>
                  </div>
                )}
              </div>

              {/* Document Content */}
              <div className="p-6">
              
              {/* Client Information Section */}
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                      B
                    </span>
                    Bill To:
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{clientInfo.name || 'Client Name'}</p>
                      <p className="text-gray-600 text-sm mt-1">{clientInfo.address || 'Client Address'}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {clientInfo.phone && (
                        <p className="flex items-center mb-1">
                          <span className="font-medium mr-2">Phone:</span>
                          {clientInfo.phone}
                        </p>
                      )}
                      {clientInfo.email && (
                        <p className="flex items-center">
                          <span className="font-medium mr-2">Email:</span>
                          {clientInfo.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                          Particulars
                        </th>
                        <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 border-b">
                          Qty
                        </th>
                        <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 border-b">
                          Unit
                        </th>
                        <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 border-b">
                          Rate (Rs)
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 border-b">
                          Amount (Rs)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {items.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 text-sm text-gray-900 border-b">
                            {item.particular || 'Item'}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-gray-700 border-b">
                            {item.quantity || '0'}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-gray-700 border-b">
                            {item.unit}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-gray-700 border-b">
                            Rs {parseFloat(item.rate || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 border-b">
                            Rs {item.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <td colSpan="4" className="px-6 py-4 text-right text-lg font-bold">
                          Total Amount:
                        </td>
                        <td className="px-6 py-4 text-right text-lg font-bold">
                          Rs {getTotalAmount().toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <p>Thank you for your business!</p>
                    {letterhead.tagline && letterhead.tagline !== letterhead.firmName && (
                      <p className="italic">{letterhead.tagline}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Page 1</p>
                    <p>Generated on {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  ElectroQuote
                </h1>
                <p className="text-xs text-blue-200/70 font-medium">Professional Suite</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1 bg-black/30 backdrop-blur-md rounded-2xl p-1">
              <button
                onClick={() => handleTabChange('create')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'create' 
                    ? 'bg-white text-purple-900 shadow-xl' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Create
              </button>
              <button
                onClick={() => handleTabChange('history')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'history' 
                    ? 'bg-white text-purple-900 shadow-xl' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                History
              </button>
              <button
                onClick={() => handleTabChange('settings')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'settings' 
                    ? 'bg-white text-purple-900 shadow-xl' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-1" />
                Settings
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-4 pt-4 pb-6 space-y-3 sm:px-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
              <button
                onClick={() => { handleTabChange('create'); setIsMenuOpen(false); }}
                className={`flex items-center px-4 py-3 rounded-xl text-base font-semibold w-full text-left transition-all duration-200 ${
                  activeTab === 'create' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                }`}
              >
                <Plus className="w-5 h-5 mr-3" />
                Create
              </button>
              <button
                onClick={() => { handleTabChange('history'); setIsMenuOpen(false); }}
                className={`flex items-center px-4 py-3 rounded-xl text-base font-semibold w-full text-left transition-all duration-200 ${
                  activeTab === 'history' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                }`}
              >
                <FileText className="w-5 h-5 mr-3" />
                History
              </button>
              <button
                onClick={() => { handleTabChange('settings'); setIsMenuOpen(false); }}
                className={`flex items-center px-4 py-3 rounded-xl text-base font-semibold w-full text-left transition-all duration-200 ${
                  activeTab === 'settings' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                }`}
              >
                <Upload className="w-5 h-5 mr-3" />
                Settings
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* New/Current Document Info - Compact */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                    {currentDocument ? `Edit ${currentDocument.type.toUpperCase()}` : 'New Document'}
                    {hasUnsavedChanges && <span className="ml-2 text-yellow-400 animate-pulse">●</span>}
                  </h2>
                  {currentDocument && (
                    <p className="text-sm text-blue-200 font-medium mt-1">
                      #{currentDocument.documentNumber} • {new Date(currentDocument.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={newDocument}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  New Document
                </button>
              </div>
            </div>

            {/* Document Type Selection */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Document Type</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => setDocumentType('quote')}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    documentType === 'quote'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  📋 Quote
                </button>
                <button
                  onClick={() => setDocumentType('bill')}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    documentType === 'bill'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  🧾 Bill
                </button>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-600" />
                Client Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <textarea
                    value={clientInfo.address}
                    onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                    placeholder="Enter client address"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <DollarSign className="w-6 h-6 mr-3 text-green-600" />
                  Items
                </h2>
                <button
                  onClick={addItem}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <Plus size={20} className="mr-2" />
                  Add Item
                </button>
              </div>

              <div className="space-y-6">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 border border-gray-200 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 hover:shadow-lg transition-all duration-200">
                    <div className="lg:col-span-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Particulars</label>
                      <ParticularDropdown
                        value={item.particular}
                        onChange={(value) => updateItem(item.id, 'particular', value)}
                        particulars={appSettings.particulars}
                        onAddParticular={(newParticular) => {
                          const updatedParticulars = [...appSettings.particulars, newParticular];
                          setAppSettings({...appSettings, particulars: updatedParticulars});
                          autoSaveParticulars(updatedParticulars);
                          updateItem(item.id, 'particular', newParticular);
                        }}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                        placeholder="0"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      >
                        {appSettings.units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Rate (Rs)</label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>

                    <div className="lg:col-span-2 flex items-end">
                      <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (Rs)</label>
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl text-right font-bold text-green-800 text-lg">
                          ₹{item.amount.toFixed(2)}
                        </div>
                      </div>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-3 p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200">
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-xl">
                    <div className="text-xl font-bold text-white">
                      Total Amount: ₹{getTotalAmount().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                <Eye size={20} className="mr-2" />
                Preview
              </button>
              <button
                onClick={saveDocument}
                disabled={loading}
                className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none font-semibold"
              >
                <FileText size={20} className="mr-2" />
                {loading ? 'Saving...' : `Save ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}`}
              </button>
              <button
                onClick={() => generatePDF()}
                disabled={loading}
                className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none font-semibold"
              >
                <Download size={20} className="mr-2" />
                {loading ? 'Generating...' : 'Export PDF'}
              </button>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            {/* Header with Search and Filters */}
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FileText className="w-7 h-7 mr-3 text-blue-600" />
                  Past Quotes & Bills
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by client, document number, or type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 w-full sm:w-80 bg-white shadow-sm hover:shadow-md"
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Document Type Filter */}
                  <select
                    value={documentFilter}
                    onChange={(e) => setDocumentFilter(e.target.value)}
                    className="px-6 py-4 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 bg-white shadow-sm hover:shadow-md font-medium"
                  >
                    <option value="all">All Documents</option>
                    <option value="quote">Quotes Only</option>
                    <option value="bill">Bills Only</option>
                  </select>

                  {/* Refresh Button */}
                  <button
                    onClick={fetchDocuments}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>

              {/* Results Info */}
              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredDocuments.length} of {pastDocuments.length} documents
                {searchQuery && ` matching "${searchQuery}"`}
                {documentFilter !== 'all' && ` (${documentFilter}s only)`}
              </div>
            </div>
            <div className="overflow-x-auto">
              {documentsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading documents...</span>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doc No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          doc.type === 'quote' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {doc.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.documentNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.clientInfo?.name || doc.customerName || 'Unknown Client'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rs {(doc.totalAmount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => generatePDF(doc._id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button 
                            onClick={() => loadDocument(doc._id)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => deleteDocument(doc._id)}
                            className="text-red-600 hover:text-red-900"
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
              )}
              {!documentsLoading && filteredDocuments.length === 0 && pastDocuments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No documents found. Create your first quote or bill!
                </div>
              )}
              {!documentsLoading && filteredDocuments.length === 0 && pastDocuments.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  No documents match your search criteria. Try adjusting your search or filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-6">Settings</h2>
            
            {/* Particulars Management Section */}
            <div className="mb-8">
              <h3 className="text-md font-semibold mb-4">Manage Particulars</h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {appSettings.particulars.map((particular, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-md px-3 py-1">
                      <span className="text-sm">{particular}</span>
                      <button
                        onClick={() => {
                          const updatedParticulars = appSettings.particulars.filter((_, i) => i !== index);
                          setAppSettings({...appSettings, particulars: updatedParticulars});
                          autoSaveParticulars(updatedParticulars);
                        }}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {/* Use a ref for the input */}
                  <input
                    type="text"
                    placeholder="Add new particular"
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    ref={addParticularInputRef}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        const newParticular = e.target.value.trim();
                        if (!appSettings.particulars.includes(newParticular)) {
                          const updatedParticulars = [...appSettings.particulars, newParticular];
                          setAppSettings({
                            ...appSettings, 
                            particulars: updatedParticulars
                          });
                          autoSaveParticulars(updatedParticulars);
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = addParticularInputRef.current;
                      if (!input) return;
                      const newParticular = input.value.trim();
                      if (newParticular && !appSettings.particulars.includes(newParticular)) {
                        const updatedParticulars = [...appSettings.particulars, newParticular];
                        setAppSettings({
                          ...appSettings, 
                          particulars: updatedParticulars
                        });
                        autoSaveParticulars(updatedParticulars);
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Letterhead Settings Section */}
            <div>
              <h3 className="text-md font-semibold mb-4">Letterhead Settings</h3>
              <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        uploadLogo(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Upload size={20} className="mr-2" />
                    Upload Logo
                  </button>
                  {letterhead.logo && (
                    <img 
                      src={letterhead.logo} 
                      alt="Current Logo" 
                      className="h-12 w-12 object-contain border rounded"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Firm Name</label>
                <input
                  type="text"
                  value={letterhead.firmName}
                  onChange={(e) => setLetterhead({...letterhead, firmName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Firm Address</label>
                <textarea
                  value={letterhead.address}
                  onChange={(e) => setLetterhead({...letterhead, address: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                <input
                  type="text"
                  value={letterhead.tagline}
                  onChange={(e) => setLetterhead({...letterhead, tagline: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button 
                onClick={saveSettings}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} />
      
      {/* Error Dialog */}
      {showErrorDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600 flex items-center">
                <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Error
              </h3>
              <button 
                onClick={() => setShowErrorDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-700 mb-6">{errorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorDialog(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-600 flex items-center">
                <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Success
              </h3>
              <button 
                onClick={() => setShowSuccessDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-700 mb-6">{successMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessDialog(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600 flex items-center">
                <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Confirm Delete
              </h3>
              <button 
                onClick={() => { setShowDeleteDialog(false); setDeleteDocId(null); }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this document? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowDeleteDialog(false); setDeleteDocId(null); }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDocument}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Dialog */}
      {showUnsavedChangesDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-600 flex items-center">
                <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Unsaved Changes
              </h3>
              <button 
                onClick={cancelTabChange}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-700 mb-6">You have unsaved changes. Are you sure you want to leave without saving?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelTabChange}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Stay
              </button>
              <button
                onClick={confirmTabChange}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteBillApp;
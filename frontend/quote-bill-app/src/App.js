import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, FileText, Menu, X, Eye, Edit3, Trash2, Upload, ChevronDown, Check } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

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
          className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Select or enter particulars"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown size={20} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredParticulars.length > 0 && (
            <div className="py-1">
              {filteredParticulars.map((particular, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(particular)}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between group"
                >
                  <span>{particular}</span>
                  {value === particular && <Check size={16} className="text-blue-600" />}
                </button>
              ))}
            </div>
          )}
          
          {searchTerm.trim() && !particulars.includes(searchTerm.trim()) && (
            <div className="border-t border-gray-200">
              <button
                type="button"
                onClick={handleAddNew}
                className="w-full px-4 py-2 text-left hover:bg-green-50 text-green-700 flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Add "{searchTerm.trim()}" as new particular
              </button>
            </div>
          )}
          
          {filteredParticulars.length === 0 && !searchTerm.trim() && (
            <div className="px-4 py-2 text-gray-500 text-sm">
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
  const [appSettings, setAppSettings] = useState({
    particulars: ['Product A', 'Product B', 'Service X', 'Service Y', 'Consultation', 'Installation'],
    units: ['pcs', 'nos', 'meters', 'kg', 'liters', 'boxes', 'sets']
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
      const response = await fetch(`${API_BASE_URL}/documents`);
      if (response.ok) {
        const data = await response.json();
        setPastDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
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
        alert('Please save the document first');
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
      } else {
        alert('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!clientInfo.name.trim()) {
        alert('Please enter client name');
        return null;
      }

      if (items.length === 0 || !items.some(item => item.particular.trim())) {
        alert('Please add at least one item with particulars');
        return null;
      }

      // Validate items
      const hasInvalidItems = items.some(item => 
        !item.particular.trim() || !item.quantity || !item.rate
      );

      if (hasInvalidItems) {
        alert('Please fill in all item details (particulars, quantity, and rate)');
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
        alert(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} saved successfully!`);
        fetchDocuments(); // Refresh the documents list
        return savedDocument;
      } else {
        const error = await response.json();
        alert(`Error saving document: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Error saving document: ' + error.message);
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
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/documents/${docId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Document deleted successfully');
          fetchDocuments();
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Error deleting document');
      }
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
        alert('Logo uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Error uploading logo');
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
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
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

  const newDocument = () => {
    setCurrentDocument(null);
    setDocumentType('quote');
    setClientInfo({ name: '', address: '', phone: '', email: '' });
    setItems([{ id: 1, particular: '', unit: 'pcs', quantity: '', rate: '', amount: 0 }]);
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
                          Rate (₹)
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 border-b">
                          Amount (₹)
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
                            ₹{parseFloat(item.rate || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 border-b">
                            ₹{item.amount.toLocaleString()}
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
                          ₹{getTotalAmount().toLocaleString()}
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">ElectroQuote</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'create' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Create
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'history' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <button
                onClick={() => { setActiveTab('create'); setIsMenuOpen(false); }}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                  activeTab === 'create' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Create
              </button>
              <button
                onClick={() => { setActiveTab('history'); setIsMenuOpen(false); }}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                  activeTab === 'history' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                History
              </button>
              <button
                onClick={() => { setActiveTab('settings'); setIsMenuOpen(false); }}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                  activeTab === 'settings' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Settings
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* New/Current Document Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    {currentDocument ? `Edit ${currentDocument.type.toUpperCase()}` : 'New Document'}
                  </h2>
                  {currentDocument && (
                    <p className="text-sm text-gray-500">
                      Document No: {currentDocument.documentNumber} | 
                      Created: {new Date(currentDocument.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={newDocument}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  New Document
                </button>
              </div>
            </div>

            {/* Document Type Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Document Type</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => setDocumentType('quote')}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    documentType === 'quote'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Quote
                </button>
                <button
                  onClick={() => setDocumentType('bill')}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    documentType === 'bill'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bill
                </button>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Client Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={clientInfo.address}
                    onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter client address"
                    rows="2"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Items</h2>
                <button
                  onClick={addItem}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} className="mr-1" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="lg:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Particulars</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {appSettings.units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>

                    <div className="lg:col-span-2 flex items-end">
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                        <div className="p-3 bg-gray-100 border border-gray-300 rounded-md text-right font-medium">
                          {item.amount.toFixed(2)}
                        </div>
                      </div>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-2 p-3 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-lg font-semibold text-blue-900">
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
                className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Eye size={20} className="mr-2" />
                Preview
              </button>
              <button
                onClick={saveDocument}
                disabled={loading}
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <FileText size={20} className="mr-2" />
                {loading ? 'Saving...' : `Save ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}`}
              </button>
              <button
                onClick={() => generatePDF()}
                disabled={loading}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Download size={20} className="mr-2" />
                {loading ? 'Generating...' : 'Export PDF'}
              </button>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Past Quotes & Bills</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doc No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pastDocuments.map((doc) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.clientInfo.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{doc.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          doc.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : doc.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
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
              {pastDocuments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No documents found. Create your first quote or bill!
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
    </div>
  );
};

export default QuoteBillApp;
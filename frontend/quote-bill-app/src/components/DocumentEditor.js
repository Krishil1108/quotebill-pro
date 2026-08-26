import React, { useRef, useState, useEffect } from 'react';
import { Zap, Plus, Users, DollarSign, Upload, Columns, Trash2, FileText, Download, Settings } from 'lucide-react';
import IntelligentItemSuggestions from './IntelligentItemSuggestions';
import VoiceEstimateDictator from './VoiceEstimateDictator';
import ImageItemExtractor from './ImageItemExtractor';

const ITEM_COLUMN_CONFIG = [
  { key: 'particular', label: 'Particulars', minWidth: 'min-w-[260px]' },
  { key: 'quantity', label: 'Quantity', minWidth: 'min-w-[130px]' },
  { key: 'unit', label: 'Unit', minWidth: 'min-w-[130px]' },
  { key: 'rate', label: 'Rate (Rs)', minWidth: 'min-w-[150px]' },
  { key: 'amount', label: 'Amount (Rs)', minWidth: 'min-w-[150px]' }
];

const DocumentEditor = ({
  isDarkTheme,
  currentDocument,
  hasUnsavedChanges,
  newDocument,
  documentType,
  setDocumentType,
  clientInfo,
  setClientInfo,
  items,
  setItems,
  addItem,
  updateItem,
  handleDeleteItem,
  getTotalAmount,
  saveDocument,
  generatePDF,
  loading,
  appSettings,
  quantityOptions = [],
  rateOptions = [],
  lastAddedItem,
  handleAcceptSuggestion,
  handleRejectSuggestion,
  handleParticularCellBlur,
  showItemExtractor,
  setShowItemExtractor,
  pastDocuments,
  pdfOptions,
  setPdfOptions,
  letterhead,
  setLetterhead
}) => {
  const moveItemUp = (index) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    setItems(newItems);
  };

  const moveItemDown = (index) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    setItems(newItems);
  };

  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [itemColumnVisibility, setItemColumnVisibility] = useState({
    particular: true,
    quantity: true,
    unit: true,
    rate: true,
    amount: true
  });
  
  const columnSelectorRef = useRef(null);

  // Close column selector dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (columnSelectorRef.current && !columnSelectorRef.current.contains(event.target)) {
        setShowColumnSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleItemColumn = (key) => {
    setItemColumnVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const visibleItemColumns = ITEM_COLUMN_CONFIG.filter((col) => itemColumnVisibility[col.key]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* New/Current Document Info - Compact */}
      <div className={`backdrop-blur-xl rounded-2xl border p-6 shadow-2xl transition-all duration-500 ${
        isDarkTheme 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/80 border-gray-200/50'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className={`text-xl font-black flex items-center transition-colors duration-500 ${
              isDarkTheme ? 'text-white' : 'text-gray-800'
            }`}>
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              {currentDocument ? `Edit ${currentDocument.type.toUpperCase()}` : 'New Document'}
              {hasUnsavedChanges && <span className="ml-2 text-yellow-400 animate-pulse">●</span>}
            </h2>
            {currentDocument && (
              <p className={`text-sm font-semibold mt-1 transition-colors duration-500 ${
                isDarkTheme ? 'text-blue-200' : 'text-gray-600'
              }`}>
                #{currentDocument.documentNumber} • {new Date(currentDocument.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            onClick={newDocument}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            New Document
          </button>
        </div>
      </div>

      {/* Document Type Selection */}
      <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-6 transition-all duration-500 ${
        isDarkTheme 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/70 border-gray-200/50'
      }`}>
        <h2 className={`text-xl font-bold mb-4 transition-colors duration-500 ${
          isDarkTheme ? 'text-white' : 'text-gray-800'
        }`}>Document Type</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDocumentType('quote')}
            className={`py-4 px-4 rounded-xl font-black text-base transition-all duration-200 transform hover:scale-[1.02] ${
              documentType === 'quote'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : (isDarkTheme 
                    ? 'bg-white/10 text-white hover:bg-white/20 hover:shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md')
            }`}
          >
            📋 Quote
          </button>
          <button
            onClick={() => setDocumentType('bill')}
            className={`py-4 px-4 rounded-xl font-black text-base transition-all duration-200 transform hover:scale-[1.02] ${
              documentType === 'bill'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : (isDarkTheme 
                    ? 'bg-white/10 text-white hover:bg-white/20 hover:shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md')
            }`}
          >
            🧾 Bill
          </button>
        </div>
      </div>

      {/* Client Information */}
      <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-5 sm:p-8 transition-all duration-500 ${
        isDarkTheme ? 'bg-black/20 border-white/20' : 'bg-white/70 border-white/20'
      }`}>
        <h2 className={`text-xl font-bold mb-6 flex items-center transition-colors duration-500 ${
          isDarkTheme ? 'text-white' : 'text-gray-800'
        }`}>
          <Users className="w-6 h-6 mr-3 text-blue-500" />
          Client Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Client Name</label>
            <input
              type="text"
              value={clientInfo.name}
              onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
              className={`w-full p-4 border rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                isDarkTheme
                  ? 'bg-black/30 border-white/20 text-white placeholder-white/40 focus:ring-blue-500/30 focus:border-blue-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-3 focus:ring-blue-100 focus:border-blue-400'
              }`}
              placeholder="Enter client name"
            />
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
            <input
              type="tel"
              value={clientInfo.phone}
              onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
              className={`w-full p-4 border rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                isDarkTheme
                  ? 'bg-black/30 border-white/20 text-white placeholder-white/40 focus:ring-blue-500/30 focus:border-blue-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-3 focus:ring-blue-100 focus:border-blue-400'
              }`}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <input
              type="email"
              value={clientInfo.email}
              onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
              className={`w-full p-4 border rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                isDarkTheme
                  ? 'bg-black/30 border-white/20 text-white placeholder-white/40 focus:ring-blue-500/30 focus:border-blue-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-3 focus:ring-blue-100 focus:border-blue-400'
              }`}
              placeholder="Enter email address"
            />
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Address</label>
            <textarea
              value={clientInfo.address}
              onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
              className={`w-full p-4 border rounded-xl transition-all duration-200 shadow-sm hover:shadow-md resize-none ${
                isDarkTheme
                  ? 'bg-black/30 border-white/20 text-white placeholder-white/40 focus:ring-blue-500/30 focus:border-blue-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-3 focus:ring-blue-100 focus:border-blue-400'
              }`}
              placeholder="Enter client address"
              rows="3"
            />
          </div>
        </div>
      </div>

      {/* PDF Document Layout Options */}
      <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-5 sm:p-8 transition-all duration-500 ${
        isDarkTheme ? 'bg-black/20 border-white/20' : 'bg-white/70 border-white/20'
      }`}>
        <h2 className={`text-xl font-bold mb-6 flex items-center transition-colors duration-500 ${
          isDarkTheme ? 'text-white' : 'text-gray-800'
        }`}>
          <Settings className="w-6 h-6 mr-3 text-purple-500" />
          PDF Document Layout Options
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Letterhead options */}
          <div className="space-y-3">
            <h3 className={`text-sm font-black uppercase tracking-wider mb-2 ${isDarkTheme ? 'text-white/60' : 'text-gray-500'}`}>Letterhead Fields</h3>
            <label className={`flex items-center space-x-3 cursor-pointer ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={!letterhead.hideLogo}
                onChange={(e) => setLetterhead({...letterhead, hideLogo: !e.target.checked})}
                className="h-5 w-5 accent-blue-600 rounded animate-scale-in"
              />
              <span className="text-sm font-semibold">Print Logo</span>
            </label>
            <label className={`flex items-center space-x-3 cursor-pointer ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={!letterhead.hideFirmName}
                onChange={(e) => setLetterhead({...letterhead, hideFirmName: !e.target.checked})}
                className="h-5 w-5 accent-blue-600 rounded animate-scale-in"
              />
              <span className="text-sm font-semibold">Print Firm Name</span>
            </label>
            <label className={`flex items-center space-x-3 cursor-pointer ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={!letterhead.hidePhone}
                onChange={(e) => setLetterhead({...letterhead, hidePhone: !e.target.checked})}
                className="h-5 w-5 accent-blue-600 rounded animate-scale-in"
              />
              <span className="text-sm font-semibold">Print Phone Number</span>
            </label>
            <label className={`flex items-center space-x-3 cursor-pointer ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={!letterhead.hideAddress}
                onChange={(e) => setLetterhead({...letterhead, hideAddress: !e.target.checked})}
                className="h-5 w-5 accent-blue-600 rounded animate-scale-in"
              />
              <span className="text-sm font-semibold">Print Address</span>
            </label>
            <label className={`flex items-center space-x-3 cursor-pointer ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={!letterhead.hideTagline}
                onChange={(e) => setLetterhead({...letterhead, hideTagline: !e.target.checked})}
                className="h-5 w-5 accent-blue-600 rounded animate-scale-in"
              />
              <span className="text-sm font-semibold">Print Tagline</span>
            </label>
          </div>

          {/* Total box options */}
          <div className="space-y-3">
            <h3 className={`text-sm font-black uppercase tracking-wider mb-2 ${isDarkTheme ? 'text-white/60' : 'text-gray-500'}`}>Totals Panel</h3>
            <label className={`flex items-center space-x-3 cursor-pointer ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={!pdfOptions.hideTotalBox}
                onChange={(e) => setPdfOptions({...pdfOptions, hideTotalBox: !e.target.checked})}
                className="h-5 w-5 accent-blue-600 rounded animate-scale-in"
              />
              <span className="text-sm font-semibold">Print Total Box</span>
            </label>
            <label className={`flex items-center space-x-3 cursor-pointer ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={!pdfOptions.hideSubtotal}
                onChange={(e) => setPdfOptions({...pdfOptions, hideSubtotal: !e.target.checked})}
                className="h-5 w-5 accent-blue-600 rounded animate-scale-in"
              />
              <span className="text-sm font-semibold">Print Subtotal inside Box</span>
            </label>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-5 sm:p-8 transition-all duration-500 ${
        isDarkTheme 
          ? 'bg-black/20 border-white/20' 
          : 'bg-white/70 border-white/20'
      }`}>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className={`text-xl font-bold flex items-center transition-colors duration-500 ${
            isDarkTheme ? 'text-white/90' : 'text-gray-800'
          }`}>
            <DollarSign className="w-6 h-6 mr-3 text-green-600" />
            Items &amp; Details
          </h2>
          <button
            type="button"
            onClick={() => setShowItemExtractor(true)}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-md ${
              isDarkTheme
                ? 'bg-white/10 hover:bg-white/20 text-blue-300'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
            }`}
          >
            <Upload size={16} className="mr-2 animate-bounce" />
            Import Image/Text
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className={`text-sm font-bold ${isDarkTheme ? 'text-white/70' : 'text-gray-600'}`}>
            Spreadsheet Editor View (Auto-saving particulars)
          </div>
          <div className="relative" ref={columnSelectorRef}>
            <button
              type="button"
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-md ${
                isDarkTheme
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
              }`}
            >
              <Columns size={16} className="mr-2" />
              Columns View
            </button>

            {showColumnSelector && (
              <div className={`absolute right-0 z-50 mt-2 w-56 rounded-xl border p-2 shadow-2xl ${
                isDarkTheme
                  ? 'bg-slate-950 border-white/20'
                  : 'bg-white border-gray-200'
              }`}>
                {ITEM_COLUMN_CONFIG.map((column) => (
                  <label
                    key={column.key}
                    className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isDarkTheme
                        ? 'text-white/90 hover:bg-white/10'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{column.label}</span>
                    <input
                      type="checkbox"
                      checked={itemColumnVisibility[column.key]}
                      onChange={() => toggleItemColumn(column.key)}
                      className="h-4 w-4 accent-blue-600"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Datalists for autocompletion */}
        <datalist id="particular-options">
          {appSettings.particulars.map((particular) => (
            <option key={particular} value={particular} />
          ))}
        </datalist>
        <datalist id="quantity-options">
          {quantityOptions.map((quantity) => (
            <option key={quantity} value={quantity} />
          ))}
        </datalist>
        <datalist id="unit-options">
          {appSettings.units.map((unit) => (
            <option key={unit} value={unit} />
          ))}
        </datalist>
        <datalist id="rate-options">
          {rateOptions.map((rate) => (
            <option key={rate} value={rate} />
          ))}
        </datalist>

        {/* Mobile View Items Stack */}
        <div className="space-y-3 lg:hidden">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`rounded-xl border p-3 transition-all duration-500 ${
                isDarkTheme
                  ? 'border-white/20 bg-black/20'
                  : 'border-gray-200 bg-white/80'
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-black ${isDarkTheme ? 'text-white/70' : 'text-gray-500'}`}>
                    Item {index + 1}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItemUp(index)}
                      className={`p-1 rounded transition-all hover:scale-105 active:scale-95 ${
                        isDarkTheme
                          ? 'text-white/80 hover:bg-white/10 disabled:opacity-30'
                          : 'text-gray-600 hover:bg-gray-100 disabled:opacity-30'
                      }`}
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => moveItemDown(index)}
                      className={`p-1 rounded transition-all hover:scale-105 active:scale-95 ${
                        isDarkTheme
                          ? 'text-white/80 hover:bg-white/10 disabled:opacity-30'
                          : 'text-gray-600 hover:bg-gray-100 disabled:opacity-30'
                      }`}
                      title="Move Down"
                    >
                      ▼
                    </button>
                  </div>
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 ${
                      isDarkTheme
                        ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                        : 'text-red-600 hover:bg-red-50 hover:text-red-800'
                    }`}
                    title="Delete item"
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {itemColumnVisibility.particular && (
                  <label className="col-span-2 block">
                    <span className={`mb-1 block text-xs font-bold ${isDarkTheme ? 'text-white/60' : 'text-gray-500'}`}>
                      Particulars
                    </span>
                    <input
                      type="text"
                      list="particular-options"
                      value={item.particular}
                      onChange={(e) => updateItem(item.id, 'particular', e.target.value)}
                      onBlur={(e) => handleParticularCellBlur(e.target.value, item.id)}
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-300 focus:ring-2 ${
                        isDarkTheme
                          ? 'border-white/20 bg-black/30 text-white placeholder-white/40 focus:border-blue-400 focus:ring-blue-500/30'
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-blue-100'
                      }`}
                      placeholder="Select or enter particulars"
                    />
                  </label>
                )}

                {itemColumnVisibility.quantity && (
                  <label className="block">
                    <span className={`mb-1 block text-xs font-bold ${isDarkTheme ? 'text-white/60' : 'text-gray-500'}`}>
                      Quantity
                    </span>
                    <input
                      type="number"
                      list="quantity-options"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-300 focus:ring-2 ${
                        isDarkTheme
                          ? 'border-white/20 bg-black/30 text-white placeholder-white/40 focus:border-blue-400 focus:ring-blue-500/30'
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-blue-100'
                      }`}
                      placeholder="0"
                    />
                  </label>
                )}

                {itemColumnVisibility.unit && (
                  <label className="block">
                    <span className={`mb-1 block text-xs font-bold ${isDarkTheme ? 'text-white/60' : 'text-gray-500'}`}>
                      Unit
                    </span>
                    <input
                      type="text"
                      list="unit-options"
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-300 focus:ring-2 ${
                        isDarkTheme
                          ? 'border-white/20 bg-black/30 text-white placeholder-white/40 focus:border-blue-400 focus:ring-blue-500/30'
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-blue-100'
                      }`}
                      placeholder="pcs"
                    />
                  </label>
                )}

                {itemColumnVisibility.rate && (
                  <label className="block">
                    <span className={`mb-1 block text-xs font-bold ${isDarkTheme ? 'text-white/60' : 'text-gray-500'}`}>
                      Rate (Rs)
                    </span>
                    <input
                      type="number"
                      list="rate-options"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-300 focus:ring-2 ${
                        isDarkTheme
                          ? 'border-white/20 bg-black/30 text-white placeholder-white/40 focus:border-blue-400 focus:ring-blue-500/30'
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-blue-100'
                      }`}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </label>
                )}

                {itemColumnVisibility.amount && (
                  <div className="block">
                    <span className={`mb-1 block text-xs font-bold ${isDarkTheme ? 'text-white/60' : 'text-gray-500'}`}>
                      Amount (Rs)
                    </span>
                    <div className={`rounded-lg border px-3 py-2.5 text-right text-sm font-black ${
                      isDarkTheme
                        ? 'border-emerald-500/30 bg-emerald-900/30 text-emerald-300'
                        : 'border-green-200 bg-green-50 text-green-800'
                    }`}>
                      ₹{item.amount.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className={`hidden overflow-x-auto rounded-xl border transition-all duration-500 lg:block ${
          isDarkTheme ? 'border-white/20' : 'border-gray-200'
        }`}>
          <table className="w-full border-collapse text-left">
            <thead className={isDarkTheme ? 'bg-white/10' : 'bg-gray-50'}>
              <tr>
                <th className={`w-14 px-3 py-3 text-xs font-black uppercase tracking-wide ${
                  isDarkTheme ? 'text-white/70' : 'text-gray-500'
                }`}>#</th>
                {visibleItemColumns.map((column) => (
                  <th
                    key={column.key}
                    className={`${column.minWidth} px-3 py-3 text-xs font-black uppercase tracking-wide ${
                      isDarkTheme ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
                <th className={`w-16 px-3 py-3 text-right text-xs font-black uppercase tracking-wide ${
                  isDarkTheme ? 'text-white/70' : 'text-gray-500'
                }`}>Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkTheme ? 'divide-white/10' : 'divide-gray-200'}`}>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className={`group transition-colors ${
                    isDarkTheme ? 'bg-black/20 hover:bg-white/5' : 'bg-white/70 hover:bg-blue-50/60'
                  }`}
                >
                  <td className={`px-3 py-3 text-sm font-bold flex items-center space-x-2 ${isDarkTheme ? 'text-white/60' : 'text-gray-500'}`}>
                    <span>{index + 1}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex flex-col space-y-0.5 transition-opacity duration-200">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveItemUp(index)}
                        className={`text-[9px] p-0.5 rounded transition-all hover:scale-110 ${
                          isDarkTheme
                            ? 'text-white/70 hover:bg-white/10 disabled:opacity-30'
                            : 'text-gray-600 hover:bg-gray-100 disabled:opacity-30'
                        }`}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={index === items.length - 1}
                        onClick={() => moveItemDown(index)}
                        className={`text-[9px] p-0.5 rounded transition-all hover:scale-110 ${
                          isDarkTheme
                            ? 'text-white/70 hover:bg-white/10 disabled:opacity-30'
                            : 'text-gray-600 hover:bg-gray-100 disabled:opacity-30'
                        }`}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  </td>

                  {itemColumnVisibility.particular && (
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        list="particular-options"
                        value={item.particular}
                        onChange={(e) => updateItem(item.id, 'particular', e.target.value)}
                        onBlur={(e) => handleParticularCellBlur(e.target.value, item.id)}
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-300 focus:ring-premium ${
                          isDarkTheme
                            ? 'border-white/20 bg-black/30 text-white placeholder-white/40'
                            : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
                        }`}
                        placeholder="Select or enter particulars"
                      />
                    </td>
                  )}

                  {itemColumnVisibility.quantity && (
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        list="quantity-options"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-300 focus:ring-premium ${
                          isDarkTheme
                            ? 'border-white/20 bg-black/30 text-white placeholder-white/40'
                            : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
                        }`}
                        placeholder="0"
                      />
                    </td>
                  )}

                  {itemColumnVisibility.unit && (
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        list="unit-options"
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-300 focus:ring-premium ${
                          isDarkTheme
                            ? 'border-white/20 bg-black/30 text-white placeholder-white/40'
                            : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
                        }`}
                        placeholder="pcs"
                      />
                    </td>
                  )}

                  {itemColumnVisibility.rate && (
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        list="rate-options"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-300 focus:ring-premium ${
                          isDarkTheme
                            ? 'border-white/20 bg-black/30 text-white placeholder-white/40'
                            : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
                        }`}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </td>
                  )}

                  {itemColumnVisibility.amount && (
                    <td className="px-3 py-3">
                      <div className={`rounded-lg border px-3 py-2.5 text-right text-sm font-black ${
                        isDarkTheme
                          ? 'border-emerald-500/30 bg-emerald-900/30 text-emerald-300'
                          : 'border-green-200 bg-green-50 text-green-800'
                      }`}>
                        ₹{item.amount.toFixed(2)}
                      </div>
                    </td>
                  )}

                  <td className="px-3 py-3 text-right">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className={`opacity-0 group-hover:opacity-100 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 hover:scale-105 ${
                          isDarkTheme
                            ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                            : 'text-red-600 hover:bg-red-50 hover:text-red-800'
                        }`}
                        title="Delete item"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Intelligent Item Suggestions Panel */}
        <IntelligentItemSuggestions
          lastAddedItem={lastAddedItem}
          allItems={items}
          allDocuments={pastDocuments}
          onAcceptSuggestion={handleAcceptSuggestion}
          onRejectSuggestion={handleRejectSuggestion}
          isDarkTheme={isDarkTheme}
        />

        {/* Add Item Button & Count */}
        <div className="mt-4 flex flex-col space-y-4">
          <button
            onClick={addItem}
            className={`w-full flex items-center justify-center py-4 px-6 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] font-bold text-lg ${
              isDarkTheme 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
            }`}
          >
            <Plus size={24} className="mr-3 animate-spin" style={{ animationDuration: '4s' }} />
            Add Row Item
          </button>
          
          <div className={`flex items-center justify-center py-3 px-4 rounded-xl backdrop-blur-sm transition-all duration-500 ${
            isDarkTheme 
              ? 'bg-white/10 text-white/90 border border-white/20' 
              : 'bg-gray-100/80 text-gray-700 border border-gray-200'
          }`}>
            <FileText size={20} className="mr-2" />
            <span className="font-semibold text-sm">
              Current Items Count: {items.length} {items.length === 1 ? 'Item' : 'Items'} Added
            </span>
          </div>
        </div>

        {/* AI Next Item Suggestions */}
        <IntelligentItemSuggestions
          items={items}
          allDocuments={pastDocuments}
          onAddItem={(suggestedItem) => {
            const newItem = {
              id: Date.now() + Math.random(),
              particular: suggestedItem.particular,
              quantity: suggestedItem.quantity || '1',
              unit: suggestedItem.unit || 'pcs',
              rate: suggestedItem.rate || '',
              amount: 0
            };
            setItems([...items, newItem]);
          }}
          isDarkTheme={isDarkTheme}
        />

        {/* AI Voice Estimate Dictator */}
        <VoiceEstimateDictator
          onItemsSpoken={(spokenItems) => {
            const newItems = spokenItems.map(item => ({
              id: Date.now() + Math.random(),
              ...item
            }));
            setItems([...items, ...newItems]);
          }}
          isDarkTheme={isDarkTheme}
        />

        {/* Total Amount Panel */}
        <div className={`mt-8 pt-6 border-t-2 transition-colors duration-500 ${
          isDarkTheme ? 'border-white/20' : 'border-gray-200'
        }`}>
          <div className="flex justify-center md:justify-end">
            <div className={`w-full md:w-auto p-5 rounded-2xl shadow-xl transition-all duration-500 text-center ${
              isDarkTheme
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-blue-500/20'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20'
            }`}>
              <p className="text-sm font-bold text-white/80 mb-1">Total Bill Amount</p>
              <div className="text-2xl sm:text-3xl font-black text-white">
                ₹{getTotalAmount().toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={saveDocument}
          disabled={loading}
          className="flex items-center justify-center py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none font-black text-lg"
        >
          <FileText size={24} className="mr-3" />
          {loading ? 'Saving Document...' : `Save ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}`}
        </button>
        <button
          onClick={() => generatePDF()}
          disabled={loading}
          className="flex items-center justify-center py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none font-black text-lg"
        >
          <Download size={24} className="mr-3" />
          {loading ? 'Generating PDF...' : 'Export Document (PDF)'}
        </button>
      </div>

      {/* Modal Item Image/Text Extractor */}
      {showItemExtractor && (
        <ImageItemExtractor
          onClose={() => setShowItemExtractor(false)}
          onItemsExtracted={(extractedItems) => {
            const newItems = extractedItems.map(item => ({
              id: Date.now() + Math.random(),
              particular: item.particular || '',
              quantity: item.quantity || '',
              unit: item.unit || 'pcs',
              rate: item.rate || '',
              amount: (item.quantity && item.rate) ? parseFloat(item.quantity) * parseFloat(item.rate) : 0
            }));
            setItems([...items, ...newItems]);
            setShowItemExtractor(false);
          }}
          isDarkTheme={isDarkTheme}
        />
      )}
    </div>
  );
};

export default DocumentEditor;

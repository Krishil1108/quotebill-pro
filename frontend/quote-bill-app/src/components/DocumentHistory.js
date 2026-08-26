import React from 'react';
import { FileText, Search, Sparkles, X, Download, Edit3, Copy, Trash2 } from 'lucide-react';

const DocumentHistory = ({
  isDarkTheme,
  fetchDocuments,
  searchQuery,
  setSearchQuery,
  documentFilter,
  setDocumentFilter,
  aiSuggestedDocs,
  setAiSuggestedDocs,
  itemCountInput,
  setItemCountInput,
  findItemCountBasedSuggestions,
  filteredDocuments,
  pastDocuments,
  documentsLoading,
  generatePDF,
  loadDocument,
  duplicateDocument,
  deleteDocument,
  loading
}) => {
  return (
    <div className={`backdrop-blur-sm rounded-2xl shadow-xl border transition-all duration-500 animate-fade-in-up ${
      isDarkTheme ? 'bg-black/20 border-white/20' : 'bg-white/70 border-white/20'
    }`}>
      {/* Header with Search and Filters */}
      <div className={`px-4 sm:px-8 py-5 border-b rounded-t-2xl transition-all duration-500 ${
        isDarkTheme ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold flex items-center transition-colors duration-500 ${
            isDarkTheme ? 'text-white' : 'text-gray-800'
          }`}>
            <FileText className="w-6 h-6 mr-2 text-blue-500" />
            Past Quotes &amp; Bills
          </h2>
          {/* Refresh */}
          <button
            onClick={fetchDocuments}
            className={`p-2 rounded-xl transition-all duration-200 active:scale-90 ${
              isDarkTheme ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
            title="Refresh"
          >
            <svg className="h-5 w-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search client, document no, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 pr-4 py-3 border rounded-xl w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
              isDarkTheme
                ? 'bg-black/30 border-white/20 text-white placeholder-white/40 focus:border-blue-400'
                : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400 shadow-sm'
            }`}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Filter row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <select
            value={documentFilter}
            onChange={(e) => setDocumentFilter(e.target.value)}
            className={`px-3 py-3 border rounded-xl font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
              isDarkTheme
                ? 'bg-black/30 border-white/20 text-white focus:border-blue-400'
                : 'bg-white border-gray-200 text-gray-800 focus:border-blue-400 shadow-sm'
            }`}
          >
            <option value="all">All Documents</option>
            <option value="quote">Quotes Only</option>
            <option value="bill">Bills Only</option>
          </select>

          {/* Clear filter button */}
          {(aiSuggestedDocs.length > 0 || searchQuery || documentFilter !== 'all' || itemCountInput) ? (
            <button
              onClick={() => { 
                setSearchQuery(''); 
                setDocumentFilter('all'); 
                setAiSuggestedDocs([]); 
                setItemCountInput(''); 
              }}
              className={`flex items-center justify-center px-3 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] ${
                isDarkTheme ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <X className="h-4 w-4 mr-1" /> Clear Filters
            </button>
          ) : (
            <div />
          )}
        </div>

        {/* AI item count finder */}
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Search by exact number of items (e.g. 5)..."
            value={itemCountInput}
            onChange={(e) => setItemCountInput(e.target.value)}
            className={`flex-1 px-4 py-3 border rounded-xl text-left transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 ${
              isDarkTheme
                ? 'bg-black/30 border-white/20 text-white placeholder-white/40 focus:border-purple-400'
                : 'bg-white border-gray-200 text-gray-800 focus:border-purple-400 shadow-sm'
            }`}
            min="0" max="100"
          />
          <button
            onClick={findItemCountBasedSuggestions}
            disabled={loading || !itemCountInput || itemCountInput < 0}
            className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm"
          >
            <Sparkles className="h-4 w-4 mr-1.5 animate-pulse" />
            {loading ? 'Finding…' : 'AI Find'}
          </button>
        </div>

        {/* Results info chips */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className={`font-semibold ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
            Showing {filteredDocuments.length} of {pastDocuments.length} documents
          </span>
          {searchQuery && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">Query: "{searchQuery}"</span>}
          {documentFilter !== 'all' && <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">{documentFilter}s</span>}
          {aiSuggestedDocs.length > 0 && <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full flex items-center font-medium"><Sparkles className="h-2.5 w-2.5 mr-0.5" />AI Match</span>}
        </div>
      </div>

      {/* Document list */}
      <div>
        {documentsLoading ? (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`h-24 w-full rounded-xl border p-4 animate-pulse flex items-center justify-between ${
                    isDarkTheme ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className={`h-4 w-1/4 rounded ${isDarkTheme ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                    <div className={`h-5 w-1/2 rounded ${isDarkTheme ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                    <div className={`h-3 w-1/3 rounded ${isDarkTheme ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className={`h-8 w-8 rounded-lg ${isDarkTheme ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                    <div className={`h-8 w-8 rounded-lg ${isDarkTheme ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile card list (hidden on md+) */}
            <div className="md:hidden divide-y divide-gray-100/20">
              {filteredDocuments.length === 0 ? (
                <div className={`text-center py-10 font-medium ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                  {pastDocuments.length === 0 ? 'No documents yet. Create your first quote!' : 'No documents match your filters.'}
                </div>
              ) : filteredDocuments.map((doc) => (
                <div key={doc._id} className={`doc-card px-4 py-4 transition-all duration-300 hover:bg-black/5 ${
                  doc.relevanceScore
                    ? (isDarkTheme ? 'border-l-4 border-purple-400 bg-purple-900/10' : 'border-l-4 border-purple-400 bg-purple-50/60')
                    : ''
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Type badge + doc number */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
                          doc.type === 'quote' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {doc.type?.toUpperCase()}
                        </span>
                        <span className={`text-xs font-mono font-semibold ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                          #{doc.documentNumber}
                        </span>
                        {doc.suggestionReason && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                            doc.suggestionType === 'exact' ? 'bg-green-100 text-green-800' :
                            doc.suggestionType === 'minus-one' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>{doc.suggestionReason}</span>
                        )}
                      </div>
                      {/* Client name */}
                      <p className={`text-base font-bold truncate ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        {doc.clientInfo?.name || doc.customerName || 'Unknown Client'}
                      </p>
                      {/* Amount + items + date */}
                      <div className={`flex items-center gap-3 mt-1 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span className={`font-black ${isDarkTheme ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          ₹{(doc.totalAmount || 0).toLocaleString()}
                        </span>
                        <span>·</span>
                        <span className="font-medium">{doc.items ? doc.items.length : 0} items</span>
                        <span>·</span>
                        <span className="font-medium">{new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => generatePDF(doc._id)} className={`p-2.5 rounded-xl transition-all active:scale-90 ${isDarkTheme ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`} title="Download PDF">
                        <Download size={16} />
                      </button>
                      <button onClick={() => loadDocument(doc._id)} className={`p-2.5 rounded-xl transition-all active:scale-90 ${isDarkTheme ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600'}`} title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => duplicateDocument(doc)} className={`p-2.5 rounded-xl transition-all active:scale-90 ${isDarkTheme ? 'bg-emerald-600/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`} title="Duplicate">
                        <Copy size={16} />
                      </button>
                      <button onClick={() => deleteDocument(doc._id)} className={`p-2.5 rounded-xl transition-all active:scale-90 ${isDarkTheme ? 'bg-red-600/20 text-red-400' : 'bg-red-50 text-red-600'}`} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className={`min-w-full divide-y ${isDarkTheme ? 'divide-white/10' : 'divide-gray-200'}`}>
                <thead className={isDarkTheme ? 'bg-white/5' : 'bg-gray-50'}>
                  <tr>
                    {['Type','Doc No','Client','Items','Amount','Date','Actions'].map(h => (
                      <th key={h} className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkTheme ? 'divide-white/5' : 'divide-gray-200'}`}>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc._id} className={`transition-colors ${doc.relevanceScore ? 'border-l-4 border-purple-400' : ''} ${
                      isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${doc.type === 'quote' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {doc.type?.toUpperCase()}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${isDarkTheme ? 'text-gray-200' : 'text-gray-900'}`}>{doc.documentNumber}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${isDarkTheme ? 'text-gray-200' : 'text-gray-900'}`}>{doc.clientInfo?.name || doc.customerName || 'Unknown Client'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isDarkTheme ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                          {doc.items ? doc.items.length : 0} items
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-black ${isDarkTheme ? 'text-emerald-400' : 'text-gray-900'}`}>
                        ₹{(doc.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button onClick={() => generatePDF(doc._id)} className={`p-1.5 rounded-lg transition-all hover:scale-110 ${isDarkTheme ? 'text-blue-400 hover:bg-blue-600/20' : 'text-blue-600 hover:text-blue-900'}`} title="Download PDF"><Download size={16} /></button>
                          <button onClick={() => loadDocument(doc._id)} className={`p-1.5 rounded-lg transition-all hover:scale-110 ${isDarkTheme ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:text-gray-900'}`} title="Edit"><Edit3 size={16} /></button>
                          <button onClick={() => duplicateDocument(doc)} className={`p-1.5 rounded-lg transition-all hover:scale-110 ${isDarkTheme ? 'text-emerald-400 hover:bg-emerald-600/20' : 'text-green-600 hover:text-green-900'}`} title="Duplicate"><Copy size={16} /></button>
                          <button onClick={() => deleteDocument(doc._id)} className={`p-1.5 rounded-lg transition-all hover:scale-110 ${isDarkTheme ? 'text-red-400 hover:bg-red-600/20' : 'text-red-600 hover:text-red-900'}`} title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDocuments.length === 0 && (
                <div className={`text-center py-8 font-semibold ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                  {pastDocuments.length === 0 ? 'No documents yet. Create your first quote!' : 'No documents match your criteria.'}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentHistory;

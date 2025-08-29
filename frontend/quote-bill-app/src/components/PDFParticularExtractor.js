import React, { useState, useCallback } from 'react';
import { Upload, FileText, Check, X, Download, AlertCircle } from 'lucide-react';

const PDFParticularExtractor = ({ onParticularsExtracted, isDarkTheme = false }) => {
  const [extractedParticulars, setExtractedParticulars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Sample default electrical work sequence based on common patterns
  const defaultElectricalSequence = [
    "Site survey and measurement",
    "Material procurement",
    "Main panel installation",
    "Distribution board setup",
    "MCB installation",
    "RCCB installation",
    "Main switch installation",
    "Meter connection",
    "Earthing system",
    "Neutral link connection",
    "Phase link connection",
    "Conduit pipe installation",
    "Wire and cable laying",
    "Junction box installation",
    "Light point installation",
    "Fan point installation",
    "Switch board installation",
    "5 amp socket installation",
    "15 amp socket installation",
    "Fan regulator installation",
    "Testing and commissioning",
    "Safety check",
    "Final inspection",
    "Documentation and handover"
  ];

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a valid PDF file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For now, we'll use a placeholder since PDF parsing requires additional libraries
      // In a real implementation, you'd use libraries like pdf-parse or PDF.js
      
      // Simulate PDF processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, use the default sequence
      // In real implementation, this would extract from the actual PDF
      setExtractedParticulars(defaultElectricalSequence);
      setError('PDF parsing not fully implemented yet. Using default electrical work sequence.');
      
    } catch (err) {
      setError('Failed to extract particulars from PDF: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleManualInput = () => {
    if (!manualInput.trim()) {
      setError('Please enter the particulars sequence');
      return;
    }

    // Parse manual input - assume each line is a particular
    const particulars = manualInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    setExtractedParticulars(particulars);
    setError('');
    setShowManualInput(false);
  };

  const handleUseParticulars = () => {
    if (extractedParticulars.length === 0) {
      setError('No particulars to use');
      return;
    }

    onParticularsExtracted(extractedParticulars);
  };

  const downloadTemplate = () => {
    const template = defaultElectricalSequence.join('\n');
    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'electrical-work-template.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 ${
      isDarkTheme 
        ? 'bg-gray-800/50 border-gray-600 text-white' 
        : 'bg-white border-gray-200 text-gray-800'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold flex items-center ${
          isDarkTheme ? 'text-white' : 'text-gray-800'
        }`}>
          <FileText className="mr-2" size={20} />
          PDF Particulars Extractor
        </h3>
        <button
          onClick={downloadTemplate}
          className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
            isDarkTheme 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <Download size={14} className="mr-1" />
          Template
        </button>
      </div>

      {error && (
        <div className={`mb-4 p-3 rounded-lg flex items-center ${
          isDarkTheme 
            ? 'bg-red-900/20 border border-red-500/30 text-red-400' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <AlertCircle size={16} className="mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* PDF Upload */}
        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDarkTheme 
            ? 'border-gray-600 hover:border-gray-500' 
            : 'border-gray-300 hover:border-gray-400'
        }`}>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="pdf-upload"
            disabled={loading}
          />
          <label
            htmlFor="pdf-upload"
            className={`cursor-pointer flex flex-col items-center ${
              loading ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <Upload size={32} className={`mb-2 ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className="font-medium">
              {loading ? 'Processing PDF...' : 'Upload PDF File'}
            </span>
            <span className={`text-sm ${
              isDarkTheme ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Extract particulars sequence
            </span>
          </label>
        </div>

        {/* Manual Input */}
        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDarkTheme 
            ? 'border-gray-600 hover:border-gray-500' 
            : 'border-gray-300 hover:border-gray-400'
        }`}>
          <button
            onClick={() => setShowManualInput(true)}
            className="flex flex-col items-center w-full"
          >
            <FileText size={32} className={`mb-2 ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className="font-medium">Manual Input</span>
            <span className={`text-sm ${
              isDarkTheme ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Type particulars sequence
            </span>
          </button>
        </div>
      </div>

      {/* Manual Input Modal */}
      {showManualInput && (
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${
            isDarkTheme ? 'text-white' : 'text-gray-700'
          }`}>
            Enter Particulars (one per line):
          </label>
          <textarea
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Light point installation&#10;Fan point installation&#10;Switch board installation&#10;..."
            rows={8}
            className={`w-full p-3 border rounded-lg resize-none ${
              isDarkTheme 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
            }`}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleManualInput}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Check size={16} className="mr-1" />
              Use Input
            </button>
            <button
              onClick={() => setShowManualInput(false)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
              }`}
            >
              <X size={16} className="mr-1" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Extracted Particulars Preview */}
      {extractedParticulars.length > 0 && (
        <div className="mb-6">
          <h4 className={`font-medium mb-3 ${
            isDarkTheme ? 'text-white' : 'text-gray-800'
          }`}>
            Extracted Particulars Sequence ({extractedParticulars.length} items):
          </h4>
          <div className={`max-h-60 overflow-y-auto border rounded-lg p-3 ${
            isDarkTheme 
              ? 'bg-gray-700/50 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <ol className="space-y-1">
              {extractedParticulars.map((particular, index) => (
                <li key={index} className={`text-sm flex items-start ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <span className={`mr-2 font-mono text-xs ${
                    isDarkTheme ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {(index + 1).toString().padStart(2, '0')}.
                  </span>
                  {particular}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Use Particulars Button */}
      {extractedParticulars.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleUseParticulars}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Check size={16} className="mr-2" />
            Use This Sequence for Smart Suggestions
          </button>
        </div>
      )}

      {/* Info */}
      <div className={`mt-4 p-3 rounded-lg text-sm ${
        isDarkTheme 
          ? 'bg-blue-900/20 border border-blue-500/30 text-blue-400' 
          : 'bg-blue-50 border border-blue-200 text-blue-700'
      }`}>
        <strong>Note:</strong> The extracted sequence will be used to provide intelligent suggestions in the exact order you specify. This will make the AI suggestions follow your preferred workflow pattern.
      </div>
    </div>
  );
};

export default PDFParticularExtractor;

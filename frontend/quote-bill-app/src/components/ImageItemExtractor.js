import React, { useCallback, useState } from 'react';
import { Upload, FileText, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import Tesseract from 'tesseract.js';

const normalizeUnit = (unit) => {
  if (!unit) return '';
  const key = unit.toLowerCase().replace(/[^a-z]/g, '');
  const unitMap = {
    pc: 'pcs',
    pcs: 'pcs',
    pic: 'pcs',
    piece: 'pcs',
    pieces: 'pcs',
    no: 'nos',
    nos: 'nos',
    point: 'points',
    points: 'points',
    ft: 'feet',
    foot: 'feet',
    feet: 'feet',
    meter: 'meters',
    meters: 'meters',
    mtr: 'meters',
    set: 'sets',
    sets: 'sets'
  };
  return unitMap[key] || unit.toLowerCase();
};

const splitIntoLines = (text) => {
  const normalized = text
    .replace(/\r/g, '\n')
    .replace(/[–—]/g, '-')
    .replace(/\u00a0/g, ' ');

  const rawLines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (rawLines.length <= 1) {
    return normalized
      .split(/(?=\b\d+\s*[).])/g)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return rawLines;
};

const parseLineToItem = (line) => {
  const cleaned = line
    .replace(/^\s*\d+\s*[).:-]\s*/, '')
    .replace(/\bRs\.?\b/gi, '')
    .replace(/₹/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\/-\s*$/, '')
    .trim();

  if (!cleaned) return null;

  const primaryPattern = /^(?<particular>.+)\s*-\s*(?<quantity>\d+(?:\.\d+)?)\s*(?<unit>[a-zA-Z]+)?\s*-\s*(?<rate>\d+(?:\.\d+)?)(?:\s*\/-)?\s*$/;
  const altPattern = /^(?<particular>.+?)\s+(?<quantity>\d+(?:\.\d+)?)\s*(?<unit>[a-zA-Z]+)?\s+(?<rate>\d+(?:\.\d+)?)(?:\s*\/-)?\s*$/;
  const trailingPattern = /(?<quantity>\d+(?:\.\d+)?)\s*(?<unit>[a-zA-Z]+)?\s*-\s*(?<rate>\d+(?:\.\d+)?)(?:\s*\/-)?\s*$/;

  let match = cleaned.match(primaryPattern) || cleaned.match(altPattern);
  let particular = '';
  let quantity = '';
  let unit = '';
  let rate = '';

  if (match && match.groups) {
    particular = match.groups.particular?.trim() || '';
    quantity = match.groups.quantity || '';
    unit = normalizeUnit(match.groups.unit || '');
    rate = match.groups.rate || '';
  } else {
    const trailingMatch = cleaned.match(trailingPattern);
    if (trailingMatch && trailingMatch.groups) {
      particular = cleaned
        .slice(0, trailingMatch.index)
        .replace(/\s*-\s*$/, '')
        .trim();
      quantity = trailingMatch.groups.quantity || '';
      unit = normalizeUnit(trailingMatch.groups.unit || '');
      rate = trailingMatch.groups.rate || '';
    } else {
      return null;
    }
  }

  if (!quantity && !rate) return null;
  if (!quantity && rate) {
    quantity = '1';
  }

  const quantityValue = parseFloat(quantity) || 0;
  const rateValue = parseFloat(rate) || 0;

  return {
    particular,
    quantity: quantity ? quantity.toString() : '',
    unit: unit || 'pcs',
    rate: rate ? rate.toString() : '',
    amount: quantityValue * rateValue
  };
};

const parseItemsFromText = (text) => {
  const lines = splitIntoLines(text);
  const items = [];

  lines.forEach((line) => {
    if (/^\s*#+/.test(line)) return;
    const parsed = parseLineToItem(line);
    if (parsed) {
      items.push(parsed);
    }
  });

  return items;
};

const ImageItemExtractor = ({ onItemsExtracted, isDarkTheme = false }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [previewItems, setPreviewItems] = useState([]);

  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(null);

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (info) => {
          if (info.status === 'recognizing text' && info.progress) {
            setProgress(Math.round(info.progress * 100));
          }
        }
      });

      const parsedItems = parseItemsFromText(result.data.text || '');
      if (parsedItems.length === 0) {
        setError('No items detected. Try a clearer image or use manual text input.');
        setPreviewItems([]);
        return;
      }

      setPreviewItems(parsedItems);
      onItemsExtracted(parsedItems);
    } catch (err) {
      setError(`Failed to extract items from image: ${err.message}`);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }, [onItemsExtracted]);

  const handleManualParse = () => {
    if (!manualInput.trim()) {
      setError('Please paste the items text');
      return;
    }

    const parsedItems = parseItemsFromText(manualInput);
    if (parsedItems.length === 0) {
      setError('No items detected from the pasted text.');
      setPreviewItems([]);
      return;
    }

    setError('');
    setPreviewItems(parsedItems);
    onItemsExtracted(parsedItems);
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
          <ImageIcon className="mr-2" size={20} />
          Image/Text Item Extractor
        </h3>
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
        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDarkTheme
            ? 'border-gray-600 hover:border-gray-500'
            : 'border-gray-300 hover:border-gray-400'
        }`}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
            disabled={loading}
          />
          <label
            htmlFor="image-upload"
            className={`cursor-pointer flex flex-col items-center ${
              loading ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <Upload size={32} className={`mb-2 ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className="font-medium">
              {loading ? `Processing Image${progress ? ` (${progress}%)` : '...'}` : 'Upload Image'}
            </span>
            <span className={`text-sm ${
              isDarkTheme ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Extract items automatically
            </span>
          </label>
        </div>

        <div className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDarkTheme
            ? 'border-gray-600 hover:border-gray-500'
            : 'border-gray-300 hover:border-gray-400'
        }`}>
          <div className="flex items-center mb-3">
            <FileText size={20} className={`mr-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className="font-medium">Paste Items Text</span>
          </div>
          <textarea
            value={manualInput}
            onChange={(event) => setManualInput(event.target.value)}
            placeholder="1) Light point -1 point-250/-&#10;2) Fan point -1 point-250/-"
            rows={6}
            className={`w-full p-3 border rounded-lg resize-none mb-3 ${
              isDarkTheme
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
            }`}
          />
          <button
            onClick={handleManualParse}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Check size={16} className="mr-2" />
            Parse Text
          </button>
        </div>
      </div>

      {previewItems.length > 0 && (
        <div className="mb-4">
          <h4 className={`font-medium mb-3 ${
            isDarkTheme ? 'text-white' : 'text-gray-800'
          }`}>
            Parsed Items ({previewItems.length})
          </h4>
          <div className={`max-h-60 overflow-y-auto border rounded-lg p-3 ${
            isDarkTheme
              ? 'bg-gray-700/50 border-gray-600'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <ol className="space-y-2">
              {previewItems.map((item, index) => (
                <li key={`${item.particular}-${index}`} className={`text-sm ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <span className={`mr-2 font-mono text-xs ${
                    isDarkTheme ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {(index + 1).toString().padStart(2, '0')}.
                  </span>
                  {item.particular} • {item.quantity} {item.unit} • ₹{item.rate}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      <div className={`mt-4 p-3 rounded-lg text-sm ${
        isDarkTheme
          ? 'bg-blue-900/20 border border-blue-500/30 text-blue-400'
          : 'bg-blue-50 border border-blue-200 text-blue-700'
      }`}>
        <strong>Tip:</strong> For best results, use clear, high-contrast images. The extracted items are applied automatically.
      </div>
    </div>
  );
};

export default ImageItemExtractor;

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Brain, Plus, Play, Square, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';

const VoiceEstimateDictator = ({ onItemsSpoken, isDarkTheme }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [supportSpeech, setSupportSpeech] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser speech support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupportSpeech(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Optimized for Indian English accent

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const activeText = finalTranscript || interimTranscript;
      setTranscript(activeText);
      
      // Real-time parsing preview
      if (activeText.trim()) {
        const items = parseSpeechToItems(activeText);
        setParsedItems(items);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const wordToNumber = (word) => {
    const numberMap = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'a': 1, 'an': 1, 'single': 1, 'double': 2, 'pair': 2
    };
    return numberMap[word.toLowerCase()] || parseInt(word);
  };

  const parseSpeechToItems = (text) => {
    const parts = text.split(/\band\b|\bthen\b|\balso\b|,/i);
    const detectedItems = [];

    parts.forEach(part => {
      const cleanPart = part.trim().toLowerCase();
      if (!cleanPart) return;

      const quantityPattern = /(\b\d+\b|one|two|three|four|five|six|seven|eight|nine|ten|a|an|single)/i;
      const ratePattern = /(?:at|for|price|cost|rate)\s*(\d+)/i;

      let qty = 1;
      let rate = '';
      let particular = '';
      
      const rateMatch = cleanPart.match(ratePattern);
      if (rateMatch) {
        rate = rateMatch[1];
      }

      const textWithoutRate = cleanPart.replace(ratePattern, '').trim();
      const qtyMatch = textWithoutRate.match(quantityPattern);
      
      if (qtyMatch) {
        qty = wordToNumber(qtyMatch[1]);
        particular = textWithoutRate.replace(quantityPattern, '').trim();
      } else {
        particular = textWithoutRate;
      }

      particular = particular
        .replace(/\b(add|please|need|want|of|at|for|rupees|rs|INR)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (particular) {
        particular = particular.charAt(0).toUpperCase() + particular.slice(1);
        
        let unit = 'pcs';
        if (particular.toLowerCase().includes('wire') || particular.toLowerCase().includes('cable') || particular.toLowerCase().includes('pipe') || particular.toLowerCase().includes('conduit')) {
          unit = 'meters';
        }

        const defaultRates = {
          'light point': 450,
          'fan point': 450,
          'switch board': 350,
          'plug point': 250,
          'wire': 18,
          'conduit': 22,
          'mcb': 190,
          'rccb': 1850
        };

        let matchedRate = rate || '0';
        if (!rate) {
          const lowercaseParticular = particular.toLowerCase();
          for (const [key, value] of Object.entries(defaultRates)) {
            if (lowercaseParticular.includes(key)) {
              matchedRate = value.toString();
              break;
            }
          }
        }

        detectedItems.push({
          particular,
          quantity: qty.toString(),
          unit,
          rate: matchedRate,
          amount: qty * parseFloat(matchedRate || 0)
        });
      }
    });

    return detectedItems;
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setParsedItems([]);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleApplyItems = () => {
    if (parsedItems.length > 0) {
      onItemsSpoken(parsedItems);
      setTranscript('');
      setParsedItems([]);
    }
  };

  if (!supportSpeech) {
    return null; // Don't show if speech recognition is not supported in the browser
  }

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 ${
      isDarkTheme 
        ? 'bg-gray-800/40 border-gray-700 text-white' 
        : 'bg-white border-gray-200 text-gray-800 shadow-sm'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-blue-500" size={24} />
        <div>
          <h3 className="text-lg font-bold flex items-center gap-1.5">
            AI Voice Estimate Dictator
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-normal border border-blue-500/20">
              Hands-Free Mode
            </span>
          </h3>
          <p className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
            Speak items naturally (e.g. <i>"five light points at 450 rupees and ten meters wire for 18 rupees"</i>) to draft estimates.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={toggleListening}
          className={`flex items-center justify-center gap-2.5 w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-md ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              : isDarkTheme
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isListening ? (
            <>
              <MicOff size={20} />
              Stop Listening
            </>
          ) : (
            <>
              <Mic size={20} />
              Start Recording Estimate
            </>
          )}
        </button>

        {transcript && (
          <div className={`flex-1 p-3 rounded-xl border text-sm max-h-[80px] overflow-y-auto italic ${
            isDarkTheme 
              ? 'bg-gray-900/40 border-gray-700 text-gray-300' 
              : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}>
            " {transcript} "
          </div>
        )}
      </div>

      {parsedItems.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Parsed Voice Items</h4>
          <div className={`max-h-40 overflow-y-auto rounded-xl border p-3 ${
            isDarkTheme ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="space-y-1.5">
              {parsedItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.particular}</span>
                  <span className="text-xs text-gray-500 font-mono">
                    {item.quantity} {item.unit} @ ₹{item.rate}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleApplyItems}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 shadow-md font-bold text-sm"
          >
            <CheckCircle2 size={16} />
            ⚡ Add Spoken Items to Quote (₹{parsedItems.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)})
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceEstimateDictator;

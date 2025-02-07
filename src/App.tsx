import React, { useState, useEffect, useRef } from 'react';
import { Clock, Calendar, ArrowDownUp, Search } from 'lucide-react';

function App() {
  const [date, setDate] = useState('');
  const [milliseconds, setMilliseconds] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [timezones, setTimezones] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDateInput, setIsDateInput] = useState(true);
  const [showMilliseconds, setShowMilliseconds] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimezones(Intl.supportedValuesOf('timeZone'));

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (milliseconds) {
      millisecondsToDate(milliseconds);
    } else if (date) {
      dateToMilliseconds(date);
    }
  }, [timezone, showMilliseconds]);

  const filteredTimezones = timezones.filter(tz => 
    tz.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dateToMilliseconds = (dateStr: string) => {
    if (!dateStr) return;
    try {
      const date = new Date(dateStr);
      const ms = date.getTime();
      setMilliseconds(ms.toString());
    } catch (error) {
      console.error('Invalid date format');
    }
  };

  const millisecondsToDate = (ms: string) => {
    if (!ms) return;
    try {
      const timestamp = parseInt(ms);
      const date = new Date(timestamp);
      
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: showMilliseconds ? 3 : undefined,
        hour12: false
      });
      
      const parts = formatter.formatToParts(date);
      const dateParts: { [key: string]: string } = {};
      parts.forEach(part => {
        dateParts[part.type] = part.value;
      });
      
      let formattedDate = `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;
      if (showMilliseconds && dateParts.fractionalSecond) {
        formattedDate += `.${dateParts.fractionalSecond}`;
      }
      setDate(formattedDate);
    } catch (error) {
      console.error('Invalid milliseconds');
    }
  };

  const handleTimezoneSelect = (tz: string) => {
    setTimezone(tz);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSwap = () => {
    setIsDateInput(!isDateInput);
    if (isDateInput && milliseconds) {
      millisecondsToDate(milliseconds);
    } else if (!isDateInput && date) {
      dateToMilliseconds(date);
    }
  };

  const handleMillisecondsToggle = (checked: boolean) => {
    setShowMilliseconds(checked);
    // Re-format existing values with or without milliseconds
    if (isDateInput && date) {
      dateToMilliseconds(date);
    } else if (!isDateInput && milliseconds) {
      millisecondsToDate(milliseconds);
    }
  };

  const renderDateInput = () => (
    <div className="space-y-2">
      <label className="block">
        <span className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          <Calendar size={16} />
          Date and Time Input
        </span>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            dateToMilliseconds(e.target.value);
          }}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          step={showMilliseconds ? "0.001" : "1"}
        />
      </label>
    </div>
  );

  const renderMillisecondsInput = () => (
    <div className="space-y-2">
      <label className="block">
        <span className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          <Clock size={16} />
          Milliseconds Input (Unix Timestamp)
        </span>
        <input
          type="number"
          value={milliseconds}
          onChange={(e) => {
            setMilliseconds(e.target.value);
            millisecondsToDate(e.target.value);
          }}
          placeholder="Enter milliseconds..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-8">
          Date-Time Converter
        </h1>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <div
                className="w-full px-3 py-2 border border-gray-200 rounded-lg cursor-pointer flex items-center justify-between hover:border-gray-300"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="truncate">{timezone}</span>
                <Search size={16} className="text-gray-400" />
              </div>
              
              {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-2">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search timezone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredTimezones.map((tz) => (
                      <div
                        key={tz}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleTimezoneSelect(tz)}
                      >
                        {tz}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showMilliseconds}
                onChange={(e) => handleMillisecondsToggle(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              <span className="ms-3 text-sm font-medium text-gray-700">Show milliseconds</span>
            </label>
          </div>

          <div className="space-y-6">
            {/* Input Section */}
            {isDateInput ? renderDateInput() : renderMillisecondsInput()}

            {/* Swap Button */}
            <div className="flex justify-center">
              <button 
                onClick={handleSwap}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Swap input type"
              >
                <ArrowDownUp className="text-gray-400" />
              </button>
            </div>

            {/* Output Section */}
            <div className="space-y-2">
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  {isDateInput ? (
                    <>
                      <Clock size={16} />
                      Milliseconds Output (Unix Timestamp)
                    </>
                  ) : (
                    <>
                      <Calendar size={16} />
                      Date and Time Output
                    </>
                  )}
                </span>
                <input
                  type={isDateInput ? "number" : "datetime-local"}
                  value={isDateInput ? milliseconds : date}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                  step={showMilliseconds ? "0.001" : "1"}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          All conversions are performed in real-time with timezone support
        </div>
      </div>
    </div>
  );
}

export default App;
import React, { useState, useEffect, useRef } from 'react';
import { Clock, Calendar, ArrowDownUp, Search } from 'lucide-react';

function App() {
  const [date, setDate] = useState('');
  const [milliseconds, setMilliseconds] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [timezones, setTimezones] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get all available timezones
    setTimezones(Intl.supportedValuesOf('timeZone'));

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTimezones = timezones.filter(tz => 
    tz.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dateToMilliseconds = (dateStr: string) => {
    if (!dateStr) return;
    try {
      const date = new Date(dateStr);
      setMilliseconds(date.getTime().toString());
    } catch (error) {
      console.error('Invalid date format');
    }
  };

  const millisecondsToDate = (ms: string) => {
    if (!ms) return;
    try {
      const timestamp = parseInt(ms);
      const date = new Date(timestamp);
      
      // Format the date in the selected timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      const parts = formatter.formatToParts(date);
      const dateParts: { [key: string]: string } = {};
      parts.forEach(part => {
        dateParts[part.type] = part.value;
      });
      
      // Create ISO string in the correct format for datetime-local input
      const formattedDate = `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;
      setDate(formattedDate);
    } catch (error) {
      console.error('Invalid milliseconds');
    }
  };

  const handleTimezoneSelect = (tz: string) => {
    setTimezone(tz);
    setIsOpen(false);
    setSearchQuery('');
    // Update the date display when timezone changes
    if (milliseconds) {
      millisecondsToDate(milliseconds);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-8">
          Date - Millis Converter
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

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Calendar size={16} />
                  Date and Time
                </span>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    dateToMilliseconds(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="flex justify-center">
              <ArrowDownUp className="text-gray-400" />
            </div>

            <div className="space-y-2">
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Clock size={16} />
                  Milliseconds (Unix Timestamp)
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
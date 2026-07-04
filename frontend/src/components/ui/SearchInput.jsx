import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SearchInput = ({ placeholder = 'Search...', onSearch, debounceMs = 500 }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [value, onSearch, debounceMs]);

  return (
    <div className="relative rounded-md shadow-sm w-full max-w-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 outline-none transition-shadow"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;

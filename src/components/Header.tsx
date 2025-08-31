"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearch } from "@/contexts/SearchContext";

export default function Header() {
  const [query, setQuery] = useState("");
  const { searchQuery, setSearchQuery } = useSearch();

  // Sync local input state with search context
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
  };

  return (
    <header className="bg-gray-800 text-white p-4 border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors" onClick={() => setSearchQuery("")}>
          r34video
        </Link>
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for tags..."
            className="p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-r-md transition-colors"
          >
            Search
          </button>
        </form>
      </div>
    </header>
  );
}
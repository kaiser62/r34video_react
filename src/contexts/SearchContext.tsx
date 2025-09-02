"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  updateURL: (page?: number, query?: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQueryState] = useState("");

  // Initialize search query from URL params
  useEffect(() => {
    const queryParam = searchParams.get('q') || "";
    setSearchQueryState(queryParam);
  }, [searchParams]);

  // Update URL with both page and query parameters
  const updateURL = (page?: number, query?: string) => {
    const params = new URLSearchParams();
    
    const currentQuery = query !== undefined ? query : searchQuery;
    const currentPage = page !== undefined ? page : 1;
    
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    
    if (currentQuery?.trim()) {
      params.set('q', currentQuery);
    }
    
    const newURL = params.toString() ? `/?${params.toString()}` : '/';
    router.replace(newURL);
  };

  // Update search query and URL
  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    updateURL(1, query); // Always reset to page 1 when searching
  };

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, updateURL }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}

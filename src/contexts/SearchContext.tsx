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
    
    console.log(`🔧 updateURL called with page: ${page}, query: "${query}"`);
    console.log(`🔧 resolved to currentPage: ${currentPage}, currentQuery: "${currentQuery}"`);
    
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    
    if (currentQuery?.trim()) {
      params.set('q', currentQuery);
    }
    
    const newURL = params.toString() ? `/?${params.toString()}` : '/';
    console.log(`🔗 Calling router.push with: ${newURL}`);
    
    try {
      router.push(newURL);
      console.log(`✅ router.push completed for: ${newURL}`);
    } catch (error) {
      console.error(`❌ router.push failed:`, error);
    }
  };

  // Update search query and URL (only reset to page 1 for new searches)
  const setSearchQuery = (query: string) => {
    console.log(`🔍 setSearchQuery called with: "${query}", current: "${searchQuery}"`);
    const isNewSearch = query.trim() !== searchQuery.trim();
    setSearchQueryState(query);
    
    if (isNewSearch) {
      console.log(`🔄 New search detected, navigating to page 1`);
      // Use router.push for new searches to trigger navigation
      const params = new URLSearchParams();
      params.set('page', '1');
      if (query.trim()) {
        params.set('q', query.trim());
      }
      const newURL = params.toString() ? `/?${params.toString()}` : '/';
      router.push(newURL);
    }
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

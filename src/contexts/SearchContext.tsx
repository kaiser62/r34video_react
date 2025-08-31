"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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

  // Update URL when search query changes
  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/');
    }
  };

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
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

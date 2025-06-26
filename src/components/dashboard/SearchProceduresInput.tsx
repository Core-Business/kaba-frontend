"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchProceduresInputProps {
  onSearch: (query: string) => void;
  className?: string;
}

export function SearchProceduresInput({ onSearch, className }: SearchProceduresInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)} data-testid="search-procedures">
      <Input
        placeholder="Buscar procedimientos..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1"
      />
      <Button onClick={handleSearch} size="sm">
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
} 
import { useState } from "react";
import type { SearchFilters } from "../utils/cardApi";

interface CardSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

export default function CardSearchForm({
  onSearch,
  isLoading = false,
}: CardSearchFormProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    name: "",
  });

  const handleInputChange = (value: string) => {
    setFilters({ name: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only search if name is not empty
    if (filters.name && filters.name.trim() !== "") {
      onSearch(filters);
    }
  };

  const handleReset = () => {
    setFilters({ name: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Cards</h2>

      <div className="max-w-md mx-auto">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Card Name
        </label>
        <input
          type="text"
          id="name"
          value={filters.name || ""}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          placeholder="Enter card name to search..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 mt-6">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={isLoading || !filters.name?.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Searching..." : "Search Cards"}
        </button>
      </div>
    </form>
  );
}

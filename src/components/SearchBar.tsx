'use client';

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    searchQuery,
    setSearchQuery,
}) => {
    return (
        <div className="w-full max-w-5xl flex justify-end px-3 mt-2">
            <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-1/2 sm:w-1/3 p-2 border border-gray-600 placeholder:text-gray-600 rounded-md outline-none"
            />
        </div>
    );
};

export default SearchBar;

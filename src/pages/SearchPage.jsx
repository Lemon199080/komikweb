import { useState, useEffect } from 'react';
import { Search, X, BookOpenText, LayoutGrid, List } from 'lucide-react';
import ComicCard from '../components/ComicCard'; // Adjust path as needed

export default function ComicSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Function to fetch comics from the API
  const fetchComics = async (query) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://47.84.51.43:5000/search?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error('Failed to fetch comics');
      }

      const data = await response.json();
      setComics(data.results || []);
    } catch (err) {
      setError(err.message);
      setComics([]);
    } finally {
      setLoading(false);
    }
  };

  // Search when query changes (with debounce)
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        fetchComics(searchQuery);
      } else {
        setComics([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      fetchComics(searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        {/* Dynamic Title Banner */}
        <div className="relative mb-8 animate-slide-in">
          <div className="">
            <div className=""></div>
            <div className=""></div>
          </div>
          {/* Floating Search Bar */}
          <form onSubmit={handleSearch} className="mt-0 relative z-10">
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-1 transform hover:shadow-2xl transition-shadow duration-300">
              <div className="flex absolute inset-y-0 left-0 items-center pl-4 pointer-events-none">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-gray-800 text-white text-lg rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 block w-full pl-12 p-4 transition-all duration-300 ease-in-out"
                placeholder="Search for comics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 animate-in fade-in duration-300"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-6 h-6 text-gray-400 hover:text-purple-400 transition-colors" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Header with View Toggle */}
        <div className="bg-gray-800 rounded-xl shadow-md p-4 mb-6 flex justify-between items-center">
          <p className="text-lg font-semibold text-gray-200">
            {loading ? 'Searching...' : <span>Found <span className="text-purple-400">{comics.length}</span> comics</span>}
          </p>
          <div className="flex items-center bg-gray-700 rounded-lg p-1 space-x-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid' ? 'bg-purple-600 text-white shadow-inner' : 'text-gray-400 hover:bg-gray-600 hover:text-white'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'list' ? 'bg-purple-600 text-white shadow-inner' : 'text-gray-400 hover:bg-gray-600 hover:text-white'
              }`}
              aria-label="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-xl mb-6 shadow-md">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-12 bg-gray-900/50 rounded-xl">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <BookOpenText className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!loading && comics.length > 0 ? (
          <div
            className={viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5'
              : 'space-y-6'}
          >
            {comics.map((comic, index) => (
              <div
                key={index}
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ComicCard comic={comic} viewMode={viewMode} />
              </div>
            ))}
          </div>
        ) : !loading && searchQuery.trim() !== '' ? (
          <div className="bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <Search className="w-16 h-16 text-purple-400 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">No comics found</h3>
            <p className="text-gray-300">Try a different search term or check your spelling.</p>
          </div>
        ) : !loading && searchQuery.trim() === '' ? (
          <div className="bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <BookOpenText className="w-16 h-16 text-purple-400 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Discover Comics</h3>
            <p className="text-gray-300">Search for your favorite comics to get started!</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
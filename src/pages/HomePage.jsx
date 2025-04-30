import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ComicCard from '../components/ComicCard'; // Adjust the import path as needed
import { LayoutGrid, List } from 'lucide-react';

export default function MobileMangaReader() {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('project');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Define API URLs for different tabs
  const API_URLS = {
    project: 'https://api.zeds.rocks',
    mirror: 'https://api.zeds.rocks',
  };

  // Helper function to ensure HD quality thumbnails
  const getHighResImage = (imageUrl) => {
    if (!imageUrl) return "/api/placeholder/300/400";
    
    if (imageUrl.includes('quality=hd') || imageUrl.includes('size=large')) {
      return imageUrl;
    }
    
    if (imageUrl.includes('?')) {
      return `${imageUrl}&quality=hd`;
    } else {
      return `${imageUrl}?quality=hd`;
    }
  };

  // Helper function to extract pathname from link URL
  const getLinkPath = (link) => {
    if (!link) return null;
    try {
      const url = new URL(link);
      return url.pathname; // e.g., "/comic/archamge-restaurant"
    } catch {
      return null; // Return null if link is invalid
    }
  };

  // Fetch comics based on active tab and page
  useEffect(() => {
    const fetchComics = async () => {
      setLoading(true);
      try {
        const apiUrl = activeTab === 'project' ? API_URLS.project : API_URLS.mirror;
        const endpoint = activeTab === 'project' ? '/project' : '/comics';
        const response = await fetch(`${apiUrl}${endpoint}?page=${currentPage}`);

        if (!response.ok) {
          throw new Error('Failed to fetch comics');
        }

        const data = await response.json();

        if (activeTab === 'project') {
          setComics(data); // Direct array from project endpoint
        } else {
          setComics(data.comics.map(comic => ({
            ...comic,
            thumb: getHighResImage(comic.thumb), // Ensure HD thumbnail
            status: comic.status || null, // Default to null if not provided
          })));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
  }, [currentPage, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // If there's an error loading comics
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen px-4 bg-gray-950 text-white">
        <div className="text-center bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg w-full max-w-md">
          <div className="text-red-500 mb-4">
            <i className="fas fa-exclamation-triangle text-4xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Oops! Terjadi Kesalahan</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors duration-300 shadow-md flex items-center justify-center mx-auto"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Loading skeleton - different based on view mode
  const LoadingSkeleton = () => (
    viewMode === 'grid' ? (
      <div className="grid grid-cols-2 gap-3 px-2">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-800 rounded-lg h-52 mb-2"></div>
            <div className="bg-gray-800 h-5 rounded w-3/4 mb-2"></div>
            <div className="bg-gray-800 h-4 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    ) : (
      <div className="px-2">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="animate-pulse flex mb-4">
            <div className="bg-gray-800 rounded-lg h-32 w-24 mr-3"></div>
            <div className="flex-1">
              <div className="bg-gray-800 h-5 rounded w-3/4 mb-2"></div>
              <div className="space-y-2">
                <div className="bg-gray-800 h-4 rounded w-full"></div>
                <div className="bg-gray-800 h-4 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  );

  // Grid view for Project tab
  const GridView = () => (
    <div className="grid grid-cols-2 gap-3 px-2">
      {comics.length > 0 ? (
        comics.map((comic, index) => {
          const linkPath = getLinkPath(comic.link);
          return (
            <div key={index} className="mb-6">
              {linkPath ? (
                <Link to={linkPath}>
                  <div className="relative">
                    <img
                      src={getHighResImage(comic.thumb)}
                      alt={comic.title}
                      className="w-full h-52 object-cover rounded-lg"
                    />
                    
                    {comic.isUP && (
                      <div className="absolute top-1 left-1 bg-red-600 px-1.5 py-0.5 rounded-sm">
                        <span className="text-white text-xs font-bold">UP</span>
                      </div>
                    )}
                    
                    {comic.isHot && (
                      <div className="absolute top-1 right-1 bg-orange-600 px-1.5 py-0.5 rounded-sm">
                        <span className="text-white text-xs font-bold">HOT</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-sm mt-1 line-clamp-2">
                    {comic.title}
                  </h3>

                  <div className="mt-1 space-y-1">
                    {comic.chapters && comic.chapters.length > 0 ? (
                      comic.chapters.slice(0, 2).map((chapter, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-gray-900 rounded-md p-1.5">
                          <span className="text-gray-200">{chapter.number || chapter.title}</span>
                          <span className="text-gray-400">{chapter.timeAgo || chapter.uploaded}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 text-xs py-2">No chapters</div>
                    )}
                  </div>
                </Link>
              ) : (
                <div>
                  <div className="relative">
                    <img
                      src={getHighResImage(comic.thumb)}
                      alt={comic.title}
                      className="w-full h-52 object-cover rounded-lg"
                    />
                    
                    {comic.isUP && (
                      <div className="absolute top-1 left-1 bg-red-600 px-1.5 py-0.5 rounded-sm">
                        <span className="text-white text-xs font-bold">UP</span>
                      </div>
                    )}
                    
                    {comic.isHot && (
                      <div className="absolute top-1 right-1 bg-orange-600 px-1.5 py-0.5 rounded-sm">
                        <span className="text-white text-xs font-bold">HOT</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-sm mt-1 line-clamp-2">
                    {comic.title}
                  </h3>

                  <div className="mt-1 space-y-1">
                    {comic.chapters && comic.chapters.length > 0 ? (
                      comic.chapters.slice(0, 2).map((chapter, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-gray-900 rounded-md p-1.5">
                          <span className="text-gray-200">{chapter.number || chapter.title}</span>
                          <span className="text-gray-400">{chapter.timeAgo || chapter.uploaded}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 text-xs py-2">No chapters</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="col-span-2 flex justify-center items-center py-12">
          <div className="text-center text-gray-400">
            <i className="fas fa-book-open text-4xl mb-3"></i>
            <p>No comics found</p>
          </div>
        </div>
      )}
    </div>
  );

  // List view for Project tab
  const ListView = () => (
    <div className="px-2">
      {comics.length > 0 ? (
        comics.map((comic, index) => {
          const linkPath = getLinkPath(comic.link);
          return (
            <div key={index} className="mb-6">
              {linkPath ? (
                <Link to={linkPath}>
                  <div className="flex">
                    <div className="relative mr-3">
                      <img
                        src={getHighResImage(comic.thumb)}
                        alt={comic.title}
                        className="w-24 h-32 object-cover rounded-lg"
                      />
                      
                      {comic.isUP && (
                        <div className="absolute top-1 left-1 bg-red-600 px-1.5 py-0.5 rounded-sm">
                          <span className="text-white text-xs font-bold">UP</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-sm mb-2 line-clamp-2">
                        {comic.title}
                      </h3>
                      
                      <div className="space-y-1">
                        {comic.chapters && comic.chapters.length > 0 ? (
                          comic.chapters.slice(0, 3).map((chapter, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs bg-gray-900 rounded-md p-1.5">
                              <span className="text-gray-200">{chapter.number || chapter.title}</span>
                              <span className="text-gray-400">{chapter.timeAgo || chapter.uploaded}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 text-xs py-2">No chapters</div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex">
                  <div className="relative mr-3">
                    <img
                      src={getHighResImage(comic.thumb)}
                      alt={comic.title}
                      className="w-24 h-32 object-cover rounded-lg"
                    />
                    
                    {comic.isUP && (
                      <div className="absolute top-1 left-1 bg-red-600 px-1.5 py-0.5 rounded-sm">
                        <span className="text-white text-xs font-bold">UP</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm mb-2 line-clamp-2">
                      {comic.title}
                    </h3>
                    
                    <div className="space-y-1">
                      {comic.chapters && comic.chapters.length > 0 ? (
                        comic.chapters.slice(0, 3).map((chapter, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs bg-gray-900 rounded-md p-1.5">
                            <span className="text-gray-200">{chapter.number || chapter.title}</span>
                            <span className="text-gray-400">{chapter.timeAgo || chapter.uploaded}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 text-xs py-2">No chapters</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="flex justify-center items-center py-12">
          <div className="text-center text-gray-400">
            <i className="fas fa-book-open text-4xl mb-3"></i>
            <p>No comics found</p>
          </div>
        </div>
      )}
    </div>
  );

  // ComicCard view for Mirror tab
  const MirrorView = () => (
    <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3 px-2' : 'px-2'}>
      {comics.length > 0 ? (
        comics.map((comic, index) => (
          <div key={index} className="mb-6">
            <ComicCard comic={comic} viewMode={viewMode} />
          </div>
        ))
      ) : (
        <div className={viewMode === 'grid' ? 'col-span-2' : ''}>
          <div className="flex justify-center items-center py-12">
            <div className="text-center text-gray-400">
              <i className="fas fa-book-open text-4xl mb-3"></i>
              <p>No comics found</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-950 text-white min-h-screen pb-16">
      <div className="flex justify-between items-center px-3 py-2 bg-gray-900 mb-3">
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          <button
            className={`px-3 py-1 text-sm font-medium rounded-lg ${
              activeTab === 'project' ? 'bg-purple-700' : 'text-gray-300'
            }`}
            onClick={() => handleTabChange('project')}
          >
            Project
          </button>
          <button
            className={`px-3 py-1 text-sm font-medium rounded-lg ${
              activeTab === 'mirror' ? 'bg-purple-700' : 'text-gray-300'
            }`}
            onClick={() => handleTabChange('mirror')}
          >
            Mirror
          </button>
        </div>
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
  <button
    onClick={() => setViewMode('grid')}
    className={`p-2 rounded-md transition-all duration-200 ${
      viewMode === 'grid'
        ? 'bg-purple-700 text-white shadow-inner'
        : 'text-gray-400 hover:bg-gray-600 hover:text-white'
    }`}
    aria-label="Grid view"
  >
    <LayoutGrid className="w-5 h-5" />
  </button>
  <button
    onClick={() => setViewMode('list')}
    className={`p-2 rounded-md transition-all duration-200 ${
      viewMode === 'list'
        ? 'bg-purple-700 text-white shadow-inner'
        : 'text-gray-400 hover:bg-gray-600 hover:text-white'
    }`}
    aria-label="List view"
  >
    <List className="w-5 h-5" />
  </button>
</div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        activeTab === 'project' ? (
          viewMode === 'grid' ? <GridView /> : <ListView />
        ) : (
          <MirrorView />
        )
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 flex justify-around items-center py-3 border-t border-gray-800">
        <button className="flex flex-col items-center text-purple-500">
          <div className="w-5 h-5 mb-1 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
          <span className="text-xs">Home</span>
        </button>
        
        <Link to="/search" className="flex flex-col items-center text-gray-400">
  <div className="w-5 h-5 mb-1 flex items-center justify-center">
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  </div>
  <span className="text-xs">Explore</span>
</Link>
        
        <button className="flex flex-col items-center text-gray-400">
          <div className="w-5 h-5 mb-1 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
            </svg>
          </div>
          <span className="text-xs">Library</span>
        </button>
        
        <button className="flex flex-col items-center text-gray-400">
          <div className="w-5 h-5 mb-1 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
          <span className="text-xs">All Series</span>
        </button>
      </div>

      <button 
        className="fixed bottom-20 right-4 bg-gray-800 p-2 rounded-full shadow-lg"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
        </svg>
      </button>
    </div>
  );
}

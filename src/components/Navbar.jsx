import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion'; // For animations

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Untuk mengetahui halaman saat ini

  // Navigate to home
  const navigateToHome = () => {
    navigate('/');
  };

  // Navigate to library
  const navigateToLibrary = () => {
    navigate('/library');
  };

  // Navigate to all series
  const navigateToAllSeries = () => {
    navigate('/series');
  };

  // Check if the current path is /read
  const isReadPage = location.pathname.startsWith('/read');

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="text-white text-2xl font-bold cursor-pointer"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
          >
            ComicApp
          </motion.div>
        </div>
      </nav>

      {/* Bottom Mobile Navigation Bar - Hidden on /read path */}
      {!isReadPage && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 flex justify-around items-center py-3 border-t border-gray-800 md:hidden z-10">
          <button
            className={`flex flex-col items-center ${
              location.pathname === '/' ? 'text-purple-500' : 'text-gray-400'
            }`}
            onClick={navigateToHome}
          >
            <div className="w-5 h-5 mb-1 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            <span className="text-xs">Home</span>
          </button>

          <button
            className={`flex flex-col items-center ${
              location.pathname === '/search' ? 'text-purple-500' : 'text-gray-400'
            }`}
            onClick={() => navigate('/search')}
          >
            <div className="w-5 h-5 mb-1 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </div>
            <span className="text-xs">Explore</span>
          </button>

          <button
            className={`flex flex-col items-center ${
              location.pathname === '/library' ? 'text-purple-500' : 'text-gray-400'
            }`}
            onClick={navigateToLibrary}
          >
            <div className="w-5 h-5 mb-1 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
              </svg>
            </div>
            <span className="text-xs">Library</span>
          </button>

          <button
            className={`flex flex-col items-center ${
              location.pathname === '/series' ? 'text-purple-500' : 'text-gray-400'
            }`}
            onClick={navigateToAllSeries}
          >
            <div className="w-5 h-5 mb-1 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>
            <span className="text-xs">All Series</span>
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
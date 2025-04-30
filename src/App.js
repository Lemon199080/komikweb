import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ComicDetailPage from './pages/ComicDetailPage';
import ReadChapterPage from './pages/ReadChapterPage';
import LibraryPage from './pages/LibraryPage';
import SearchPage from './pages/SearchPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App bg-gray-900 min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/comic/:slug" element={<ComicDetailPage />} />
            <Route path="/read/:chapterSlug" element={<ReadChapterPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </main>
        <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar closeOnClick />
      </div>
    </Router>
  );
}

export default App;
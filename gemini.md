import React, { useState, useEffect, createContext, useContext } from 'react';
// Removed Firebase imports as per request

import { Search, Plus, Heart, MessageSquare, Edit, Trash2, ChevronLeft, ChevronRight, Bookmark, AlertCircle, CheckCircle, XCircle, Settings, LayoutDashboard, Tag, CalendarDays, Bot, Star, Info, ExternalLink } from 'lucide-react';

// --- Utility Functions ---
// Function to generate a unique ID (simplified for client-side use)
const generateId = () => Math.random().toString(36).substring(2, 11);

// Mock Data for Assets
const initialAssets = [
  {
    id: 'asset1',
    title: 'Pitch Deck Generator GPT',
    description: 'Generates compelling pitch deck content for client presentations, including executive summaries and key messaging.',
    type: 'GPT',
    link: 'https://chat.openai.com/g/pitch-deck-generator',
    tier: 'Foundation',
    tags: ['marketing', 'sales', 'presentations', 'pitching'],
    function: 'Content & Creative',
    added_by: 'mock-curator-1',
    date_added: '2024-05-15T10:00:00Z',
    scheduled_feature_date: null,
  },
  {
    id: 'asset2',
    title: 'Audience Insight Analyzer',
    description: 'Analyzes demographic and psychographic data to provide deep audience insights for strategic planning.',
    type: 'GPT',
    link: 'https://chat.openai.com/g/audience-insights-analyzer',
    tier: 'Specialist',
    tags: ['strategy', 'research', 'demographics', 'psychographics'],
    function: 'Audience Insights',
    added_by: 'mock-curator-2',
    date_added: '2024-05-20T14:30:00Z',
    scheduled_feature_date: '2024-05-27',
  },
  {
    id: 'asset3',
    title: 'Media List Builder Template',
    description: 'An Excel template with built-in macros to streamline the creation of targeted media lists.',
    type: 'Doc',
    link: 'https://example.com/media-list-template.xlsx',
    tier: 'Foundation',
    tags: ['media relations', 'outreach', 'excel'],
    function: 'Media List Creation',
    added_by: 'mock-curator-1',
    date_added: '2024-05-10T09:00:00Z',
    scheduled_feature_date: null,
  },
  {
    id: 'asset4',
    title: 'Campaign Analysis Best Practices',
    description: 'A comprehensive guide on best practices for analyzing campaign performance and optimizing results.',
    type: 'Doc',
    link: 'https://example.com/campaign-analysis-guide.pdf',
    tier: 'Foundation',
    tags: ['campaigns', 'analytics', 'best practices'],
    function: 'Campaign & Competitive Analysis',
    added_by: 'mock-curator-3',
    date_added: '2024-05-22T11:00:00Z',
    scheduled_feature_date: null,
  },
  {
    id: 'asset5',
    title: 'Executive Voice Emulation GPT',
    description: 'Crafts communications in a distinct executive voice, suitable for high-level internal and external messaging.',
    type: 'GPT',
    link: 'https://chat.openai.com/g/executive-voice',
    tier: 'Specialist',
    tags: ['executive comms', 'writing', 'tone'],
    function: 'Executive Voice Emulation',
    added_by: 'mock-curator-2',
    date_added: '2024-05-18T16:00:00Z',
    scheduled_feature_date: '2024-06-03',
  },
  {
    id: 'asset6',
    title: 'Social Trends Monitoring Video Guide',
    description: 'A short video tutorial on using AI tools to monitor and identify emerging social media trends.',
    type: 'Video',
    link: 'https://www.youtube.com/watch?v=mock-video-id',
    tier: 'Foundation',
    tags: ['social media', 'trends', 'monitoring'],
    function: 'Monitoring & Alerts',
    added_by: 'mock-curator-3',
    date_added: '2024-05-21T09:30:00Z',
    scheduled_feature_date: null,
  },
];

// Mock User ID
const mockUserId = 'mock-user-12345';

// Header component for navigation and user info
const Header = ({ onNavigate, userId }) => {
  return (
    <header className="bg-gradient-to-r from-[#003366] to-[#663399] text-white p-4 shadow-lg rounded-b-xl"> {/* Deeper blue to purple gradient */}
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-extrabold cursor-pointer" onClick={() => onNavigate('home')}>
          Zeno Knows <span className="text-blue-200 text-xl font-semibold">AI-KMS</span>
        </h1>
        <nav className="space-x-4 flex items-center">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center px-4 py-2 rounded-full hover:bg-white hover:text-[#003366] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <LayoutDashboard className="mr-2" size={20} /> Home
          </button>
          <button
            onClick={() => onNavigate('curator')}
            className="flex items-center px-4 py-2 rounded-full hover:bg-white hover:text-[#003366] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <Settings className="mr-2" size={20} /> Curator Dashboard
          </button>
          {userId && (
            <span className="bg-white text-[#003366] px-3 py-1 rounded-full text-sm font-medium shadow-md">
              User ID: {userId.substring(0, 8)}...
            </span>
          )}
        </nav>
      </div>
    </header>
  );
};

// AssetCard: Displays a single AI asset
const AssetCard = ({ asset, onFavorite, isFavorite, onSelectAsset }) => {
  const isSpecialist = asset.tier === 'Specialist';
  const iconMap = {
    GPT: <Bot size={20} className="text-[#007bff]" />, // Brighter blue for GPT
    Doc: <Info size={20} className="text-[#28a745]" />, // Green for Doc
    Video: <ExternalLink size={20} className="text-[#dc3545]" />, // Red for Video
  };

  return (
    // Stronger yellow for specialist
    <div
      className={`bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${isSpecialist ? 'border-2 border-yellow-500' : 'border border-gray-200'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          {iconMap[asset.type] || <Info size={20} className="text-gray-500" />}
          <span className="ml-2">{asset.title}</span>
        </h3>
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite(asset.id); }}
          className={`p-2 rounded-full transition-colors duration-200 ${isFavorite ? 'text-red-500 bg-red-100' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'}`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{asset.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {asset.tags && asset.tags.map(tag => (
          <span key={tag} className="bg-[#e0f2f7] text-[#007bff] text-xs px-3 py-1 rounded-full font-medium"> {/* Light blue tag */}
            {tag}
          </span>
        ))}
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${isSpecialist ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
          {asset.tier}
        </span>
      </div>
      <button
        onClick={() => onSelectAsset(asset)}
        className="mt-auto w-full bg-[#0056b3] text-white py-2 rounded-lg hover:bg-[#004085] transition-colors duration-300 shadow-md transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#0056b3]" /* Darker blue button */
      >
        View Details
      </button>
    </div>
  );
};

// HomePage: Main landing page with search, AI chat, and featured assets
const HomePage = ({ assets, userFavorites, onFavorite, onSelectAsset }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAssets, setFilteredAssets] = useState(assets);
  const [activeFilters, setActiveFilters] = useState({
    function: 'All',
    tier: 'All',
    newness: 'All',
  });
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' }); // For success/error messages

  // Update filtered assets when assets or filters change
  useEffect(() => {
    let tempAssets = assets.filter(asset =>
      asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (asset.function && asset.function.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (activeFilters.function !== 'All') {
      tempAssets = tempAssets.filter(asset => asset.function === activeFilters.function);
    }
    if (activeFilters.tier !== 'All') {
      tempAssets = tempAssets.filter(asset => asset.tier === activeFilters.tier);
    }
    if (activeFilters.newness === 'New This Week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      tempAssets = tempAssets.filter(asset => new Date(asset.date_added) >= oneWeekAgo);
    }

    setFilteredAssets(tempAssets);
  }, [searchTerm, assets, activeFilters]);

  // Get unique filter options
  const uniqueFunctions = ['All', ...new Set(assets.map(asset => asset.function))].filter(Boolean);
  const uniqueTiers = ['All', ...new Set(assets.map(asset => asset.tier))].filter(Boolean);
  const uniqueNewness = ['All', 'New This Week'];

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Simulate AI chat response
  const handleAiChatSubmit = async () => {
    if (!aiChatInput.trim()) return;

    const userMessage = { role: 'user', text: aiChatInput };
    setAiChatHistory(prev => [...prev, userMessage]);
    setAiChatInput('');

    // Simulate API call to Gemini-2.0-flash
    try {
      const prompt = `User query: "${userMessage.text}". Suggest relevant AI tools from the following list based on their title, description, tags, and function. Also, provide a brief caveat or best practice related to the tool's use.
      Available tools: ${JSON.stringify(assets.map(a => ({ title: a.title, description: a.description, tags: a.tags, function: a.function, tier: a.tier })))}
      Format your response as a friendly suggestion, including the tool's title and a relevant caveat. For example: "Based on your query, 'X Tool' might be helpful. Caveat: Always verify sources."`;

      const chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will automatically provide this at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const aiResponseText = result.candidates[0].content.parts[0].text;
        setAiChatHistory(prev => [...prev, { role: 'ai', text: aiResponseText }]);
      } else {
        setAiChatHistory(prev => [...prev, { role: 'ai', text: "I'm sorry, I couldn't generate a helpful response at this time. Please try rephrasing your query." }]);
        console.error("Unexpected API response structure:", result);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setAiChatHistory(prev => [...prev, { role: 'ai', text: "I'm experiencing some technical difficulties. Please try again later." }]);
    }
  };

  // Get "Top 5 Tools This Week" (most recently added)
  const top5Tools = assets
    .sort((a, b) => new Date(b.date_added) - new Date(a.date_added))
    .slice(0, 5);

  // Message display logic
  const displayMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000); // Clear after 3 seconds
  };

  return (
    <div className="container mx-auto p-6">
      {/* What's New Banner */}
      <div className="bg-[#e0f2f7] border border-[#007bff] text-[#003366] px-6 py-4 rounded-xl mb-8 flex items-center shadow-inner"> {/* Light blue banner */}
        <Info className="mr-3 text-[#0056b3]" size={24} />
        <p className="font-semibold">What's New: Check out our latest additions and updates!</p>
      </div>

      {/* AI Assistant Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <MessageSquare className="mr-3 text-[#663399]" size={28} /> Ask AI Assistant {/* Purple icon */}
        </h2>
        <div className="h-48 overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
          {aiChatHistory.length === 0 ? (
            <p className="text-gray-500 italic">Type your query below, e.g., "Help me plan a campaign."</p>
          ) : (
            aiChatHistory.map((msg, index) => (
              <div key={index} className={`mb-2 p-2 rounded-lg ${msg.role === 'user' ? 'bg-[#e0f2f7] text-[#003366] self-end ml-auto' : 'bg-gray-200 text-gray-800 self-start mr-auto'}`}> {/* User chat bubble light blue */}
                <strong className="capitalize">{msg.role}:</strong> {msg.text}
              </div>
            ))
          )}
        </div>
        <div className="flex">
          <input
            type="text"
            value={aiChatInput}
            onChange={(e) => setAiChatInput(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleAiChatSubmit(); }}
            placeholder="Type your question here..."
            className="flex-grow border border-gray-300 rounded-l-lg p-3 focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition-all duration-200"
          />
          <button
            onClick={handleAiChatSubmit}
            className="bg-[#663399] text-white px-6 py-3 rounded-r-lg hover:bg-[#552277] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#663399]" /* Purple button */
          >
            <Bot size={20} />
          </button>
        </div>
      </div>

      {/* Top 5 Tools This Week */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Star className="mr-3 text-yellow-500" size={28} /> Top 5 Tools This Week
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {top5Tools.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onFavorite={onFavorite}
              isFavorite={userFavorites.includes(asset.id)}
              onSelectAsset={onSelectAsset}
            />
          ))}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Search className="mr-3 text-[#0056b3]" size={28} /> Discover AI Assets {/* Blue icon */}
        </h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search by title, description, tags, or function..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={activeFilters.function}
              onChange={(e) => handleFilterChange('function', e.target.value)}
              className="border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition-all duration-200"
            >
              <option value="All">All Functions</option>
              {uniqueFunctions.map(func => (
                <option key={func} value={func}>{func}</option>
              ))}
            </select>
            <select
              value={activeFilters.tier}
              onChange={(e) => handleFilterChange('tier', e.target.value)}
              className="border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition-all duration-200"
            >
              <option value="All">All Tiers</option>
              {uniqueTiers.map(tier => (
                <option key={tier} value={tier}>{tier}</option>
              ))}
            </select>
            <select
              value={activeFilters.newness}
              onChange={(e) => handleFilterChange('newness', e.target.value)}
              className="border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition-all duration-200"
            >
              <option value="All">All Newness</option>
              {uniqueNewness.map(newness => (
                <option key={newness} value={newness}>{newness}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Display filtered assets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.length > 0 ? (
            filteredAssets.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onFavorite={onFavorite}
                isFavorite={userFavorites.includes(asset.id)}
                onSelectAsset={onSelectAsset}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full py-8">No assets found matching your criteria.</p>
          )}
        </div>
      </div>

      {/* Message display */}
      {message.text && (
        <div className={`fixed bottom-8 right-8 p-4 rounded-lg shadow-xl text-white flex items-center ${message.type === 'success' ? 'bg-[#28a745]' : 'bg-[#dc3545]'}`}> {/* Green/Red for messages */}
          {message.type === 'success' ? <CheckCircle className="mr-2" /> : <XCircle className="mr-2" />}
          {message.text}
        </div>
      )}
    </div>
  );
};

// AssetDetailPage: Shows full details of a selected asset
const AssetDetailPage = ({ asset, onBack, onFavorite, isFavorite }) => {
  const [message, setMessage] = useState({ text: '', type: '' });

  const displayMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000); // Clear after 3 seconds
  };

  const handleRequestAccess = () => {
    console.log(`Access request for asset: ${asset.title} by user: ${mockUserId}`);
    displayMessage('Access request sent to consultants! (Simulated)', 'success');
  };

  const handleFeedback = (helpful) => {
    console.log(`Feedback for asset: ${asset.title} - Helpful: ${helpful} by user: ${mockUserId}`);
    displayMessage(`Feedback recorded: ${helpful ? 'Helpful!' : 'Not helpful.'} (Simulated)`, 'success');
  };

  if (!asset) {
    return (
      <div className="container mx-auto p-6 text-center text-gray-600">
        <p>No asset selected. Please go back to the homepage.</p>
        <button onClick={onBack} className="mt-4 bg-[#0056b3] text-white px-4 py-2 rounded-lg hover:bg-[#004085]"> {/* Blue button */}
          Go Back
        </button>
      </div>
    );
  }

  const isSpecialist = asset.tier === 'Specialist';

  return (
    <div className="container mx-auto p-6">
      <button
        onClick={onBack}
        className="flex items-center text-[#0056b3] hover:text-[#004085] mb-6 transition-colors duration-200" /* Blue text for back button */
      >
        <ChevronLeft size={20} className="mr-2" /> Back to All Assets
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-4xl font-extrabold text-gray-900">{asset.title}</h2>
          <button
            onClick={() => onFavorite(asset.id)}
            className={`p-3 rounded-full transition-colors duration-200 ${isFavorite ? 'text-red-500 bg-red-100' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'}`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart fill={isFavorite ? "currentColor" : "none"} size={28} />
          </button>
        </div>

        <p className="text-gray-700 text-lg mb-6">{asset.description}</p>

        <div className="flex flex-wrap gap-3 mb-8">
          {asset.tags && asset.tags.map(tag => (
            <span key={tag} className="bg-[#e0f2f7] text-[#007bff] text-sm px-4 py-2 rounded-full font-medium"> {/* Light blue tag */}
              {tag}
            </span>
          ))}
          <span className={`text-sm px-4 py-2 rounded-full font-medium ${isSpecialist ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
            {asset.tier}
          </span>
          <span className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-full font-medium">
            Type: {asset.type}
          </span>
          <span className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-full font-medium">
            Function: {asset.function}
          </span>
        </div>

        {isSpecialist ? (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-5 rounded-lg mb-8 flex items-center shadow-inner">
            <AlertCircle className="mr-3 text-yellow-600" size={24} />
            <div>
              <p className="font-semibold text-lg mb-2">Specialist Tool - Access Restricted</p>
              <p>This tool requires specialist consultation. Click below to request access and a team member will reach out to you.</p>
              <button
                onClick={handleRequestAccess}
                className="mt-4 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Request Access
              </button>
            </div>
          </div>
        ) : (
          <a
            href={asset.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-[#0056b3] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#004085] transition-colors duration-300 shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#0056b3] mb-8" /* Blue button */
          >
            {asset.type === 'GPT' ? 'Open GPT' : asset.type === 'Doc' ? 'Download Document' : 'View Video'}
            <ExternalLink className="ml-3" size={24} />
          </a>
        )}

        {/* Embedded Demo Video (Placeholder) */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <ExternalLink className="mr-3 text-[#dc3545]" size={24} /> Demo Video {/* Red icon */}
          </h3>
          <div className="relative w-full h-0 pb-[56.25%] bg-gray-200 rounded-lg overflow-hidden shadow-inner">
            {/* 16:9 Aspect Ratio Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xl font-medium">
              Video Demo Placeholder (e.g., Loom embed)
            </div>
          </div>
        </div>

        {/* Caveats & Best Practices */}
        <div className="bg-[#e0f2f7] border border-[#007bff] text-[#003366] p-5 rounded-lg mb-8 flex items-center shadow-inner"> {/* Light blue banner */}
          <AlertCircle className="mr-3 text-[#0056b3]" size={24} />
          <div>
            <p className="font-semibold text-lg mb-2">Important Caveats & Best Practices:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Mind hallucinations: Always verify information generated by AI.</li>
              <li>Verify sources: Cross-reference data with reliable sources.</li>
              <li>Prompt Engineering: Experiment with prompts for better results.</li>
              <li>Data Privacy: Do not input sensitive client data without approval.</li>
            </ul>
          </div>
        </div>

        {/* Feedback Widget */}
        <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg flex flex-col items-center shadow-inner">
          <p className="font-semibold text-gray-800 mb-3">Was this helpful?</p>
          <div className="flex gap-4">
            <button
              onClick={() => handleFeedback(true)}
              className="bg-[#28a745] text-white px-6 py-3 rounded-lg hover:bg-[#218838] transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#28a745] flex items-center" /* Green button */
            >
              <CheckCircle className="mr-2" size={20} /> Yes
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="bg-[#dc3545] text-white px-6 py-3 rounded-lg hover:bg-[#c82333] transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#dc3545] flex items-center" /* Red button */
            >
              <XCircle className="mr-2" size={20} /> No
            </button>
          </div>
        </div>
      </div>

      {/* Message display */}
      {message.text && (
        <div className={`fixed bottom-8 right-8 p-4 rounded-lg shadow-xl text-white flex items-center ${message.type === 'success' ? 'bg-[#28a745]' : 'bg-[#dc3545]'}`}>
          {message.type === 'success' ? <CheckCircle className="mr-2" /> : <XCircle className="mr-2" />}
          {message.text}
        </div>
      )}
    </div>
  );
};

// AddEditAssetForm: Form for adding or editing an asset
const AddEditAssetForm = ({ assetToEdit, onSave, onCancel, userId }) => {
  const [formData, setFormData] = useState({
    id: assetToEdit?.id || generateId(),
    title: assetToEdit?.title || '',
    description: assetToEdit?.description || '',
    type: assetToEdit?.type || 'GPT',
    link: assetToEdit?.link || '',
    tier: assetToEdit?.tier || 'Foundation',
    tags: assetToEdit?.tags?.join(', ') || '',
    function: assetToEdit?.function || 'Media Relations',
    scheduled_feature_date: assetToEdit?.scheduled_feature_date ? new Date(assetToEdit.scheduled_feature_date).toISOString().split('T')[0] : '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAsset = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      date_added: assetToEdit?.date_added || new Date().toISOString(),
      added_by: assetToEdit?.added_by || userId,
    };
    onSave(newAsset);
  };

  const uniqueFunctions = [
    'Media Relations', 'Media List Creation', 'Monitoring & Alerts',
    'Strategy & Planning', 'Audience Insights', 'Campaign & Competitive Analysis',
    'Content & Creative', 'Executive Voice Emulation', 'Social Trends & Idea Generators',
    'Ops & Governance', 'Compliance Checklists', 'Best Practice Guides'
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">{assetToEdit ? 'Edit Asset' : 'Add New Asset'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-[#0056b3] focus:border-[#0056b3]" /* Blue focus ring */
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-[#0056b3] focus:border-[#0056b3]" /* Blue focus ring */
            required
          ></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-[#0056b3] focus:border-[#0056b3]" /* Blue focus ring */
            >
              <option value="GPT">GPT</option>
              <option value="Doc">Document</option>
              <option value="Video">Video</option>
            </select>
          </div>
          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">Link (URL)</label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-[#0056b3] focus:border-[#0056b3]" /* Blue focus ring */
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tier" className="block text-sm font-medium text-gray-700 mb-1">Access Tier</label>
            <select
              id="tier"
              name="tier"
              value={formData.tier}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-[#0056b3] focus:border-[#0056b3]" /* Blue focus ring */
            >
              <option value="Foundation">Foundation</option>
              <option value="Specialist">Specialist</option>
            </select>
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., marketing, research, analysis"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-[#0056b3] focus:border-[#0056b3]" /* Blue focus ring */
            />
          </div>
        </div>
        <div>
          <label htmlFor="function" className="block text-sm font-medium text-gray-700 mb-1">Function/Category</label>
          <select
            id="function"
            name="function"
            value={formData.function}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-[#0056b3] focus:border-[#0056b3]" /* Blue focus ring */
            >
            {uniqueFunctions.map(func => (
              <option key={func} value={func}>{func}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="scheduled_feature_date" className="block text-sm font-medium text-gray-700 mb-1">Schedule for "Asset of the Week" (Optional Date)</label>
          <input
            type="date"
            id="scheduled_feature_date"
            name="scheduled_feature_date"
            value={formData.scheduled_feature_date}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-[#0056b3] focus:border-[#0056b3]" /* Blue focus ring */
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-[#0056b3] text-white rounded-lg hover:bg-[#004085] transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#0056b3]" /* Blue button */
          >
            {assetToEdit ? 'Update Asset' : 'Add Asset'}
          </button>
        </div>
      </form>
    </div>
  );
};

// CuratorDashboard: Manages assets, tags, and scheduling
const CuratorDashboard = ({ assets, setAssets, userId }) => {
  const [activeTab, setActiveTab] = useState('assets'); // 'assets', 'schedule', 'tags'
  const [assetToEdit, setAssetToEdit] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [allTags, setAllTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    // Extract all unique tags from assets
    const tags = new Set();
    assets.forEach(asset => {
      if (asset.tags) {
        asset.tags.forEach(tag => tags.add(tag));
      }
    });
    setAllTags(Array.from(tags).sort());
  }, [assets]);

  const displayMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000); // Clear after 3 seconds
  };

  const handleSaveAsset = (assetData) => {
    if (assetToEdit) {
      // Edit existing asset
      setAssets(prevAssets => prevAssets.map(asset =>
        asset.id === assetData.id ? assetData : asset
      ));
      displayMessage('Asset updated successfully! (Simulated)', 'success');
    } else {
      // Add new asset
      setAssets(prevAssets => [...prevAssets, assetData]);
      displayMessage('Asset added successfully! (Simulated)', 'success');
    }
    setShowAddForm(false);
    setAssetToEdit(null);
  };

  const handleDeleteAsset = (assetId) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      setAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetId));
      displayMessage('Asset deleted successfully! (Simulated)', 'success');
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) {
      displayMessage('Tag cannot be empty.', 'error');
      return;
    }
    if (allTags.includes(newTag.trim())) {
      displayMessage('Tag already exists.', 'error');
      return;
    }
    setAllTags(prev => [...prev, newTag.trim()].sort());
    setNewTag('');
    displayMessage('Tag added to local list (persist by adding to an asset).', 'success');
  };

  const handleRemoveTag = (tagToRemove) => {
    setAllTags(prev => prev.filter(tag => tag !== tagToRemove));
    displayMessage('Tag removed from local list.', 'success');
  };

  const scheduledAssets = assets.filter(asset => asset.scheduled_feature_date)
    .sort((a, b) => new Date(a.scheduled_feature_date) - new Date(b.scheduled_feature_date)); // FIX: Corrected sorting to use scheduled_feature_date consistently

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Curator Dashboard</h2>

      <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setActiveTab('assets'); setShowAddForm(false); setAssetToEdit(null); }}
            className={`flex-1 py-3 px-6 text-center text-lg font-medium rounded-t-lg transition-colors duration-200 ${activeTab === 'assets' ? 'bg-[#0056b3] text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`} /* Blue active tab */
          >
            <LayoutDashboard className="inline-block mr-2" size={20} /> Assets
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-3 px-6 text-center text-lg font-medium rounded-t-lg transition-colors duration-200 ${activeTab === 'schedule' ? 'bg-[#0056b3] text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`} /* Blue active tab */
          >
            <CalendarDays className="inline-block mr-2" size={20} /> Schedule
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex-1 py-3 px-6 text-center text-lg font-medium rounded-t-lg transition-colors duration-200 ${activeTab === 'tags' ? 'bg-[#0056b3] text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`} /* Blue active tab */
          >
            <Tag className="inline-block mr-2" size={20} /> Tags
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'assets' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-800">All Assets</h3>
                <button
                  onClick={() => { setShowAddForm(true); setAssetToEdit(null); }}
                  className="bg-[#28a745] text-white px-6 py-3 rounded-lg hover:bg-[#218838] transition-colors duration-300 shadow-md flex items-center focus:outline-none focus:ring-2 focus:ring-[#28a745]" /* Green button */
                >
                  <Plus className="mr-2" size={20} /> Add New Asset
                </button>
              </div>

              {showAddForm || assetToEdit ? (
                <AddEditAssetForm
                  assetToEdit={assetToEdit}
                  onSave={handleSaveAsset}
                  onCancel={() => { setShowAddForm(false); setAssetToEdit(null); }}
                  userId={userId}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg shadow-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 rounded-tl-lg">Title</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Type</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Tier</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Function</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Added By</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 rounded-tr-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-6 text-center text-gray-500">No assets available. Add one!</td>
                        </tr>
                      ) : (
                        assets.map(asset => (
                          <tr key={asset.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-800 font-medium">{asset.title}</td>
                            <td className="py-3 px-4 text-gray-600">{asset.type}</td>
                            <td className="py-3 px-4 text-gray-600">{asset.tier}</td>
                            <td className="py-3 px-4 text-gray-600">{asset.function}</td>
                            <td className="py-3 px-4 text-gray-600">{asset.added_by?.substring(0, 8)}...</td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => { setAssetToEdit(asset); setShowAddForm(true); }}
                                  className="p-2 rounded-lg text-[#0056b3] hover:bg-[#e0f2f7] transition-colors duration-200" /* Blue icon button */
                                  aria-label="Edit asset"
                                >
                                  <Edit size={20} />
                                </button>
                                <button
                                  onClick={() => handleDeleteAsset(asset.id)}
                                  className="p-2 rounded-lg text-[#dc3545] hover:bg-red-100 transition-colors duration-200" /* Red icon button */
                                  aria-label="Delete asset"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <CalendarDays className="mr-3 text-[#663399]" size={24} /> Scheduled "Asset of the Week" /* Purple icon */
              </h3>
              {scheduledAssets.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No assets scheduled for feature.</p>
              ) : (
                <ul className="space-y-4">
                  {scheduledAssets.map(asset => (
                    <li key={asset.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                      <div>
                        <p className="font-semibold text-lg text-gray-800">{asset.title}</p>
                        <p className="text-sm text-gray-600">Scheduled for: {new Date(asset.scheduled_feature_date).toLocaleDateString()}</p>
                      </div>
                      <span className="bg-[#e0f2f7] text-[#007bff] text-xs px-3 py-1 rounded-full">{asset.tier}</span> {/* Light blue tag */}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-8 bg-[#e0f2f7] border border-[#007bff] text-[#003366] p-4 rounded-lg flex items-center shadow-inner"> {/* Light blue banner */}
                <Info className="mr-3 text-[#0056b3]" size={20} />
                <p>This section displays assets scheduled for "Asset of the Week." Automated newsletter/Teams messages would be triggered by a backend service.</p>
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Tag className="mr-3 text-[#007bff]" size={24} /> Manage Tags /* Blue icon */
              </h3>
              <div className="flex mb-6">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add new tag..."
                  className="flex-grow border border-gray-300 rounded-l-lg p-3 focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition-all duration-200"
                />
                <button
                  onClick={handleAddTag}
                  className="bg-[#0056b3] text-white px-6 py-3 rounded-r-lg hover:bg-[#004085] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#0056b3]" /* Blue button */
                >
                  Add Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {allTags.length === 0 ? (
                  <p className="text-gray-500">No tags defined yet.</p>
                ) : (
                  allTags.map(tag => (
                    <span key={tag} className="bg-[#e0f2f7] text-[#007bff] text-sm px-4 py-2 rounded-full font-medium flex items-center"> {/* Light blue tag */}
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-[#0056b3] hover:text-[#004085]"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <XCircle size={16} />
                      </button>
                    </span>
                  ))
                )}
              </div>
              <div className="mt-8 bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-lg flex items-center shadow-inner">
                <Info className="mr-3 text-gray-600" size={20} />
                <p>Tags are currently managed client-side for demonstration. In a full system, these would be stored in Firestore and linked to assets.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message display */}
      {message.text && (
        <div className={`fixed bottom-8 right-8 p-4 rounded-lg shadow-xl text-white flex items-center ${message.type === 'success' ? 'bg-[#28a745]' : 'bg-[#dc3545]'}`}>
          {message.type === 'success' ? <CheckCircle className="mr-2" /> : <XCircle className="mr-2" />}
          {message.text}
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  // Removed Firebase context usage
  const userId = mockUserId; // Use a mock user ID
  const isAuthReady = true; // Always true as no auth is performed

  const [currentView, setCurrentView] = useState('home'); // 'home', 'assetDetail', 'curator'
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assets, setAssets] = useState(initialAssets); // Use mock data
  const [userFavorites, setUserFavorites] = useState([]); // Local state for favorites
  const [message, setMessage] = useState({ text: '', type: '' });

  const displayMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000); // Clear after 3 seconds
  };

  const handleFavoriteToggle = (assetId) => {
    let updatedFavorites;
    if (userFavorites.includes(assetId)) {
      updatedFavorites = userFavorites.filter(id => id !== assetId);
      displayMessage('Removed from favorites! (Simulated)', 'success');
    } else {
      updatedFavorites = [...userFavorites, assetId];
      displayMessage('Added to favorites! (Simulated)', 'success');
    }
    setUserFavorites(updatedFavorites); // Update local state
  };

  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    setCurrentView('assetDetail');
  };

  const handleBackToHome = () => {
    setSelectedAsset(null);
    setCurrentView('home');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    setSelectedAsset(null); // Clear selected asset when changing view
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 font-sans text-gray-900">
      <Header onNavigate={handleNavigate} userId={userId} />
      <main className="py-8">
        {/* isAuthReady check is no longer strictly necessary but kept for structural consistency */}
        {isAuthReady && (
          <>
            {currentView === 'home' && (
              <HomePage
                assets={assets}
                userFavorites={userFavorites}
                onFavorite={handleFavoriteToggle}
                onSelectAsset={handleSelectAsset}
              />
            )}
            {currentView === 'assetDetail' && (
              <AssetDetailPage
                asset={selectedAsset}
                onBack={handleBackToHome}
                onFavorite={handleFavoriteToggle}
                isFavorite={userFavorites.includes(selectedAsset?.id)}
              />
            )}
            {currentView === 'curator' && (
              <CuratorDashboard
                assets={assets}
                setAssets={setAssets} // Pass setAssets for local state updates
                userId={userId}
              />
            )}
          </>
        )}
      </main>

      {/* Global Message Display */}
      {message.text && (
        <div className={`fixed bottom-8 right-8 p-4 rounded-lg shadow-xl text-white flex items-center ${message.type === 'success' ? 'bg-[#28a745]' : 'bg-[#dc3545]'}`}>
          {message.type === 'success' ? <CheckCircle className="mr-2" /> : <XCircle className="mr-2" />}
          {message.text}
        </div>
      )}
    </div>
  );
};

// Root component that wraps App (FirebaseProvider removed)
const ZenoKnowsApp = () => (
  <App />
);

export default ZenoKnowsApp;


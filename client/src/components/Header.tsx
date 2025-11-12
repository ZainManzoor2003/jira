import React, { useState } from 'react';
import { Search, Plus, Bell, Settings, Star, Menu } from 'lucide-react';

const UserAvatar: React.FC<{ initial: string }> = ({ initial }) => (
  <div className="flex-shrink-0 w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-semibold border border-gray-300 shadow-sm">
    {initial}
  </div>
);


const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => (
  <header className="flex items-center justify-between p-3 bg-white border-b border-gray-200 sticky top-0 z-30">
    <div className="flex items-center space-x-3">
      <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md">
        <Menu className="w-6 h-6" />
      </button>
      {/* Global Search Bar (smaller version) */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          className="w-xl pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button className="flex items-center bg-blue-600 text-white px-4 py-2 cursor-pointer text-sm font-medium hover:bg-blue-700 transition-colors">
        <Plus className="w-4 h-4 mr-1" />
        Create
      </button>
    </div>

    <div className="flex items-center space-x-4">

      <button className="hidden sm:inline-flex items-center text-purple-700 bg-purple-100 px-3 py-1.5 rounded-lg text-sm font-medium border border-purple-200 hover:bg-purple-200 transition-colors">
        <Star className="w-4 h-4 mr-1" />
        Premium trial
      </button>

      <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800" />
      <Settings className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800" />
      <UserAvatar initial="W" />
    </div>
  </header>
);

export default Header
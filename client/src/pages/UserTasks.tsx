import React, { useState } from 'react';
import {
    Search, Plus, Filter, MoreHorizontal, LayoutDashboard, CheckCircle,
    ChevronDown, List, Clock, FolderOpen, Share2, Star, X,
    MinusSquare
} from 'lucide-react';

import Header from '../components/Header';
import ColumnComponent from '../components/ColumnComponent';

// --- Data Structures ---
interface Task {
    id: string;
    title: string;
    labels: string[];
    dueDate: string;
    comments: number;
    assignees: string[];
}

interface Column {
    id: string;
    title: string;
    statusCount: number;
    tasks: Task[];
    color: string;
}

// --- Mock Data ---
const mockColumns: Column[] = [
    {
        id: 'todo',
        title: 'TO DO',
        statusCount: 2,
        color: 'text-red-500',
        tasks: [
            { id: 't1', title: 'Task 1', labels: ['SCRUM-1'], dueDate: 'Nov 12, 2025', comments: 0, assignees: ['user-a'] },
            { id: 't2', title: 'kaisai ho', labels: ['SCRUM-6'], dueDate: 'Nov 12, 2025', comments: 1, assignees: ['user-b'] },
        ],
    },
    {
        id: 'in-progress',
        title: 'IN PROGRESS',
        statusCount: 1,
        color: 'text-blue-500',
        tasks: [
            { id: 't3', title: 'hello', labels: ['SCRUM-5'], dueDate: 'Nov 17, 2025', comments: 0, assignees: ['user-a'] },
        ],
    },
    {
        id: 'done',
        title: 'DONE',
        statusCount: 1,
        color: 'text-green-500',
        tasks: [
            { id: 't4', title: 'Task 2', labels: ['SCRUM-2'], dueDate: 'Nov 17, 2025', comments: 0, assignees: ['user-a', 'user-c'] },
        ],
    },
];

// --- Main Components ---

const Sidebar: React.FC<{ isOpen: boolean, toggle: () => void }> = ({ isOpen, toggle }) => {
    const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean }> = ({ icon, label, active }) => (
        <div className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
            {icon}
            <span className="ml-3 text-sm">{label}</span>
        </div>
    );

    return (
        <div
            className={`fixed lg:static inset-y-0 left-0 z-40 lg:z-auto bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 lg:w-64 lg:translate-x-0'}`}
            style={{ minWidth: '16rem' }} // Ensure min width on desktop
        >
            <div className="p-4 flex flex-col h-full">

                {/* Navigation */}
                <nav className="space-y-1 overflow-y-auto flex-grow">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">For you</h4>
                    <NavItem icon={<FolderOpen className="w-5 h-5" />} label="Spaces" />
                    <NavItem icon={<Clock className="w-5 h-5" />} label="Recent" />

                    <h4 className="text-xs font-semibold text-gray-500 uppercase mt-4 mb-2">Project</h4>
                    <NavItem
                        icon={<LayoutDashboard className="w-5 h-5" />}
                        label="My Scrum Project"
                        active
                    />
                    <NavItem icon={<List className="w-5 h-5" />} label="More spaces" />
                    <NavItem icon={<Plus className="w-5 h-5" />} label="Browse templates" />
                </nav>

                {/* Bottom actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <NavItem icon={<MoreHorizontal className="w-5 h-5" />} label="Give Feedback" />
                </div>
            </div>
        </div>
    );
};




// --- Main App Component ---
const UserTasks: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const tabs = [
        { name: 'Summary' },
        { name: 'Backlog' },
        { name: 'Board', icon: LayoutDashboard, active: true },
        { name: 'Calendar' },
        { name: 'Timeline' },
        { name: 'Pages' },
        { name: 'Forms' },
        { name: 'More', icon: Plus },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans">

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header toggleSidebar={toggleSidebar} />

                {/* Project Header and Tabs */}
                <div className="bg-white p-4 border-b border-gray-200">

                    {/* Project Title and Actions */}
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-bold text-gray-900 flex items-center">
                            My Scrum Project
                            <span className="text-gray-400 mx-2">/</span>
                            <span className="text-base font-normal text-gray-600">Board</span>
                        </h1>
                        <div className="flex items-center space-x-3 text-gray-600">
                            <Star className="w-5 h-5 cursor-pointer hover:text-yellow-500" />
                            <Share2 className="w-5 h-5 cursor-pointer hover:text-blue-500" />
                            <MoreHorizontal className="w-5 h-5 cursor-pointer hover:text-gray-800" />
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex space-x-6 overflow-x-auto whitespace-nowrap">
                        {tabs.map((tab, index) => (
                            <div
                                key={index}
                                className={`flex items-center py-2 text-sm font-medium cursor-pointer transition-colors ${tab.active
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                                    }`}
                            >
                                {tab.icon && <tab.icon className="w-4 h-4 mr-1.5" />}
                                {tab.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Board Controls / Actions */}
                <div className="p-4 bg-white border-b border-gray-200 flex flex-wrap gap-3 justify-between items-center">
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Search Board */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search board"
                                className="w-48 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Filter */}
                        <button className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300">
                            <Filter className="w-4 h-4 mr-1" />
                            Filter
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Complete Sprint */}
                        <button className="flex items-center text-sm font-medium text-white bg-blue-600 px-4 py-2 hover:bg-blue-700 transition-colors cursor-pointer">
                            Complete sprint
                            <CheckCircle className="w-4 h-4 ml-1" />
                        </button>

                        {/* Group */}
                        <button className="flex items-center text-sm font-medium text-gray-700 bg-white px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300">
                            Group
                            <ChevronDown className="w-4 h-4 ml-1" />
                        </button>

                        {/* More options */}
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Kanban Board Container */}
                
                <main className="flex-1 overflow-x-auto p-4 bg-gray-100">
                    <div className="flex space-x-4 min-h-inherit">
                        {mockColumns.map(column => (
                            <ColumnComponent key={column.id} column={column} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserTasks;
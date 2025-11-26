import React, { useEffect, useState, useCallback } from 'react';
import {
    Search, Plus, Filter, MoreHorizontal, LayoutDashboard, CheckCircle,
    ChevronDown, List, Clock, FolderOpen, Share2, Star, Menu
} from 'lucide-react';
import ColumnComponent from '../components/ColumnComponent';
import axios from 'axios';

// DND-KIT IMPORTS
import { DndContext, closestCorners } from '@dnd-kit/core';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
// END DND-KIT IMPORTS

// NOTE: Assuming Header is a simple component and does not cause errors
const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => (
// ... (Header component code remains the same)
    <div className="bg-white p-4 border-b border-gray-200 flex items-center">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg mr-4">
            <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">Board App</h2>
    </div>
);


// --- Data Structures ---
interface Task {
    id: string;
    title: string;
    labels: string[];
    dueDate: string;
    comments: number;
    assignees: string[];
    status: string; // Used to determine the column
}

interface Column {
    id: string; // This is the droppable ID
    title: string;
    statusCount: number;
    tasks: Task[];
    color: string;
}

// --- Sidebar and NavItem (Corrected) ---
const Sidebar: React.FC<{ isOpen: boolean, toggle: () => void }> = ({ isOpen }) => {
// ... (Sidebar component code remains the same)
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
                <nav className="space-y-1 overflow-y-auto grow">
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
    axios.defaults.baseURL = 'http://localhost:3001'

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [columns, setColumns] = useState<Column[]>([
        { id: "to-do", title: "TO DO", statusCount: 0, color: "text-red-500", tasks: [] },
        { id: "in-progress", title: "IN PROGRESS", statusCount: 0, color: "text-blue-500", tasks: [] },
        { id: "done", title: "DONE", statusCount: 0, color: "text-green-500", tasks: [] },
    ]);

    const getAllTasks = async () => {
        const res = await axios.get("/task/all");
        return res.data;
    };

    // Add task
    const addTask = async (data: {
        taskName: string;
        projectName: string;
        status: string;
        due_date: string;
    }) => {
        const res = await axios.post("/task/add", data);
        return res.data;
    };

    // Update task status / fields (Unused but kept for completeness)
    const updateTask = async (id: string, data: any) => {
        const { updatedStatus } = data
        const payload = {
            status: updatedStatus // Included status update
        }
        const res = await axios.put(`/task/update/status/${id}`, payload);
        return res.data;
    };

    // Helper to find a column by ID
    const findColumn = (id: UniqueIdentifier) => {
        if (id === "to-do" || id === "in-progress" || id === "done") {
            return id as string;
        }
        const taskColumn = columns.find(column => column.tasks.some(task => task.id === id));
        return taskColumn?.id;
    }

    // DND Handlers
    const handleDragEnd = async ({ active, over }: DragEndEvent) => {
        // Active is the draggable item (TaskCard)
        // Over is the droppable container (ColumnComponent)
        if (!over) return;

        const activeTaskId = active.id.toString();
        const overColumnId = over.id.toString();

        console.log(activeTaskId, overColumnId);

        const activeColumnId = findColumn(activeTaskId);

        if (!activeColumnId) return;

        // Find the task that was moved
        const movedTask = columns.find(col => col.id === activeColumnId)?.tasks.find(task => task.id === activeTaskId);

        console.log(movedTask)
        
        if (!movedTask || activeColumnId === overColumnId) {
            // Only column reordering is allowed, no internal task sorting for now
            // If the task is dropped in the same column, do nothing
            return;
        }

        // 1. Optimistic UI update
        setColumns(prevColumns => {
            const newColumns = prevColumns.map(col => ({ ...col }));

            const sourceColumn = newColumns.find(col => col.id === activeColumnId);
            const destinationColumn = newColumns.find(col => col.id === overColumnId);
            
            if (!sourceColumn || !destinationColumn) return prevColumns;

            // Remove task from source column
            const taskIndex = sourceColumn.tasks.findIndex(task => task.id === activeTaskId);
            if (taskIndex !== -1) {
                const [taskToMove] = sourceColumn.tasks.splice(taskIndex, 1);
                
                // Add task to destination column
                taskToMove.status = overColumnId; // Update local status
                destinationColumn.tasks.push(taskToMove);
                
                // Recalculate counts
                sourceColumn.statusCount = sourceColumn.tasks.length;
                destinationColumn.statusCount = destinationColumn.tasks.length;
            }

            return newColumns;
        });

        // 2. Persist change to the backend
        try {
            await updateTask(activeTaskId, { // keep date
                updatedStatus: overColumnId,       // update status
            });
            // Re-fetch to ensure data is in sync (optional, can be skipped if optimism is high)
            // await fetchTasks(); 
        } catch (error) {
            console.error("Failed to update task status on server", error);
            // Re-fetch to revert optimistic update on failure
            await fetchTasks();
        }
    };
    
    // Fetch tasks from DB
    const fetchTasks = async () => {
        const allTasks: any[] = await getAllTasks(); // Assuming response is an array

        const grouped = {
            "to-do": [],
            "in-progress": [],
            "done": [],
        } as { [key: string]: Task[] };

        allTasks.forEach((t: any) => {
            const task: Task = {
                id: t.id.toString(), // Ensure ID is a string for Dnd-Kit's UniqueIdentifier
                title: t.taskName,
                labels: [t.projectName],
                comments: 0,
                assignees: [],
                dueDate: t.due_date ? new Date(t.due_date).toDateString() : 'No date',
                status: t.status,
            };
            if (grouped[t.status]) {
                grouped[t.status].push(task);
            }
        });

        setColumns(prev =>
            prev.map(col => ({
                ...col,
                tasks: grouped[col.id] || [],
                statusCount: (grouped[col.id] || []).length
            }))
        );
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // CREATE NEW TASK (passes to ColumnComponent)
    const handleAddTask = async (columnId: string, title: string, dueDate: string) => {
        const payload = {
            taskName: title,
            projectName: "SCRUM", // can make dynamic
            status: columnId,
            due_date: dueDate,
        };

        await addTask(payload);
        fetchTasks(); // refresh UI
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const deleteTask = async (taskId: string) => {
        try {
            const res = await axios.delete(`/task/delete/${taskId}`);
            console.log("Task deleted:", res.data);
            return res.data;
        } catch (error) {
            console.error("Error deleting task:", error);
            throw error;
        }
    };
    const handleTaskAction = async (taskId: string, action: 'delete' | 'update', updateData: any) => {
        try {
            if (action === 'delete') {
                await deleteTask(taskId);
                console.log(`Task ${taskId} deleted successfully`);
                fetchTasks(); // refresh your task list after deletion
            } else if (action === 'update') {
                if (!updateData) {
                    console.log("No update data provided");
                    return;
                }
                const updatedPayload = { ...updateData, updatedStatus: findColumn(taskId) } // keep status
                await updateTask(taskId, updatedPayload);
                console.log(`Task ${taskId} updated successfully`);
                fetchTasks(); // refresh your task list after update
            }
        } catch (error) {
            console.error(`Error performing ${action} on task ${taskId}:`, error);
        }
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
            {/* ... (Sidebar and Overlay components) */}
            <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            <div className="flex-1 flex flex-col min-w-0">
                <Header toggleSidebar={toggleSidebar} />

                {/* Project Header and Tabs */}
                {/* ... (Project Header and Tabs) */}
                <div className="bg-white p-4 border-b border-gray-200">
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
                {/* ... (Board Controls) */}
                <div className="p-4 bg-white border-b border-gray-200 flex flex-wrap gap-3 justify-between items-center">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search board"
                                className="w-48 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300">
                            <Filter className="w-4 h-4 mr-1" />
                            Filter
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <button className="flex items-center text-sm font-medium text-white bg-blue-600 px-4 py-2 hover:bg-blue-700 transition-colors cursor-pointer">
                            Complete sprint
                            <CheckCircle className="w-4 h-4 ml-1" />
                        </button>

                        <button className="flex items-center text-sm font-medium text-gray-700 bg-white px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300">
                            Group
                            <ChevronDown className="w-4 h-4 ml-1" />
                        </button>

                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Kanban Board Container - WRAPPED WITH DNDCONTEXT */}
                <main className="flex-1 overflow-x-auto p-4 bg-gray-100">
                    <DndContext
                        // sensors={[]} // Keep empty for simpler implementation, focusing on manual drag
                        collisionDetection={closestCorners}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex space-x-4 min-h-inherit">
                            {columns.map(col => (
                                <ColumnComponent
                                    key={col.id}
                                    column={col}
                                    onAddTask={handleAddTask}
                                    onTaskAction={handleTaskAction}
                                    // Pass task IDs for Droppable to know its children
                                    taskIds={col.tasks.map(t => t.id)}
                                />
                            ))}
                        </div>
                    </DndContext>
                </main>
            </div>
        </div>
    );
};

export default UserTasks;
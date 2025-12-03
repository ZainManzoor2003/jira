import React, { useEffect, useState, useCallback } from 'react';
import {
    Search, Plus, Filter, MoreHorizontal, LayoutDashboard, CheckCircle,
    ChevronDown, List, Clock, FolderOpen, Share2, Star, Menu,
    LogOut,
    Pencil,
    Trash2,
    X,
    Copy,
    Check,
    UserCheck,
    ArrowDown
} from 'lucide-react';
import ColumnComponent from '../components/ColumnComponent';
import axios from 'axios';
import Cookies from 'js-cookie';

// DND-KIT IMPORTS
import { DndContext, closestCorners } from '@dnd-kit/core';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
// END DND-KIT IMPORTS

// NOTE: Assuming Header is a simple component and does not cause errors
const Header: React.FC<{ toggleSidebar: () => void, text: string }> = ({ toggleSidebar, text }) => (
    // ... (Header component code remains the same)
    <div className="bg-white p-4 border-b border-gray-200 flex items-center">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg mr-4">
            <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">{text}</h2>
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

interface Project {
    id: string;
    projectName: string;
}

// Define the props for the main component
interface ProjectListSectionProps {
    projects: Project[];
    assignedProjects: Project[];
    fetchProjects: () => void;
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

const ProjectListSection: React.FC<ProjectListSectionProps> = ({ projects, fetchProjects, assignedProjects }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [updateProjectId, setUpdateProjectId] = useState("");
    const [updatedProjectName, setUpdatedProjectName] = useState("");
    const [copied, setCopied] = useState(false);


    const navigate = useNavigate()

    axios.defaults.baseURL = 'http://localhost:8080'

    const handleUpdateProject = async (id: string, projectName: string) => {
        const payload: any = {};
        if (!projectName.trim()) return alert("Project name is required");

        payload.projectName = projectName
        try {
            const res = await axios.put(`/project/update/${id}`, payload, {
                withCredentials: true, // sends cookies if your API uses JWT in cookies
            });
            console.log("Project Updated:", res.data);
            setUpdatedProjectName('')
            setIsUpdateOpen(false)
            fetchProjects()
        } catch (error) {
            console.error("Error updating project:", error);
            throw error;
        }

    };

    const handleDeleteProject = async (id: string) => {
        try {
            const res = await axios.delete(`/project/delete/${id}`, {
                withCredentials: true
            });
            console.log("Project deleted:", res.data);
            fetchProjects()
        } catch (error) {
            console.error("Error deleting project:", error);
            throw error;
        }
    };

    const createProject = async () => {
        if (!projectName.trim()) return alert("Project name is required");

        try {
            const res = await axios.post("project/add", {
                projectName: projectName,
            }, { withCredentials: true });

            console.log("Created:", res.data);


            fetchProjects();  // reset
        } catch (err: any) {
            if (err.response && err.response.status === 409) {
                toast.error(err.response.data.message); // show "Project with this name already exists"
            } else {
                console.error(err);
            }
        }
        setIsOpen(false);     // close modal
        setProjectName("");
    };

    const handleLogout = () => {
        Cookies.remove("token"); // remove token cookie
        navigate("/login")// redirect to login
    };

    const handleCopy = async (projectName: string) => {
        const text = `http://localhost:5173/login?project=${projectName}`;
        try {
            // Primary API
            await navigator.clipboard.writeText(text);
            setCopied(true);
            // Reset visual feedback after 1.6s
            setTimeout(() => setCopied(false), 1600);
        } catch (err) {
            console.error("Copy failed");
            alert("Unable to copy");
        }
    };

    return (
        // Main content area wrapper below the Header
        <div className="flex-1 overflow-y-auto bg-gray-50 min-h-0">

            {/* Grid or List Layout Container */}
            <div className="">
                <div className='m-2 flex justify-end items-center gap-2'>
                    <button onClick={() => setIsOpen(true)} className="flex items-center text-sm font-medium text-white bg-blue-600 px-4 
                                py-2 hover:bg-blue-700 transition-colors cursor-pointer">
                        New Project
                        <Plus className="w-4 h-4 ml-1" />
                    </button>
                    <LogOut className="w-5 h-5 cursor-pointer hover:text-gray-800 hover:text-red-500 " onClick={handleLogout} />
                </div>
                {projects.length === 0 ?
                    <>
                        <p className="text-gray-500 italic p-2">No your projects found. Start by creating a new one!</p>
                    </> :
                    (
                        <>


                            {projects.map((project) => (
                                <>
                                    <div
                                        key={project.id}
                                        className="flex items-center justify-between p-4 bg-white shadow-sm hover:shadow-md transition 
                            duration-150 border border-gray-200"
                                    >
                                        {/* Project Name (Column Wise Display) */}
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-md  text-black-500 hover:underline cursor-pointer"
                                                onClick={() => {
                                                    navigate(`/user/dashboard/projects/${project.projectName}`);
                                                }}

                                            >
                                                {project.projectName}
                                            </h2>
                                        </div>

                                        {/* Action Buttons (End of Row) */}
                                        <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                                            <button
                                                onClick={() => handleCopy(project.projectName)}
                                                aria-label="Copy text"
                                                title={copied ? "Copied!" : "Copy"}
                                                style={{
                                                    display: "inline-flex",
                                                    gap: 8,
                                                    alignItems: "center",
                                                    padding: "8px 12px",
                                                    borderRadius: 8,
                                                    border: "1px solid #ddd",
                                                    background: copied ? "#e6ffed" : "#fff",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check size={16} />
                                                        <span>Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={16} />
                                                        <span>Invite Link</span>
                                                    </>
                                                )}
                                            </button>
                                            {/* Update Button */}
                                            <button
                                                onClick={() => {
                                                    setIsUpdateOpen(true); setUpdatedProjectName(project.projectName);
                                                    setUpdateProjectId(project.id)
                                                }}
                                                className="p-2 rounded-full text-blue-500 hover:bg-blue-100 transition duration-150 cursor-pointer"
                                                title={`Update ${project.projectName}`}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDeleteProject(project.id)}
                                                className="p-2 rounded-full text-red-500 hover:bg-red-100 transition duration-150 cursor-pointer"
                                                title={`Delete ${project.projectName}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div >
                                    {isUpdateOpen && (
                                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                            <div className="bg-white w-full max-w-sm p-6 rounded-lg shadow-lg relative">

                                                {/* Close button (X) */}
                                                <button
                                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-800"
                                                    onClick={() => setIsUpdateOpen(false)}
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>

                                                <h2 className="text-lg font-semibold mb-4">Update Project</h2>

                                                {/* Input */}
                                                <input
                                                    type="text"
                                                    placeholder="Project Name"
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                                    value={updatedProjectName}
                                                    onChange={(e) => setUpdatedProjectName(e.target.value)}
                                                />

                                                {/* Buttons */}
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                                                        onClick={() => setIsUpdateOpen(false)}
                                                    >
                                                        Cancel
                                                    </button>

                                                    <button
                                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                        onClick={() => handleUpdateProject(updateProjectId, updatedProjectName)}
                                                    >
                                                        Update
                                                    </button>
                                                </div>

                                            </div>
                                        </div>
                                    )}
                                </>

                            ))}

                        </>
                    )}

                {assignedProjects.length === 0 ?
                    <>
                        <p className="text-gray-500 italic p-2">No assigned projects found.</p>
                    </> :
                    (
                        <>


                            {assignedProjects.map((project) => (
                                <>
                                    <div
                                        key={project.id}
                                        className="flex items-center justify-between p-4 bg-white shadow-sm hover:shadow-md transition 
                            duration-150 border border-gray-200"
                                    >
                                        {/* Project Name (Column Wise Display) */}
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-md  text-black-500 hover:underline cursor-pointer"
                                                onClick={() => {
                                                    navigate(`/user/dashboard/projects/${project.projectName}`);
                                                }}

                                            >
                                                {project.projectName}
                                            </h2>
                                        </div>
                                            <ArrowDown className="w-4 h-4" />



                                    </div >
                                </>

                            ))}

                        </>
                    )}
                {isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white w-full max-w-sm p-6 rounded-lg shadow-lg relative">

                            {/* Close button (X) */}
                            <button
                                className="absolute right-3 top-3 text-gray-500 hover:text-gray-800"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-lg font-semibold mb-4">Create New Project</h2>

                            {/* Input */}
                            <input
                                type="text"
                                placeholder="Project Name"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                            />

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    onClick={createProject}
                                >
                                    Create
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div >
    );
};

// --- Main App Component ---
const UserDashboard: React.FC = () => {
    axios.defaults.baseURL = 'http://localhost:8080'

    const { projectName } = useParams()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate()

    const [projects, setProjects] = useState<Project[]>([]);
    const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
    const [canModify, setCanModify] = useState(true);

    const [columns, setColumns] = useState<Column[]>([
        { id: "to-do", title: "TO DO", statusCount: 0, color: "text-red-500", tasks: [] },
        { id: "in-progress", title: "IN PROGRESS", statusCount: 0, color: "text-blue-500", tasks: [] },
        { id: "done", title: "DONE", statusCount: 0, color: "text-green-500", tasks: [] },
    ]);
    const [filterColumns, setFilterColumns] = useState<Column[]>([
        { id: "to-do", title: "TO DO", statusCount: 0, color: "text-red-500", tasks: [] },
        { id: "in-progress", title: "IN PROGRESS", statusCount: 0, color: "text-blue-500", tasks: [] },
        { id: "done", title: "DONE", statusCount: 0, color: "text-green-500", tasks: [] },
    ]);

    const getAllTasks = async () => {
        const res = await axios.get(`/task/all/${projectName}`, { withCredentials: true });
        console.log(res.data)
        setCanModify(res.data.canModify)
        return res.data.allTasks;
    };
    const fetchProjects = async () => {
        const res = await axios.get("/project/getProjects", { withCredentials: true });
        setProjects(res.data.myProjects);
        setAssignedProjects(res.data.assignedProjects);
    };

    // Add task
    const addTask = async (data: {
        taskName: string;
        projectName: string | undefined;
        status: string;
        due_date: string;
    }) => {
        try {
            const res = await axios.post("/task/add", data, { withCredentials: true });
            return res.data;
        } catch (err: any) {
            if (err.response && err.response.status === 409) {
                toast.error(err.response.data.message); // show "Project with this name already exists"
            } else {
                console.error(err);
            }
        }

    };

    const updateTask = async (taskId: string, data: any) => {
        const payload: any = {};

        if (data.updatedTaskTitle) {
            payload.taskName = data.updatedTaskTitle;
        }
        if (data.updatedDueDate) {
            payload.due_date = data.updatedDueDate;
        }
        payload.projectName = projectName

        const res = await axios.put(`/task/update/${taskId}`, payload, {
            withCredentials: true, // sends cookies if your API uses JWT in cookies
        });

        return res.data;
    };

    // Update task status / fields (Unused but kept for completeness)
    const updateTaskStatus = async (id: string, data: any) => {
        const { updatedStatus } = data
        const payload = {
            status: updatedStatus // Included status update
        }
        const res = await axios.put(`/task/update/status/${id}`, payload, { withCredentials: true });
        return res.data;
    };

    const commentTask = async (taskId: string, comment: string) => {
        if (!comment || !comment.trim()) {
            throw new Error("Comment cannot be empty");
        }

        const payload = { comment };

        const res = await axios.post(`/task/comment/${taskId}`, payload, {
            withCredentials: true, // ensures cookies (JWT) are sent
        });

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

        let newColumns: Column[] = [];
        // 1. Optimistic UI update
        setColumns(prevColumns => {
            newColumns = prevColumns.map(col => ({ ...col }));

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
        // 1. Optimistic UI update
        setFilterColumns(newColumns);

        // 2. Persist change to the backend
        try {
            await updateTaskStatus(activeTaskId, { // keep date
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
        setFilterColumns(prev =>
            prev.map(col => ({
                ...col,
                tasks: grouped[col.id] || [],
                statusCount: (grouped[col.id] || []).length
            }))
        );
    };

    useEffect(() => {
        fetchTasks();
    }, [projectName]);
    useEffect(() => {
        fetchProjects();
    }, []);

    // CREATE NEW TASK (passes to ColumnComponent)
    const handleAddTask = async (columnId: string, title: string, dueDate: string) => {
        const payload = {
            taskName: title,
            projectName: projectName, // can make dynamic
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
            const res = await axios.delete(`/task/delete/${taskId}/${projectName}`, {
                withCredentials: true
            });
            console.log("Task deleted:", res.data);
            return res.data;
        } catch (error) {
            console.error("Error deleting task:", error);
            throw error;
        }
    };
    const handleTaskAction = async (taskId: string, action: 'delete' | 'update' | 'comment', data: any) => {
        try {
            if (action === 'delete') {
                await deleteTask(taskId);
                console.log(`Task ${taskId} deleted successfully`);
                fetchTasks(); // refresh your task list after deletion
            } else if (action === 'update') {
                if (!data) {
                    console.log("No update data provided");
                    return;
                }
                console.log(data)
                await updateTask(taskId, data);
                console.log(`Task ${taskId} updated successfully`);
                fetchTasks(); // refresh your task list after update
            }
            else if (action === 'comment') {
                if (!data) {
                    console.log("No comment data provided");
                    return;
                }
                const { comment } = data;

                await commentTask(taskId, comment);
                console.log(`Task ${taskId} commented successfully`);
                fetchTasks(); // refresh your task list after comment
            }
        } catch (error) {
            console.error(`Error performing ${action} on task ${taskId}:`, error);
        }
    };

    const filterTasks = (value: string) => {
        setSearchTerm(value);
        console.log(value)
        if (value === '') {
            setFilterColumns(columns)
        }
        else {
            const newColumns = columns.map(col => ({
                ...col,
                tasks: col.tasks.filter(task => task.title.toLowerCase().includes(value.toLowerCase())),
                statusCount: col.tasks.filter(task => task.title.toLowerCase().includes(value.toLowerCase())).length
            }))

            setFilterColumns(newColumns)
        }
    }
    const handleLogout = () => {
        Cookies.remove("token"); // remove token cookie
        navigate("/login")// redirect to login
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

            {projectName == undefined ?
                <div className="flex-1 flex flex-col min-w-0">
                    <Header toggleSidebar={toggleSidebar} text={'Projects'} />
                    <ProjectListSection
                        projects={projects}
                        fetchProjects={fetchProjects}
                        assignedProjects={assignedProjects}
                    />
                </div> :

                <div className="flex-1 flex flex-col min-w-0">
                    <Header toggleSidebar={toggleSidebar} text={'Board App'} />

                    {/* Project Header and Tabs */}
                    {/* ... (Project Header and Tabs) */}
                    <div className="bg-white p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-xl font-bold text-gray-900 flex items-center">
                                {projectName}
                                <span className="text-gray-400 mx-2">/</span>
                                <span className="text-base font-normal text-gray-600">Board</span>
                            </h1>
                            <div className="flex items-center space-x-3 text-gray-600">
                                <Star className="w-5 h-5 cursor-pointer hover:text-yellow-500" />
                                <Share2 className="w-5 h-5 cursor-pointer hover:text-blue-500" />
                                <LogOut className="w-5 h-5 cursor-pointer hover:text-gray-800 hover:text-red-500 " onClick={handleLogout} />
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
                                    onChange={(e) => filterTasks(e.target.value)}
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
                                {filterColumns.map(col => (
                                    <ColumnComponent
                                        key={col.id}
                                        column={col}
                                        onAddTask={handleAddTask}
                                        onTaskAction={handleTaskAction}
                                        // Pass task IDs for Droppable to know its children
                                        taskIds={col.tasks.map(t => t.id)}
                                        canModify={canModify}
                                    />
                                ))}
                            </div>
                        </DndContext>
                    </main>
                </div>
            }
        </div>
    );
};

export default UserDashboard;
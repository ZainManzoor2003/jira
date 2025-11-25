import React, { useState } from "react";
import { MoreHorizontal, Calendar, MessageSquare, Trash2, Edit } from 'lucide-react';


// --- Data Structures ---
// The Task interface matches the requirements from the parent components.
interface Task {
  id: string; 
  title: string; 
  labels: string[]; 
  dueDate: string;
  comments: number; 
  assignees: string[]; 
  status: string; 
}

// --- Props for TaskCard ---
interface TaskCardProps {
    task: Task;
    // New prop to handle actions (Delete/Update)
    onTaskAction: (taskId: string, action: 'delete' | 'update', updateData: any) => void;
    setIsUpdateTask: React.Dispatch<React.SetStateAction<boolean>>
    setTaskId: React.Dispatch<React.SetStateAction<string>>
    setUpdatedTaskTitle: React.Dispatch<React.SetStateAction<string>>
}


const UserAvatar: React.FC<{ initial: string }> = ({ initial }) => (
  <div className="flex-shrink-0 w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-semibold border border-gray-300 shadow-sm">
    {initial}
  </div>
);

// TaskCard Component with Dropdown Logic
const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskAction,setIsUpdateTask,setTaskId,setUpdatedTaskTitle}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the card click event from firing
        setIsMenuOpen(prev => !prev);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onTaskAction(task.id, 'delete',null);
        setIsMenuOpen(false);
    };

    const handleUpdate = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsUpdateTask(true);
        setTaskId(task.id)
        setUpdatedTaskTitle(task.title)
        setIsMenuOpen(false);
    };

    return (
        // Add a click handler to close the menu when clicking anywhere on the card (but not the menu button)
        <div 
            className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 cursor-pointer mb-3 relative" // Added 'relative' for dropdown positioning
            onClick={() => {
                // If the card itself is clicked, you might want to open a modal for full task view
                // For now, let's just ensure the menu is closed if opened
                if (isMenuOpen) setIsMenuOpen(false);
                // console.log(`Task ${task.id} clicked for details.`);
            }}
        >
            <p className="text-sm font-medium text-gray-800 mb-2">{task.title}</p>
            
            {/* Labels */}
            <div className="flex flex-wrap gap-1 mb-2">
                {task.labels.map(label => (
                    <span key={label} className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {label}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>{task.dueDate}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                    {/* Comments */}
                    {task.comments > 0 && (
                        <div className="flex items-center space-x-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{task.comments}</span>
                        </div>
                    )}
                    
                    {/* Assignees */}
                    <div className="flex -space-x-1">
                        {task.assignees.map((a, index) => (
                            <UserAvatar key={index} initial={a.charAt(5).toUpperCase()} />
                        ))}
                    </div>

                    {/* MoreHorizontal Button and Dropdown Container */}
                    <div className="relative">
                        <MoreHorizontal 
                            className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" 
                            onClick={toggleMenu}
                        />

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 top-6 w-32 bg-white rounded-lg shadow-xl z-10 border border-gray-100 origin-top-right transform transition-all duration-200 animate-in fade-in zoom-in-95">
                                <button 
                                    onClick={handleUpdate}
                                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Update
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
import React, { useState, useEffect } from "react";
import { MoreHorizontal, Calendar, MessageSquare, Trash2, Edit, MessagesSquare } from 'lucide-react';

// --- Data Structures ---
interface Task {
    id: string;
    title: string;
    labels: string[];
    dueDate: string;
    comments: number;
    assignees: string[];
    status: string;
}

interface TaskCardProps {
    task: Task;
    onTaskAction: (taskId: string, action: 'delete' | 'update', updateData: any) => void;
    setIsUpdateTask: React.Dispatch<React.SetStateAction<boolean>>
    setIsComment: React.Dispatch<React.SetStateAction<boolean>>
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setTaskId: React.Dispatch<React.SetStateAction<string>>
    setUpdatedTaskTitle: React.Dispatch<React.SetStateAction<string>>
    setUpdatedDueDate: React.Dispatch<React.SetStateAction<string>>
    canModify: boolean;
}

const UserAvatar: React.FC<{ initial: string }> = ({ initial }) => (
    <div className="flex-shrink-0 w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-semibold border border-gray-300 shadow-sm">
        {initial}
    </div>
);

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskAction, setIsUpdateTask, setIsComment, setTaskId, setUpdatedTaskTitle,
    setUpdatedDueDate, canModify, setIsModalOpen }) => {

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const handleDelete = (e?: React.MouseEvent | KeyboardEvent) => {
        e?.stopPropagation?.();
        if (selectedTaskId === task.id) {
            onTaskAction(task.id, 'delete', null);
            setIsMenuOpen(false);
            setSelectedTaskId(null);
        }
    };

    const handleUpdate = (e: React.MouseEvent) => {
        if (canModify === false) return;
        e.stopPropagation();
        setIsUpdateTask(true);
        setTaskId(task.id);
        setUpdatedTaskTitle(task.title);
        const dateValue = new Date(task.dueDate).toISOString().split('T')[0];
        setUpdatedDueDate(dateValue);
        setIsMenuOpen(false);
    };

    // ⌨️ Keyboard Delete Key Listener
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete") {
                console.log('Key pressed:', e.key);
                handleDelete(e);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [selectedTaskId]);

    return (
        <div
            onDoubleClick={() => setSelectedTaskId(task.id)}
            className={`bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow border relative 
                ${selectedTaskId === task.id ? "border-blue-500" : "border-gray-200"}`}
        >
            <p className="text-sm font-medium text-gray-800 mb-2" onDoubleClick={handleUpdate}>{task.title}</p>

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
                    <span onDoubleClick={handleUpdate}>{task.dueDate}</span>
                </div>

                <div className="flex items-center space-x-2">
                    {
                        task.comments > 0 && (
                            <div className="flex items-center space-x-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{task.comments}</span>
                            </div>
                        )}

                    <div className="flex -space-x-1">
                        {task.assignees.map((a, index) => (
                            <UserAvatar key={index} initial={a.charAt(5).toUpperCase()} />
                        ))}
                    </div>

                    <div className="flex-col">
                        <div className="flex justify-end">

                            <MessagesSquare
                                className="w-4 h-4 text-gray-400 hover:text-gray-800 cursor-pointer"
                                onDoubleClick={() => { setIsComment(true); setTaskId(task.id); setIsMenuOpen(false); }}
                            />
                        </div>
                        <button
                            onDoubleClick={() => { setTaskId(task.id); setIsModalOpen(true) }}
                            className="text-xs text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
                            title="View all task comments"
                        >
                            View comments
                        </button>

                        {/* {isMenuOpen && (
                            <div className="absolute right-0 top-6 w-32 bg-white rounded-lg shadow-xl z-10 border border-gray-100">
                                <button
                                    onDoubleClick={handleUpdate}
                                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Update
                                </button>
                                <button
                                    onDoubleClick={handleDelete}
                                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </button>
                            </div>
                        )} */}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;

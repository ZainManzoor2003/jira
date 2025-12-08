import React, { useEffect, useState } from 'react';
import { Plus, MoreHorizontal, Check, X, Calendar, Edit } from 'lucide-react';

// DND-KIT IMPORTS
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
// END DND-KIT IMPORTS

import TaskCard from './TaskCard';
import CommentsModal from '../modals/CommentModal';
import axios from 'axios';
import { toast } from 'react-toastify';

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

// --- Interfaces ---
interface Task {
  id: string;
  title: string;
  labels: string[];
  dueDate: string;
  comments: number;
  assignees: string[];
  status: string;
}

interface Column {
  id: string;
  title: string;
  statusCount: number;
  tasks: Task[];
  color: string;
}


interface TaskCardProps {
  task: Task
  onTaskAction: (taskId: string, action: 'delete' | 'update' | 'comment', updateData: any) => void
  setIsComment: React.Dispatch<React.SetStateAction<boolean>>
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  setTaskId: React.Dispatch<React.SetStateAction<string>>
  setUpdatedTaskTitle: React.Dispatch<React.SetStateAction<string>>
  setUpdatedDueDate: React.Dispatch<React.SetStateAction<string>>
  updatedDueDate: string
  updatedTaskTitle: string
  canModify: boolean
}

// --- Props for ColumnComponent ---
interface ColumnComponentProps {
  column: Column;
  onAddTask: (columnId: string, title: string, dueDate: string) => void;
  onTaskAction: (taskId: string, action: 'delete' | 'update' | 'comment', updateData: any) => void;
  taskIds: string[]; // Prop to pass the list of task IDs
  canModify: boolean;
}

const ColumnComponent: React.FC<ColumnComponentProps> = ({ column, onAddTask, onTaskAction, taskIds, canModify }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newDueDate, setNewTaskDueDate] = useState('');
  const [isUpdateTask, setIsUpdateTask] = useState(false);
  const [isCommentTask, setIsComment] = useState(false);
  const [updatedTaskTitle, setUpdatedTaskTitle] = useState('');
  const [updatedDueDate, setUpdatedDueDate] = useState('');
  const [comment, setComment] = useState('');
  const [taskId, setTaskId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setCurrentPage(1) // Reset to first page when tasks change
  }, [column]);
  // Define rows × columns per page for each column if needed
  const tasksPerPage = {
    'to-do': 2,        // 2 rows × 4 columns
    'in-progress': 2,  // 4 rows × 1 column (example)
    'done': 2,         // 6 tasks per page
  };

  const perPage = tasksPerPage[column.id as keyof typeof tasksPerPage] || 4;

  // Slice tasks for current page
  const paginatedTasks = column.tasks.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Number of pages
  const totalPages = Math.ceil(column.tasks.length / perPage);


  // Make the column droppable
  const { setNodeRef, isOver } = useDroppable({
    id: column.id, // The unique droppable ID (to-do, in-progress, done)
    data: {
      type: 'Column',
      tasks: taskIds,
    }
  });

  // Highlight the droppable area when a draggable item is over it
  const droppableStyle = {
    backgroundColor: isOver ? 'rgb(220 252 231)' : 'rgb(229 231 235)', // bg-green-100 or bg-gray-200
  };

  // --- Handlers ---
  const handleCreateClick = () => {
    setIsCreating(true);
    setIsUpdateTask(false);
    setIsComment(false);
    setNewTaskTitle('');
    setUpdatedDueDate('');
  };

  const handleCancelClick = () => {
    setNewTaskTitle('');
    setUpdatedDueDate('');
    setComment('');
  };

  const handleSaveTask = () => {
    if (!newTaskTitle.trim()) return;

    onAddTask(column.id, newTaskTitle.trim(), newDueDate);
    setIsCreating(false);
    setNewTaskTitle('');
    setUpdatedDueDate('');
  };

  // --- Render ---
  return (
    // Apply ref and style for droppable
    <div
      ref={setNodeRef}
      style={droppableStyle}
      className="flex-shrink-0 w-80 p-3 rounded-sm transition-colors duration-200"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-600">
          {column.title}{' '}
          <span className={`text-xs ml-1 font-bold ${column.color}`}>{column.statusCount}</span>
        </h3>
        <div className="flex items-center space-x-2">
          <Tippy content="Coming Soon" placement="top">


            <Plus className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700" />
          </Tippy>

          <Tippy content="Coming Soon" placement="top">


            <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700" />
          </Tippy>
        </div>
      </div>

      {/* Task List */}
      <div className="min-h-[100px] space-y-3">
        {paginatedTasks.map((task) => (
          <TaskCardWrapper
            key={task.id}
            task={task}
            onTaskAction={onTaskAction}
            setIsComment={setIsComment}
            setTaskId={setTaskId}
            setUpdatedTaskTitle={setUpdatedTaskTitle}
            setUpdatedDueDate={setUpdatedDueDate}
            updatedDueDate={updatedDueDate}
            updatedTaskTitle={updatedTaskTitle}
            canModify={canModify}
            setIsModalOpen={setIsModalOpen}
          />
        ))}
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-2 py-1 rounded text-sm ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* ... (Input for new task and update task) */}
        {/* Input for new task */}
        {isCreating && (
          <div className="bg-white p-2 rounded-sm shadow border border-blue-400">
            <textarea
              className="w-full text-sm resize-none border border-gray-300 rounded-sm focus:ring-0 p-2 text-gray-800"
              rows={2}
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
            />

            <div className="mt-2 border-t pt-2 border-gray-100">
              <h6 className="text-xs font-medium">Due Date</h6>
              <div className="flex items-center mt-2">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <input
                  type="date"
                  className="w-full text-xs text-gray-700 border-none focus:ring-0 p-2 cursor-pointer"
                  value={newDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  title="Select due date"
                />
              </div>
            </div>

            <div className="flex items-center justify-start mt-2 space-x-2 border-t pt-2 border-gray-100">
              <button
                onClick={handleSaveTask}
                className="p-1 rounded text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                disabled={!newTaskTitle.trim()}
                title="Create task"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  handleCancelClick
                  setIsCreating(false);
                }}
                className="p-1 rounded text-gray-700 hover:text-red-500"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        {/* Input for update task */}
        {isUpdateTask && (
          <div className="bg-white p-2 rounded-sm shadow border border-blue-400">
            <textarea
              className="w-full text-sm resize-none border border-gray-300 rounded-sm focus:ring-0 p-2 text-gray-800"
              rows={2}
              placeholder="Update Task"
              value={updatedTaskTitle}
              onChange={(e) => setUpdatedTaskTitle(e.target.value)}
              autoFocus
            />

            <div className="mt-2 border-t pt-2 border-gray-100">
              <h6 className="text-xs font-medium">Due Date</h6>
              <div className="flex items-center mt-2">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <input
                  type="date"
                  className="w-full text-xs text-gray-700 border-none focus:ring-0 p-2 cursor-pointer"
                  value={updatedDueDate}
                  onChange={(e) => setUpdatedDueDate(e.target.value)}
                  title="Select due date"
                />
              </div>
            </div>

            <div className="flex items-center justify-start mt-2 space-x-2 border-t pt-2 border-gray-100">
              <button
                onClick={() => {
                  setIsUpdateTask(false)
                  onTaskAction(taskId, 'update', { updatedTaskTitle, updatedDueDate })
                }
                }
                className="p-1 rounded text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                disabled={!updatedTaskTitle.trim()}
                title="Update task"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  handleCancelClick
                  setIsUpdateTask(false);
                }}
                className="p-1 rounded text-gray-700 hover:text-red-500"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {!isCreating && canModify && (
          <button
            onClick={handleCreateClick}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mt-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create
          </button>
        )}
        <CommentsModal isModalOpen={isModalOpen} onClose={() => setIsModalOpen(false)} taskId={taskId}
          comment={comment} setComment={setComment} onTaskAction={onTaskAction} />
      </div>
    </div>
  );
};

export default ColumnComponent;


// New wrapper component for the draggable task card
const TaskCardWrapper: React.FC<TaskCardProps> = (props) => {
  // Make the TaskCard draggable
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.task.id,
    data: {
      type: 'Task',
      task: props.task,
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 100, // bring to front while dragging
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    cursor: 'grabbing',
  } : {
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <TaskCard {...props} />
    </div>
  );
};
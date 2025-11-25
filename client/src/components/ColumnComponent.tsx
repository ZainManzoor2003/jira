import React, { useState } from 'react';
import { Plus, MoreHorizontal, Check, X, Calendar, Edit} from 'lucide-react';
import TaskCard from './TaskCard';

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

// --- Props for ColumnComponent ---
interface ColumnComponentProps {
  column: Column;
  onAddTask: (columnId: string, title: string, dueDate: string) => void;
  // FIX: Add the new onTaskAction prop definition
  onTaskAction: (taskId: string, action: 'delete' | 'update',updateData: any) => void;
}

// FIX: Destructure onTaskAction from props
const ColumnComponent: React.FC<ColumnComponentProps> = ({ column, onAddTask, onTaskAction}) => { 
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isUpdateTask, setIsUpdateTask] = useState(false);
  const [updatedTaskTitle, setUpdatedTaskTitle] = useState('');
  const [updatedDueDate, setUpdatedDueDate] = useState('');
  const [taskId, setTaskId] = useState('');


  // --- Handlers ---
  const handleCreateClick = () => {
    setIsCreating(true);
    setIsUpdateTask(false);
    setNewTaskTitle('');
    setNewDueDate('');
  };

  const handleCancelClick = () => {
    setIsCreating(false);
    setIsUpdateTask(false);
    setNewTaskTitle('');
    setNewDueDate('');
  };

  const handleSaveTask = () => {
    if (!newTaskTitle.trim()) return;

    onAddTask(column.id, newTaskTitle.trim(), newDueDate);
    setIsCreating(false);
    setNewTaskTitle('');
    setNewDueDate('');
  };

  // --- Render ---
  return (
    <div className="flex-shrink-0 w-80 p-3 bg-gray-200 rounded-sm">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-600">
          {column.title}{' '}
          <span className={`text-xs ml-1 font-bold ${column.color}`}>{column.statusCount}</span>
        </h3>
        <div className="flex items-center space-x-2">
          <Plus className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700" />
          <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700" />
        </div>
      </div>

      {/* Task List */}
      <div className="min-h-[100px] space-y-3">
        {column.tasks.map((task) => (
          // FIX: Pass the onTaskAction prop to TaskCard
          <TaskCard 
            key={task.id} 
            task={task} 
            onTaskAction={onTaskAction} 
            setIsUpdateTask={setIsUpdateTask}
            setTaskId={setTaskId}
            setUpdatedTaskTitle={setUpdatedTaskTitle}
          /> 
        ))}

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
                  onChange={(e) => setNewDueDate(e.target.value)}
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
                onClick={handleCancelClick}
                className="p-1 rounded text-gray-700 hover:text-red-500"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        {/* Input for new task */}
        {isUpdateTask &&  (
          <div className="bg-white p-2 rounded-sm shadow border border-blue-400">
            <textarea
              className="w-full text-sm resize-none border border-gray-300 rounded-sm focus:ring-0 p-2 text-gray-800"
              rows={2}
              placeholder="What needs to be done?"
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
                onClick={()=>{
                  setIsUpdateTask(false)
                  onTaskAction(taskId, 'update',{updatedTaskTitle,updatedDueDate})
                }
                }
                className="p-1 rounded text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                disabled={!updatedTaskTitle.trim()}
                title="Create task"
              >
                 <Edit className="w-4 h-4 mr-2" />
              </button>
              <button
                onClick={handleCancelClick}
                className="p-1 rounded text-gray-700 hover:text-red-500"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {!isCreating && (
          <button
            onClick={handleCreateClick}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mt-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create
          </button>
        )}
      </div>
    </div>
  );
};

export default ColumnComponent;
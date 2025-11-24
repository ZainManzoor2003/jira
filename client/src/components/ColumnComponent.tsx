import React, { useState } from 'react';
import { Plus, MoreHorizontal, Check, X, Calendar } from 'lucide-react'; // Added Calendar icon
import TaskCard from './TaskCard'; 

// Interface definitions (kept from your original code)
interface Column {
  id: string;
  title: string;
  statusCount: number;
  tasks: Task[];
  color: string;
  // Updated onAddTask to optionally include dueDate
  onAddTask?: (columnId: string, title: string, dueDate: string) => void; 
}

interface Task {
  id: string;
  title: string;
  labels: string[];
  dueDate: string;
  comments: number;
  assignees: string[];
}


const ColumnComponent: React.FC<{ column: Column }> = ({ column }) => {
  // 1. State to manage the visibility of the new task input
  const [isCreating, setIsCreating] = useState(false);
  // 2. State to hold the text for the new task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  // 3. NEW STATE for the Due Date
  const [newDueDate, setNewDueDate] = useState('');

  // --- Handlers ---
  const handleCreateClick = () => {
    setIsCreating(true);
    setNewTaskTitle(''); // Ensure input is clear when opening
    setNewDueDate('');  // Ensure date is clear when opening
  };

  const handleCancelClick = () => {
    setIsCreating(false);
    setNewTaskTitle(''); 
    setNewDueDate('');  // Clear date on cancel
  };

  const handleSaveTask = () => {
    if (newTaskTitle.trim()) {
      // **TODO: Call the actual function to save the task**
      if (column.onAddTask) {
          // Pass the newDueDate in the call
          column.onAddTask(column.id, newTaskTitle.trim(), newDueDate);
      } else {
          console.log(`[Action]: Added task "${newTaskTitle.trim()}" to column: ${column.title}. Due Date: ${newDueDate || 'None'}`);
      }

      // Reset state after saving/adding
      setIsCreating(false);
      setNewTaskTitle('');
      setNewDueDate('');
    }
  };

  // --- Rendering ---
  return (
    <div className="flex-shrink-0 w-80 p-3 bg-gray-200 rounded-sm">
      {/* Column Header (no changes here) */}
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
        {column.tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}

        {/* --- 1. Input Field (Shown when isCreating is true) --- */}
        {isCreating && (
          <div className="bg-white p-2 rounded-sm shadow border border-blue-400"> {/* Changed border color for better focus */}
            
            {/* Task Title Text Area */}
            <textarea
              className="w-full text-sm resize-none border-1 border-gray-300 rounded-sm focus:ring-0 p-2 text-gray-800"
              rows={2}
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
            />

            {/* NEW: Due Date Input Field */}
            <div className="mt-0 border-t pt-2 border-gray-100">
              <h6 className='text-xs font-medium'>Due Date</h6>
              <div className='flex items-center mt-2'>

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
            
            {/* Save/Cancel Buttons */}
            <div className="flex items-center justify-start mt-2 space-x-2 border-t pt-2 border-gray-100">
              {/* Save/Check Button */}
              <button
                onClick={handleSaveTask}
                className="p-1 rounded text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                disabled={!newTaskTitle.trim()}
                title="Create issue"
              >
                <Check className="w-4 h-4" />
              </button>
              {/* Cancel/X Button */}
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
        
        {/* --- 2. Create Button (Shown when isCreating is false) --- */}
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
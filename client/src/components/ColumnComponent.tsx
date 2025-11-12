import React, { useState } from 'react';
import { Plus, MoreHorizontal} from 'lucide-react';
import TaskCard from './TaskCard';

interface Column {
  id: string;
  title: string;
  statusCount: number;
  tasks: Task[];
  color: string;
}

interface Task {
  id: string;
  title: string;
  labels: string[];
  dueDate: string;
  comments: number;
  assignees: string[];
}


const ColumnComponent: React.FC<{ column: Column }> = ({ column }) => (
  
  <div className="flex-shrink-0 w-80 p-3 bg-gray-200 rounded-sm ">
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
      {column.tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
      <button className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mt-2">
        <Plus className="w-4 h-4 mr-1" />
        Create
      </button>
    </div>
  </div>
);

export default ColumnComponent
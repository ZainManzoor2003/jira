import React from "react";
import { MoreHorizontal, Calendar, MessageSquare} from 'lucide-react';


// --- Data Structures ---
interface Task {
  id: string;
  title: string;
  labels: string[];
  dueDate: string;
  comments: number;
  assignees: string[];
}

const UserAvatar: React.FC<{ initial: string }> = ({ initial }) => (
  <div className="flex-shrink-0 w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-semibold border border-gray-300 shadow-sm">
    {initial}
  </div>
);

const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
  <div className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 cursor-pointer mb-3">
    <p className="text-sm font-medium text-gray-800 mb-2">{task.title}</p>
    
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
        {task.comments > 0 && (
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
        <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-gray-600" />
      </div>
    </div>
  </div>
);

export default TaskCard
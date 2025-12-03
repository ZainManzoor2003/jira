import React, { useEffect, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import axios from "axios";

interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose, taskId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  axios.defaults.baseURL = "http://localhost:8080";

  useEffect(() => {
    if (!isOpen) return;
    
    const fetchComments = async () => {
      console.log('TASKID',taskId)
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`/task/comment/${taskId}`, {
          withCredentials: true, // ensures JWT cookie is sent
        });
        setComments(res.data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load comments"+err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [isOpen, taskId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="flex items-end justify-end min-h-screen">
        <div className="bg-white w-1/2 h-[50vh] shadow-2xl border-l border-t border-gray-200 p-4 flex flex-col transform transition-all rounded-tl-lg">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
              Task Comments
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-red-500"
              title="Close Comments"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto mt-4 space-y-3">
            {loading && (
              <div className="text-gray-500 text-center">Loading comments...</div>
            )}
            {error && (
              <div className="text-red-500 text-center">{error}</div>
            )}
            {!loading && !error && comments.length === 0 && (
              <div className="text-gray-400 italic text-center">
                No comments yet for this task.
              </div>
            )}
            {comments.map((c) => (
              <div key={c.id} className="p-3 bg-gray-50 rounded shadow-sm">
                <p className="text-gray-800">{c.comment}</p>
                <span className="text-gray-400 text-xs">
                  {new Date(c.created_at).toISOString().split('T')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;

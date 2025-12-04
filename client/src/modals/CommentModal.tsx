import React, { useEffect, useState } from "react";
import { Check, MessageSquare, X } from "lucide-react";
import axios from "axios";

interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

interface CommentsModalProps {
  isModalOpen: boolean;
  onClose: () => void;
  taskId: string;
  comment: string;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  onTaskAction: (taskId: string, action: 'comment', commentData: any) => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isModalOpen, onClose, taskId, comment, setComment, onTaskAction }) => {

  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fetchCommentsToggle, setFetchComments] = useState(false);
  axios.defaults.baseURL = "http://localhost:3001";

  const fetchComments = async () => {
    // console.log('TASKID', taskId)
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/task/comment/${taskId}`, {
        withCredentials: true, // ensures JWT cookie is sent
      });
      setComments(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;

    fetchComments();
  }, [isModalOpen, taskId, fetchCommentsToggle]);



  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="flex items-end justify-end min-h-screen">
        <div className="bg-white w-1/4 h-[100vh] shadow-2xl border-l border-t border-gray-200 flex flex-col rounded-tl-lg">

          {/* HEADER */}
          <div className="p-4 flex justify-between items-center border-b border-gray-100">
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

          {/* COMMENTS LIST (scrollable) */}
          <div className="flex-grow overflow-y-auto px-4 py-3 space-y-3">
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

          {/* ADD COMMENT BOX (fixed bottom) */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="bg-white p-2 rounded-sm shadow border border-blue-400">

              <textarea
                className="w-full text-sm resize-none border border-gray-300 rounded-sm focus:ring-0 p-2 text-gray-800"
                rows={2}
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <div className="flex items-center justify-start mt-2 space-x-2 border-t pt-2 border-gray-100">
                <button
                  onClick={() => {
                    setComment("");
                    setFetchComments((prev) => !prev);
                    onTaskAction(taskId, "comment", { comment });
                  }}
                  className="p-1 rounded text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center"
                  disabled={!comment.trim()}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Add
                </button>

                <button
                  onClick={() => setComment("")}
                  className="p-1 rounded text-gray-700 hover:text-red-500"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>

  );
};

export default CommentsModal;

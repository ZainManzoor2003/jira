import React, { useEffect, useState } from "react";
import { Check, MessageSquare, X, Send } from "lucide-react"; // Imported 'Send' for the Add button
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
  axios.defaults.baseURL = "http://localhost:8080";

  const fetchComments = async () => {
    // console.log('TASKID', taskId)
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/task/comment/${taskId}`, {
        withCredentials: true, // ensures JWT cookie is sent
      });
      // Sort comments by creation date (newest first) for better display
      const sortedComments = res.data.sort((a: Comment, b: Comment) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setComments(sortedComments);
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

  const handleAddComment = () => {
    if (!comment.trim()) return; // Prevent adding empty comment
    setComment("");
    setFetchComments((prev) => !prev);
    // Execute the parent action
    onTaskAction(taskId, "comment", { comment: comment.trim() });
  };


  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Semi-transparent overlay (Optional: uncomment for a backdrop effect) */}
      {/* <div className="absolute inset-0 bg-gray-900 opacity-20"></div> */} 
      
      <div className="flex items-end justify-end min-h-screen">
        <div className="bg-white w-1/4 h-[100vh] shadow-2xl border-l border-t border-gray-200 flex flex-col rounded-tl-lg">

          {/* HEADER */}
          <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-blue-50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              Task Comments
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded text-gray-500 hover:bg-red-100 hover:text-red-500 transition duration-150"
              title="Close Comments"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* COMMENTS LIST (scrollable) */}
          <div className="flex-grow overflow-y-auto px-4 py-3 space-y-4">
            {loading && (
              <div className="text-gray-500 text-center py-4">Loading comments...</div>
            )}
            {error && (
              <div className="text-red-500 bg-red-50 p-2 rounded text-center">{error}</div>
            )}
            {!loading && !error && comments.length === 0 && (
              <div className="text-gray-400 italic text-center py-4 border-dashed border-2 border-gray-100 rounded">
                <MessageSquare className="w-5 h-5 mx-auto mb-1" />
                No comments yet. Be the first!
              </div>
            )}

            {/* Comment Cards - Styled for better look */}
            {comments.map((c) => (
              <div key={c.id} className="p-3 bg-white rounded-lg shadow-md border border-gray-100 transition duration-150 hover:shadow-lg">
                <p className="text-gray-800 text-sm mb-1 whitespace-pre-wrap">{c.comment}</p>
                <div className="flex justify-between items-center border-t border-gray-100 pt-1 mt-1">
                    <span className="text-gray-400 text-xs">
                    {new Date(c.created_at).toLocaleDateString()} at {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
              </div>
            ))}
          </div>

          {/* ADD COMMENT BOX (fixed bottom) - Enhanced Styling */}
          <div className="p-4 border-t-2 border-blue-500 bg-gray-50">
            <div className="bg-white p-3 rounded-lg shadow-lg">

              <textarea
                className="w-full text-sm resize-none border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 text-gray-800 transition duration-150"
                rows={3} // Increased rows for more space
                placeholder="Type your comment here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <div className="flex items-center justify-end mt-2 space-x-2 border-t pt-2 border-gray-100">
                
                {/* Cancel Button - Styled consistently */}
                <button
                  onClick={() => setComment("")}
                  className="px-3 py-1.5 rounded-md text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition duration-150 flex items-center"
                  title="Clear Comment"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </button>

                {/* Add/Send Button - Highlighted with blue theme */}
                <button
                  onClick={handleAddComment}
                  className="px-3 py-1.5 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition duration-150 flex items-center font-semibold"
                  disabled={!comment.trim()}
                  title="Add Comment"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Send
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
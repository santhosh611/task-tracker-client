import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { 
  getMyComments, 
  createComment, 
  addReply, 
  markAdminRepliesAsRead,
  markCommentAsRead 
} from '../../services/commentService';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTexts, setReplyTexts] = useState({});
  
  
  // Load comments
  useEffect(() => {

    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const fetchedComments = await getMyComments();
        setComments(fetchedComments);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        // Handle error (show toast, set error state, etc.)
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, []);
  


  
  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const commentData = {
        text: commentText.trim()
      };
      
      const newComment = await createComment(commentData);
      
      setComments(prev => [newComment, ...prev]);
      
      // Reset form
      setCommentText('');
      
      
      toast.success('Comment added successfully!');
    }  catch (error) {
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle reply submission
  const handleSubmitReply = async (commentId) => {
    const replyText = replyTexts[commentId];
    
    if (!replyText || !replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }
    
    try {
      const updatedComment = await addReply(commentId, { text: replyText.trim() });
      
      setComments(prev => 
        prev.map(comment => 
          comment._id === commentId ? updatedComment : comment
        )
      );
      
      setReplyTexts(prev => ({
        ...prev,
        [commentId]: ''
      }));
      
      toast.success('Reply added successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to add reply');
    }
  };
  
  // Update reply text for a specific comment
  const handleReplyTextChange = (commentId, text) => {
    setReplyTexts(prev => ({
      ...prev,
      [commentId]: text
    }));
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };
  
  // View attachment
  const viewAttachment = (attachment) => {
    if (attachment.type.startsWith('image/')) {
      window.open(attachment.data, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = attachment.data;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Comments & Communication</h1>
      
      <Card className="mb-6">
        <form onSubmit={handleSubmitComment}>
          <div className="form-group">
            <label htmlFor="commentText" className="form-label">New Comment</label>
            <textarea
              id="commentText"
              className="form-input"
              rows="4"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Type your comment here..."
              required
            ></textarea>
          </div>
                
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !commentText.trim()}
            >
              {isSubmitting ? <Spinner size="sm" /> : 'Submit Comment'}
            </Button>
          </div>
        </form>
      </Card>
      
      <Card title="Comment History">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You haven't posted any comments yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div 
                key={comment._id || `comment-${Math.random()}`}
                className={`border rounded-lg overflow-hidden ${
                  comment.isNew ? 'border-blue-400' : 'border-gray-200'
                }`}
              >
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-700">Your Comment</h3>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="mb-4">{comment.text}</p>
                  
                  {comment.attachment && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <span className="text-gray-700 mr-2">
                          Attachment: {comment.attachment.name}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewAttachment(comment.attachment)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Replies:</h4>
                      
                      {comment.replies.map((reply, index) => (
  <div 
    key={`${comment._id}-reply-${index}`}
    className={`p-3 rounded-md ${
      reply.isAdminReply 
        ? 'bg-blue-50 border-l-4 border-blue-400'
        : 'bg-gray-50'
    } ${reply.isNew ? 'border-2 border-blue-300' : ''}`}
  >
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-medium">
                              {reply.isAdminReply ? 'Admin' : 'You'}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm">{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Reply form */}
                  <div className="mt-4">
                    <textarea
                      className="form-input mb-2"
                      rows="2"
                      value={replyTexts[comment._id] || ''}
                      onChange={(e) => handleReplyTextChange(comment._id, e.target.value)}
                      placeholder="Type your reply..."
                    ></textarea>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSubmitReply(comment._id)}
                        disabled={!replyTexts[comment._id]?.trim()}
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Comments;
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { getAllComments, addReply } from '../../services/commentService';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import { useAuth } from '../../hooks/useAuth'; // Import auth context

const CommentManagement = () => {
  const { logout } = useAuth(); // Get logout function from auth context
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  // Modal states
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isViewAttachmentModalOpen, setIsViewAttachmentModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef(null);
  
  // Load all comments (initial load)
  useEffect(() => {
    loadComments();
    
    // Set up auto refresh interval
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadComments(false); // Silent refresh (no loading spinner)
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      // Clean up interval on component unmount
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);
  
  const loadComments = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setIsLoading(true);
    }
    
    try {
      const commentsData = await getAllComments();
      
      // Ensure commentsData is an array
      const safeComments = Array.isArray(commentsData) ? commentsData : [];
      
      setComments(safeComments);
      
      // Only update filtered comments if we're not filtering
      if (!searchTerm && !filterDepartment && !filterStatus) {
        setFilteredComments(safeComments);
      }
      
      // If silent refresh, don't show toast
      if (!showLoadingSpinner) {
        console.log('Comments silently refreshed:', safeComments.length);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
      
      // Handle auth errors
      if (error.response?.status === 403 || error.message?.includes('denied')) {
        // Stop auto-refresh to prevent multiple logout attempts
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
        
        toast.error('Your session has expired. Please log in again.');
        setTimeout(() => logout(), 2000); // Give time for toast to be seen
        return;
      }
      
      // Only show error toast if it's a manual refresh
      if (showLoadingSpinner) {
        toast.error('Failed to load comments');
      }
      
      // Set to empty array in case of error
      setComments([]);
      setFilteredComments([]);
    } finally {
      if (showLoadingSpinner) {
        setIsLoading(false);
      }
    }
  };
  
  // Manual refresh handler with token refresh attempt
  const refreshComments = async () => {
    try {
      // Store current auth token in localStorage to preserve it
      const currentToken = localStorage.getItem('token');
      
      setIsLoading(true);
      toast.info('Refreshing comments...');
      
      const commentsData = await getAllComments();
      setComments(Array.isArray(commentsData) ? commentsData : []);
      setFilteredComments(Array.isArray(commentsData) ? commentsData : []);
      
      toast.success('Comments refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh comments:', error);
      toast.error('Failed to refresh comments');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    const newValue = !autoRefresh;
    setAutoRefresh(newValue);
    
    if (newValue) {
      toast.success('Auto-refresh enabled');
      refreshIntervalRef.current = setInterval(() => {
        loadComments(false);
      }, 30000);
    } else {
      toast.info('Auto-refresh disabled');
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }
  };
  
  // Filter comments when search term or department filter changes
  useEffect(() => {
    // Ensure comments is an array before filtering
    if (!Array.isArray(comments)) {
      console.error('Comments is not an array:', comments);
      setFilteredComments([]);
      return;
    }

    if (comments.length === 0) return;
    
    const filtered = comments.filter(comment => {
      const workerName = comment.worker?.name || '';
      const workerDept = comment.worker?.department?.name || '';
      
      const matchesSearch = 
        workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comment.text || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !filterDepartment || workerDept === filterDepartment;
      
      // Improved status filtering logic
      const matchesStatus = 
        !filterStatus || 
        (filterStatus === 'new' && (
          comment.isNew || // Comment itself is new
          (comment.replies && comment.replies.some(reply => reply.isNew)) // Any reply is new
        )) || 
        (filterStatus === 'read' && 
          !comment.isNew && 
          (!comment.replies || !comment.replies.some(reply => reply.isNew))
        );
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
    
    setFilteredComments(filtered);
  }, [comments, searchTerm, filterDepartment, filterStatus]);
  
  // Open reply modal
  const openReplyModal = (comment) => {
    setSelectedComment(comment);
    setReplyText('');
    setIsReplyModalOpen(true);
  };
  
  // Open attachment modal
  const openAttachmentModal = (attachment) => {
    setSelectedAttachment(attachment);
    setIsViewAttachmentModalOpen(true);
  };
  
  // Submit reply
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }
    
    try {
      await addReply(selectedComment._id, { text: replyText });
      setIsReplyModalOpen(false);
      toast.success('Reply added successfully');
      
      // Refresh comments after adding reply
      loadComments(true);
    } catch (error) {
      if (error.response?.status === 403 || error.message?.includes('denied')) {
        toast.error('Your session has expired. Please log in again.');
        setTimeout(() => logout(), 2000);
        return;
      }
      
      toast.error(error.message || 'Failed to add reply');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };
  
  // Get all unique departments from comments
  const departments = [
    ...new Set(comments
      .filter(comment => comment.worker && comment.worker.department)
      .map(comment => comment.worker.department?.name || '') // Use optional chaining
    )
  ].filter(Boolean) // Remove any empty strings
  .sort();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Comments Management</h1>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Comments
            </label>
            <input
              type="text"
              className="form-input w-full"
              placeholder="Search by worker name, comment text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Department
            </label>
            <select
              className="form-input w-full"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              className="form-input w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Comments</option>
              <option value="new">New Comments</option>
              <option value="read">Read Comments</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Comments ({filteredComments.length})
          </h2>
          <div className="flex items-center space-x-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600"
                checked={autoRefresh}
                onChange={toggleAutoRefresh}
              />
              <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
            </label>
            <Button 
              variant="outline" 
              onClick={refreshComments} 
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </Button>
          </div>
        </div>

        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments found matching your search criteria.
          </div>
        ) : (
          <div className="space-y-6">
  
            {filteredComments.map((comment) => (
              <div 
                key={comment._id} 
                className={`bg-white border rounded-lg p-4 ${
                  comment.isNew || (comment.replies && comment.replies.some(reply => reply.isNew)) 
                    ? 'border-l-4 border-l-blue-500' 
                    : 'border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">
                        {comment.worker && comment.worker.name 
                          ? comment.worker.name[0].toUpperCase() 
                          : 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {comment.worker && comment.worker.name 
                          ? comment.worker.name 
                          : 'Unknown Worker'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {comment.worker && comment.worker.department && comment.worker.department.name
                          ? comment.worker.department.name
                          : 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                
                <p className="my-2 text-gray-700">{comment.text || 'No comment text'}</p>
                
                {comment.attachment && (
                  <div className="bg-gray-50 p-2 rounded-md my-2">
                    {/* Attachment content (keep as is) */}
                  </div>
                )}
                
                {/* Replies Section */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 mb-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Replies:</p>
                    
                    {comment.replies.map((reply, index) => (
                      <div 
                        key={`${comment._id}-reply-${index}`}
                        className={`p-3 rounded-md ${
                          reply.isAdminReply 
                            ? 'bg-blue-50 border-l-4 border-blue-400'
                            : 'bg-gray-100'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium">
                            {reply.isAdminReply ? 'Admin' : comment.worker?.name || 'Worker'}
                          </p>
                          <span className="text-xs text-gray-500">
                            {reply.createdAt ? formatDate(reply.createdAt) : 'Recent'}
                          </span>
                        </div>
                        <p className="text-sm">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openReplyModal(comment)}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      
      {/* Reply Modal */}
      <Modal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        title={`Reply to ${selectedComment?.worker?.name || 'Worker'}`}
      >
        <form onSubmit={handleSubmitReply}>
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Original comment:</p>
            <p className="p-3 bg-gray-50 rounded-md mb-4">{selectedComment?.text || ''}</p>
            
            <label htmlFor="reply" className="form-label">Your Reply</label>
            <textarea
              id="reply"
              className="form-input"
              rows="4"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReplyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Send Reply
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* View Attachment Modal */}
      <Modal
        isOpen={isViewAttachmentModalOpen}
        onClose={() => setIsViewAttachmentModalOpen(false)}
        title="Attachment"
        size="lg"
      >
        {selectedAttachment && (
          <div className="text-center">
            {selectedAttachment.type.startsWith('image/') ? (
              <img
                src={selectedAttachment.data}
                alt={selectedAttachment.name}
                className="max-w-full max-h-[70vh] mx-auto"
              />
            ) : (
              <div className="p-8 text-center">
                <p className="text-xl mb-4">
                  {selectedAttachment.name}
                </p>
                <p className="mb-4 text-gray-500">
                  File type: {selectedAttachment.type}
                </p>
                
                <a 
                  href={selectedAttachment.data}
                  download={selectedAttachment.name}
                  className="btn btn-primary"
                >
                  Download File
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CommentManagement;
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { getAllComments, addReply } from '../../services/commentService';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

const CommentManagement = () => {
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
  
  // Load all comments
  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true);
      try {
        const commentsData = await getAllComments();
        
        // Ensure commentsData is an array
        const safeComments = Array.isArray(commentsData) ? commentsData : [];
        
        setComments(safeComments);
        setFilteredComments(safeComments);
      } catch (error) {
        toast.error('Failed to load comments');
        console.error(error);
        // Set to empty array in case of error
        setComments([]);
        setFilteredComments([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadComments();
  }, []);
  
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
      
      const matchesStatus = 
        !filterStatus || 
        (filterStatus === 'new' && comment.isNew) || 
        (filterStatus === 'read' && !comment.isNew);
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
    
    setFilteredComments(filtered);
  }, [comments, searchTerm, filterDepartment]);
  
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
      const updatedComment = await addReply(selectedComment._id, { text: replyText });
      
      // Update local state
      setComments(prev => 
        prev.map(comment => 
          comment._id === selectedComment._id ? updatedComment : comment
        )
      );
      
      setIsReplyModalOpen(false);
      toast.success('Reply added successfully');
    } catch (error) {
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
      comment.isNew ? 'border-l-4 border-l-blue-500' : 'border'
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-600">
            {(comment.worker?.name || 'UW')[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-medium">
            {comment.worker?.name || 'Unknown Worker'}
          </p>
          <p className="text-xs text-gray-500">
            {comment.worker?.department?.name || 'Unassigned'}
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
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2">
            <span className="text-xs font-bold">
              {(comment.worker?.name || 'UW')[0].toUpperCase()}
            </span>
          </div>
          <p className="text-sm font-medium">
            {comment.worker?.name || 'Unknown Worker'} sent an attachment
          </p>
        </div>
        
        <div className="flex items-center">
          {comment.attachment.type?.startsWith('image/') ? (
            <img 
              src={comment.attachment.data} 
              alt={comment.attachment.name || 'Attachment'}
              className="max-h-40 max-w-full object-cover rounded-md mr-2"
            />
          ) : (
            <span className="text-gray-500 mr-2 flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" 
                  clipRule="evenodd" 
                />
              </svg>
              {comment.attachment.name || 'Unnamed File'}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => openAttachmentModal(comment.attachment)}
          >
            View
          </Button>
        </div>
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
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createTask } from '../../services/taskService';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

const TaskForm = ({ topics, columns, onTaskSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle form field changes for columns
  const handleColumnChange = (columnName, value) => {
    setFormData(prev => ({
      ...prev,
      [columnName]: value
    }));
  };
  
  // Handle topic checkbox changes
  const handleTopicChange = (topicId) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      } else {
        return [...prev, topicId];
      }
    });
  };
  
  // Check if form is valid
  const isFormValid = () => {
    // At least one column value must be greater than 0
    const hasColumnData = Object.values(formData).some(value => parseInt(value) > 0);
    
    // Or at least one topic must be selected
    const hasTopicData = selectedTopics.length > 0;
    
    return hasColumnData || hasTopicData;
  };
  
  // Handle form submission
// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!isFormValid()) {
    alert('Please enter at least one value or select a topic.');
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    // Make sure we always send a valid data object even if it's empty
    // This prevents the server from rejecting our request
    const taskData = {
      data: Object.keys(formData).length === 0 ? { placeholder: 0 } : formData,
      topics: selectedTopics
    };
    
    const newTask = await createTask(taskData);
    
    // Reset form
    setFormData({});
    setSelectedTopics([]);
    
    // Notify parent component
    if (onTaskSubmit) {
      onTaskSubmit(newTask);
    }
  } catch (error) {
    console.error('Failed to submit task:', error);
    alert(error.message || 'Failed to submit task. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Submit Task</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Column Inputs */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Task Data</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.map((column) => (
              <div key={column._id} className="form-group">
                <label htmlFor={`column-${column._id}`} className="form-label">
                  {column.name}
                </label>
                <input
                  type="number"
                  id={`column-${column._id}`}
                  className="form-input"
                  value={formData[column.name] || ''}
                  onChange={(e) => handleColumnChange(column.name, e.target.value)}
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Topics Section */}
        {topics.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Topics</h3>
            
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <label 
                  key={topic._id} 
                  className={`
                    inline-flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer
                    ${selectedTopics.includes(topic._id)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                    }
                  `}
                >
                    <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedTopics.includes(topic._id)}
                    onChange={() => handleTopicChange(topic._id)}
                  />
                  <span>
                    {topic.name} ({topic.points} pts)
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !isFormValid()}
          >
            {isSubmitting ? <Spinner size="sm" /> : 'Submit Task'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
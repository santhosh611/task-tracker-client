import { useState } from 'react';
import { submitCustomTask } from '../../services/taskService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { toast } from 'react-toastify';

const CustomTaskForm = ({ topics, onTaskSubmit }) => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTopicChange = (topicId) => {
    setSelectedTopics(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error('Please provide a task description');
      return;
    }

    setIsSubmitting(true);
    try {
      const customTask = await submitCustomTask({
        description,
        topics: selectedTopics,
        worker: user._id
      });

      // Reset form
      setDescription('');
      setSelectedTopics([]);

      // Notify parent component
      onTaskSubmit && onTaskSubmit(customTask);
      toast.success('Custom task submitted successfully');
    } catch (error) {
      console.error('Custom task submission failed:', error);
      toast.error(error.message || 'Failed to submit custom task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Submit Custom Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your custom task in detail"
          className="form-input w-full"
          rows="4"
          required
        />

        {topics.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">Related Topics (Optional)</h4>
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
                  <span>{topic.name} ({topic.points} pts)</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          variant="primary" 
          fullWidth
          disabled={isSubmitting || !description.trim()}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Custom Task'}
        </Button>
      </form>
    </div>
  );
};

export default CustomTaskForm;
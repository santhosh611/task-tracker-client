import { useState, useEffect } from 'react';
import { getAllTasks } from '../../services/taskService';
import { approveCustomTask } from '../../services/taskService';
import Button from '../common/Button';
import { toast } from 'react-toastify';

const AdminCustomTaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const allTasks = await getAllTasks();
      const filteredTasks = allTasks.filter(task => 
        task.data.customDescription && 
        (filter === 'all' || task.status === filter)
      );
      setTasks(filteredTasks);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    }
  };

  const handleApprove = async (taskId, points = 1) => {
    try {
      await approveCustomTask(taskId, points);
      toast.success('Task approved successfully');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to approve task');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Custom Task Management</h2>
      
      <div className="mb-4">
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-select w-full"
        >
          <option value="pending">Pending Tasks</option>
          <option value="approved">Approved Tasks</option>
          <option value="all">All Tasks</option>
        </select>
      </div>

      {tasks.length === 0 ? (
        <p className="text-center text-gray-500">No tasks found</p>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div 
              key={task._id} 
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{task.data.customDescription}</p>
                <p className="text-sm text-gray-600">
                  Submitted by: {task.worker?.name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-500">
                  Status: {task.status}
                </p>
              </div>
              {task.status === 'pending' && (
                <Button 
                  onClick={() => handleApprove(task._id)}
                  variant="primary"
                  size="sm"
                >
                  Approve Task
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCustomTaskManagement;
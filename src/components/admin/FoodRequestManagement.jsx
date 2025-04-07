// client/src/components/admin/FoodRequestManagement.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getTodayRequests, toggleFoodRequests, getFoodRequestSettings } from '../../services/foodRequestService';
import Button from '../common/Button';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import Table from '../common/Table';


const FoodRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getTodayRequests();
      console.log('Fetched Requests:', data); // Add this line
      setRequests(data);
      
      const settings = await getFoodRequestSettings();
      setEnabled(settings.enabled);
    } catch (error) {
      toast.error('Failed to fetch food requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchRequests();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const result = await toggleFoodRequests();
      setEnabled(result.enabled);
      toast.success(`Food requests ${result.enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to toggle food request status');
    } finally {
      setToggling(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  
  const columns = [
    { 
      header: 'Name', 
      accessor: (row) => row.worker?.name || 'N/A' 
    },
    { 
      header: 'Department', 
      accessor: (row) => row.worker?.department || 'N/A' 
    },
    { 
      header: 'Submitted At', 
      accessor: (row) => formatDate(row.date) 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Food Request Management</h1>
        
        <Button 
          onClick={handleToggle} 
          disabled={toggling}
          variant={enabled ? "danger" : "success"}
        >
          {toggling ? (
            <Spinner size="sm" />
          ) : enabled ? (
            'Disable Food Requests'
          ) : (
            'Enable Food Requests'
          )}
        </Button>
      </div>
      
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Today's Requests</h2>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
            Total: {requests.length}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No food requests submitted today.
          </div>
        ) : (
          <Table
            columns={columns}
            data={requests}
            keyExtractor={(item) => item._id}
          />
        )}
      </Card>
    </div>
  );
};

export default FoodRequestManagement;
import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { getTodayRequests, toggleFoodRequests, getFoodRequestSettings } from '../../services/foodRequestService';
import Button from '../common/Button';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import Table from '../common/Table';
import appContext from '../../context/AppContext';

const FoodRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const { subdomain } = useContext(appContext);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getTodayRequests({ subdomain });

      // Flatten data
      const formatted = data.map((req) => ({
        name: req.worker?.name || 'N/A',
        rfid: req.worker?.rfid || 'N/A',
        department: req.department?.name || 'N/A',
        date: new Date(req.date).toLocaleString(),
      }));

      setRequests(formatted);

      const settings = await getFoodRequestSettings({ subdomain });
      setEnabled(settings.enabled);
    } catch (error) {
      toast.error('Failed to fetch food requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(() => {
      fetchRequests();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const result = await toggleFoodRequests({ subdomain });
      setEnabled(result.enabled);
      toast.success(`Food requests ${result.enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to toggle food request status');
    } finally {
      setToggling(false);
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Employee ID',
      accessor: 'rfid',
    },
    {
      header: 'Department',
      accessor: 'department',
    },
    {
      header: 'Submitted At',
      accessor: 'date',
    },
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
            noDataMessage="No food request records found."
          />
        )}
      </Card>
    </div>
  );
};

export default FoodRequestManagement;

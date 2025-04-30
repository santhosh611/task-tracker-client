import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import appContext from '../../context/AppContext';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import { readNotification } from '../../services/notificationService';

const Notifications = () => {
  const { subdomain } = useContext(appContext);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await readNotification(subdomain);
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    } catch (err) {
      toast.error('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (!filterDate) return true;
    const createdAtDate = new Date(n.createdAt).toISOString().split('T')[0];
    return createdAtDate === filterDate;
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Notifications</h2>

      <div className="mb-4 flex justify-end">
        <input
          type="date"
          className="form-input w-48"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <p className='px-6 py-4 text-center text-sm text-gray-500'>No notifications found.</p>
          ) : (
            filteredNotifications.map((notification) => (
              <Card key={notification._id} className="shadow-sm border">
                <div className="flex items-center w-full justify-end">
                  <p className="text-sm text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between items-center w-full">
                  <p className="text-lg">{notification.messageData}</p>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;

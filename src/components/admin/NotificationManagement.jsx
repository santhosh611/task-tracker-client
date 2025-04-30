import React, { useState, useEffect, useContext } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import appContext from '../../context/AppContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import {
  readNotification,
  createNotification,
  updateNotification,
  deleteNotification
} from '../../services/notificationService';

const NotificationManagement = () => {
  const { subdomain } = useContext(appContext);
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({ messageData: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [filterStartDate, setFilterStartDate] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      console.log(subdomain);
      const data = await readNotification(subdomain);
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    } catch (err) {
      toast.error('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ messageData: '' });
    setIsAddModalOpen(true);
  };

  const openEditModal = (notification) => {
    setSelectedNotification(notification);
    setFormData({ messageData: notification.messageData });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (notification) => {
    setSelectedNotification(notification);
    setIsDeleteModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const newNotification = await createNotification({
        ...formData,
        subdomain
      });
      setNotifications((prev) => [newNotification, ...prev]);
      toast.success('Notification created');
      setIsAddModalOpen(false);
    } catch (err) {
      toast.error('Failed to create notification');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateNotification(selectedNotification._id, {
        ...formData,
        subdomain
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === updated._id ? updated : n))
      );
      toast.success('Notification updated');
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNotification(selectedNotification._id);
      setNotifications((prev) =>
        prev.filter((n) => n._id !== selectedNotification._id)
      );
      toast.success('Notification deleted');
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (!filterStartDate) return true;

    const createdAtDate = new Date(n.createdAt).toISOString().split('T')[0];
    return createdAtDate === filterStartDate;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notification Management</h1>
        <Button variant="primary" onClick={openAddModal} className="flex items-center">
          <FaPlus className="mr-2" /> Add Notification
        </Button>
      </div>

      <div className="mb-4 flex justify-end flex-wrap gap-4">
        <input
          type="date"
          className="form-input w-48"
          value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <p>No notifications found.</p>
          ) : (
            filteredNotifications.map((notification) => (
              <Card key={notification._id} className="shadow-sm border">
                <div className='flex justify-between items-center w-[100%]'>
                  <p className="text-lg">{notification.messageData}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2 mt-4 justify-end">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => openEditModal(notification)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => openDeleteModal(notification)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Notification">
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              name="messageData"
              className="form-input"
              value={formData.messageData}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Notification">
        <form onSubmit={handleEdit}>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              name="messageData"
              className="form-input"
              value={formData.messageData}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Update</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Notification">
        <p className="mb-4">Are you sure you want to delete this notification?</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationManagement;

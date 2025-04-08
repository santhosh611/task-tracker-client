import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { createLeave } from '../../services/leaveService';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import appContext from '../../context/AppContext';

const ApplyForLeave = () => {
  const { user } = useAuth();
  const { subdomain } = useContext(appContext);
  const [formData, setFormData] = useState({
    leaveType: 'Annual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    totalDays: 0,
    reason: '',
    document: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total days when dates change
  const calculateTotalDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate) || isNaN(endDate)) return 0;

    // Calculate difference in days and add 1 (inclusive)
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Update total days if date fields change
      if (name === 'startDate' || name === 'endDate') {
        updated.totalDays = calculateTotalDays(
          name === 'startDate' ? value : prev.startDate,
          name === 'endDate' ? value : prev.endDate
        );
      }

      return updated;
    });
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, document: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subdomain || subdomain == 'main') {
      toast.error('Subdomain is missing, check the URL');
      return;
    }

    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      await createLeave({
        ...formData,
        subdomain,
        totalDays: parseInt(formData.totalDays)
      });

      toast.success('Leave application submitted successfully!');

      // Reset form
      setFormData({
        leaveType: 'Annual Leave',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        totalDays: 0,
        reason: '',
        document: null
      });
    } catch (error) {
      toast.error(error.message || 'Failed to submit leave application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Apply for Leave</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="form-group">
              <label htmlFor="leaveType" className="form-label">Leave Type</label>
              <select
                id="leaveType"
                name="leaveType"
                className="form-input"
                value={formData.leaveType}
                onChange={handleChange}
                required
              >
                <option value="Annual Leave">Annual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Personal Leave">Personal Leave</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="totalDays" className="form-label">Total Days</label>
              <input
                type="number"
                id="totalDays"
                name="totalDays"
                className="form-input"
                value={formData.totalDays}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="startDate" className="form-label">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-input"
                value={formData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate" className="form-label">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-input"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="form-group mb-6">
            <label htmlFor="reason" className="form-label">Reason</label>
            <textarea
              id="reason"
              name="reason"
              className="form-input"
              rows="4"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Provide details about your leave request"
              required
            ></textarea>
          </div>

          <div className="form-group mb-6">
            <label htmlFor="document" className="form-label">Supporting Document (optional)</label>
            <input
              type="file"
              id="document"
              name="document"
              className="form-input"
              onChange={handleDocumentChange}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload any supporting documents (medical certificates, etc.)
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner size="sm" /> : 'Submit Leave Application'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ApplyForLeave;
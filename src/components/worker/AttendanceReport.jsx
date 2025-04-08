import React, { Fragment, useState, useEffect, useContext } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getWorkerAttendance } from '../../services/attendanceService';
import Table from '../common/Table';
import Spinner from '../common/Spinner';
import { toast } from 'react-toastify';
import appContext from '../../context/AppContext';

const AttendanceReport = () => {
    const { user } = useAuth();
    const { subdomain } = useContext(appContext);
    const [attendanceData, setAttendanceData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        if (!user?.rfid || !subdomain || subdomain === 'main') {
            toast.error("Invalid RFID or subdomain.");
            return;
        }

        const fetchAttendance = async () => {
            setIsLoading(true);
            try {
                const data = await getWorkerAttendance({ rfid: user.rfid, subdomain });
                setAttendanceData(Array.isArray(data.attendance) ? data.attendance : []);
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch attendance data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendance();
    }, [user?.rfid, subdomain]);

    const filteredAttendance = attendanceData.filter(record => {
        return !filterDate || (record.date && record.date.startsWith(filterDate));
    });

    const columns = [
        {
            header: 'Name',
            accessor: 'name',
            render: (record) => (
                <div className="flex items-center">
                    {record?.photo && (
                        <img
                            src={`http://localhost:5000/uploads/${record.photo}` || `https://ui-avatars.com/api/?name=${encodeURIComponent(record.name)}`}
                            alt="Worker"
                            className="w-8 h-8 rounded-full mr-2"
                        />
                    )}
                    {record?.name || 'Unknown'}
                </div>
            )
        },
        {
            header: 'Employee ID',
            accessor: 'rfid',
            render: (record) => record.rfid || 'Unknown'
        },
        {
            header: 'Date',
            accessor: 'date',
            render: (record) => record.date ? record.date.split('T')[0] : 'Unknown'
        },
        {
            header: 'Time',
            accessor: 'time',
            render: (record) => record.time || 'Unknown'
        },
        {
            header: 'Presence',
            accessor: 'presence',
            render: (record) => record.presence ? <p className='text-green-600'>IN</p> : <p className='text-red-600'>OUT</p>
        }
    ];

    return (
        <Fragment>
            <h1 className='text-2xl font-bold'>Attendance Reports</h1>
            <div className='bg-white border rounded-lg p-4'>
                <div className="flex justify-between items-center mb-6">
                    <div></div> {/* Empty div to push the date input to the right */}
                    <input
                        type="date"
                        className="form-input w-60" // Reduced width
                        placeholder="Filter by date..."
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <Spinner size="md" variant="default" />
                ) : (
                    <Table
                        columns={columns}
                        data={filteredAttendance.reverse()}
                        noDataMessage="No attendance records found."
                    />
                )}
            </div>
        </Fragment>
    );
};

export default AttendanceReport;

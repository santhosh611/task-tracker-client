import React, { Fragment, useState, useEffect, useContext } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getWorkerAttendance } from '../../services/attendanceService';
import Table from '../common/Table';
import Spinner from '../common/Spinner';
import { toast } from 'react-toastify';
import appContext from '../../context/AppContext';
import { FaDownload } from 'react-icons/fa';
import Button from '../common/Button';

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

    // Function to download attendance data as CSV
    const downloadAttendanceCSV = () => {
        // Check if there is data to download
        if (filteredAttendance.length === 0) {
            toast.warning("No attendance data to download");
            return;
        }

        // Define headers for the CSV file
        const headers = [
            'Name',
            'Employee ID',
            'Date',
            'Time',
            'Status'
        ];

        // Map the data to CSV rows
        const csvRows = filteredAttendance.map(record => [
            record?.name || 'Unknown',
            record?.rfid || 'Unknown',
            record.date ? record.date.split('T')[0] : 'Unknown',
            record.time || 'Unknown',
            record.presence ? 'IN' : 'OUT'
        ]);

        // Prepare CSV content
        let csvContent = headers.join(',') + '\n';
        csvRows.forEach(row => {
            // Handle any commas or quotes in the data
            const formattedRow = row.map(cell => {
                if (cell === null || cell === undefined) return '';
                const cellString = String(cell);
                // If the cell contains commas, quotes, or newlines, wrap it in quotes
                if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\n')) {
                    return `"${cellString.replace(/"/g, '""')}"`;
                }
                return cellString;
            });
            csvContent += formattedRow.join(',') + '\n';
        });

        // Create a Blob with the CSV content
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // Create a download link and trigger the download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        
        // Format current date for filename
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        const employeeName = user?.name ? user.name.replace(/\s+/g, '_') : 'Employee';
        
        // Include employee name and date range in filename
        const dateInfo = filterDate ? `_${filterDate}` : `_${formattedDate}`;
        link.setAttribute('download', `${employeeName}_Attendance_Report${dateInfo}.csv`);
        
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Attendance report downloaded successfully!");
    };

    const columns = [
        {
            header: 'Name',
            accessor: 'name',
            render: (record) => (
                <div className="flex items-center">
                    {record?.photo && (
                        <img
                            src= {record.photo ? record.photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(record.name)}`}
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
                <div className="flex justify-end space-x-4 items-center mb-6">
                    <div></div> {/* Empty div to push the date input to the right */}
                    <input
                        type="date"
                        className="form-input w-60" // Reduced width
                        placeholder="Filter by date..."
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                    <Button
                        variant="primary"
                        className="flex items-center"
                        onClick={downloadAttendanceCSV}
                    >
                        <FaDownload className="mr-2" />Download
                    </Button>
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
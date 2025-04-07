import React, { Fragment, useRef, useState, useEffect, useContext } from 'react';
import { FaPlus } from 'react-icons/fa';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Webcam from "react-webcam";
import jsQR from "jsqr";
import appContext from '../../context/AppContext';
import { toast } from 'react-toastify';
import { putAttendance, getAttendance } from '../../services/attendanceService';
import Table from '../common/Table';

const AttendanceManagement = () => {
    const [worker, setWorker] = useState({ rfid: "" });
    const [qrText, setQrText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchName, setSearchName] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterRfid, setFilterRfid] = useState(''); // New state for RFID filter
    const webcamRef = useRef(null);

    const { subdomain } = useContext(appContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!subdomain || subdomain === 'main') {
            toast.error("Subdomain not found, check the URL.");
            return;
        }

        if (worker.rfid.trim() === "") {
            toast.error("Enter the RFID");
            return;
        }

        putAttendance({ rfid: worker.rfid, subdomain })
            .then(response => {
                toast.success(response.message || "Attendance marked successfully!");
                if (subdomain && subdomain !== 'main') {
                    fetchAttendanceData();
                }
            })
            .catch(error => {
                console.error(error.message);
                toast.error(error.message || "Failed to mark attendance. Please try again.");
            });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            scanQRCode();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const scanQRCode = () => {
        if (webcamRef.current) {
            const video = webcamRef.current.video;
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext("2d");

                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, canvas.width, canvas.height);

                if (code) {
                    setQrText(code.data);
                    console.log("QR Code Data:", code.data);
                    setWorker({ ...worker, rfid: code.data });
                }
            }
        }
    };

    const fetchAttendanceData = async () => {
        setIsLoading(true);
        try {
            const data = await getAttendance({ subdomain });
            setAttendanceData(Array.isArray(data.attendance) ? data.attendance : []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch attendance data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (subdomain && subdomain !== 'main') {
            fetchAttendanceData();
        }
    }, [subdomain]);

    const filteredAttendance = attendanceData.filter(record => {
        const matchesName = !searchName || record?.name?.toLowerCase().includes(searchName.toLowerCase());
        const matchesDepartment = !filterDepartment || record?.departmentName?.toLowerCase().includes(filterDepartment.toLowerCase());
        const matchesDate = !filterDate || (record.date && record.date.startsWith(filterDate));
        const matchesRfid = !filterRfid || record?.rfid?.toLowerCase().includes(filterRfid.toLowerCase()); // RFID filter logic
        return matchesName && matchesDepartment && matchesDate && matchesRfid;
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
            header: 'RFID',
            accessor: 'rfid',
            render: (record) => record?.rfid || 'Unknown'
        },
        {
            header: 'Department',
            accessor: 'departmentName',
            render: (record) => record?.departmentName || 'Unknown'
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Attendance Management</h1>
                <Button
                    variant="primary"
                    className="flex items-center"
                    onClick={() => setIsModalOpen(true)}
                >
                    <FaPlus className="mr-2" />Attendance
                </Button>
            </div>

            <div className='bg-white border rounded-lg p-4'>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search by name..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Filter by RFID..."
                        value={filterRfid}
                        onChange={(e) => setFilterRfid(e.target.value)}
                    />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Filter by department..."
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                    />
                    <input
                        type="date"
                        className="form-input"
                        placeholder="Filter by date..."
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <p>Loading...</p>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        data={filteredAttendance.reverse()}
                        noDataMessage="No attendance records found."
                    />
                )}

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setWorker({ rfid: "" });
                    }}
                    title="RFID Input & QR Scanner"
                    size="md"
                >
                    <form onSubmit={handleSubmit} className="mb-4">
                        <input
                            type="text"
                            name="rfid"
                            id="rfid"
                            onChange={(e) =>
                                setWorker({ ...worker, [e.target.id]: e.target.value })
                            }
                            placeholder="RFID"
                            className="border p-2 mb-2 w-full"
                        />
                        <Button
                            variant="primary"
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 w-full"
                        >
                            Submit
                        </Button>
                    </form>

                    <Webcam
                        ref={webcamRef}
                        style={{
                            width: "100%",
                            maxWidth: "400px",
                            margin: "0 auto",
                            border: "1px solid #ddd",
                        }}
                        videoConstraints={{
                            facingMode: "environment",
                        }}
                    />
                    {qrText && (
                        <div style={{ marginTop: "20px" }}>
                            <h1 className='text-lg text-center'>RFID: {qrText}</h1>
                        </div>
                    )}
                </Modal>
            </div>
        </Fragment>
    );
};

export default AttendanceManagement;

import React, { Fragment, useRef, useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Webcam from "react-webcam";
import jsQR from "jsqr";

const AttendanceManagement = () => {
    const [worker, setWorker] = useState({ rfid: "" });
    const [qrText, setQrText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const webcamRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (worker.rfid.trim() === "") {
            console.log("Enter all the fields");
            return;
        }
        console.log("RFID Submitted:", worker.rfid);
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

    return (
        <Fragment>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Attendance Management</h1>
                <Button
                    variant="primary"
                    className="flex items-center"
                    onClick={() => setIsModalOpen(true)}
                >
                    <FaPlus className="mr-2" />Put Attendance
                </Button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
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
        </Fragment>
    );
};

export default AttendanceManagement;

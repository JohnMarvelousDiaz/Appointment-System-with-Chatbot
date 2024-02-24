import React, { useEffect, useState } from 'react';
import { auth } from '../firebase-config';
import { signOut } from "firebase/auth";
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import bulsulogo from '../images/bulsulogo.jpg';
import { db } from '../firebase-config';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import adminP from '../images/user.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FaCalendarAlt, FaUser, FaClock } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Chart from 'chart.js/auto';
import ChatbotReport from '../ReportPage/chatbotreport';
import { Bar } from "react-chartjs-2";
import './css/Dashboard.css';

export default function Dashboard() {
    const labels = [
         "November", "December", "January", "February", "March", "April", "May", "June", "July", "August", "September","October"
    ];

    // Initialize state for the dynamic data
    const [chartData, setChartData] = useState({
        labels: labels,
        datasets: [
            {
                label: "Pending",
                backgroundColor: "#00BFFF",
                borderColor: "#00BFFF",
                data: Array(12).fill(0), 
            },
            {
                label: "Accepted",
                backgroundColor: "#228B22",
                borderColor: "#228B22",
                data: Array(12).fill(0),
            },
            {
                label: "Declined",
                backgroundColor: "#F08080",
                borderColor: "#F08080",
                data: Array(12).fill(0),
            },
        ],

        
    });

    const minMax = {
        scales: {
            y: {
                min: 0,
                max: 20, // Range
            },
        },
    };

    //Print
    const handlePrint = async () => {
        try {
            // Fetch the latest appointment data
            const data = await getDocs(appointmentsCollectionRef);
            const appointmentData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    
            // Update the state variables
            const pendingAppointmentsCount = appointmentData.filter((appointment) => appointment.status === "Pending").length;
            const acceptedAppointmentsCount = appointmentData.filter((appointment) => appointment.status === "Accepted").length;
            const declinedAppointmentsCount = appointmentData.filter((appointment) => appointment.status === "Declined").length;
    
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
            const todayAppointmentsCount = appointmentData.filter((appointment) => {
                const appointmentDate = new Date(appointment.appointmentDate);
                return appointmentDate >= todayStart && appointmentDate < todayEnd;
            }).length;
    
            // Update the state variables with the latest data
            setAppointmentCountPending(pendingAppointmentsCount);
            setAppointmentCountAccepted(acceptedAppointmentsCount);
            setAppointmentCountDeclined(declinedAppointmentsCount);
            setAppointmentCountToday(todayAppointmentsCount);
    
            // Update the chart data
            setChartData((prevChartData) => {
                const newChartData = { ...prevChartData };
                newChartData.datasets = newChartData.datasets.map((dataset) => {
                    if (dataset.label === "Pending") {
                        return {
                            ...dataset,
                            data: [pendingAppointmentsCount],
                        };
                    } else if (dataset.label === "Accepted") {
                        return {
                            ...dataset,
                            data: [acceptedAppointmentsCount],
                        };
                    } else if (dataset.label === "Declined") {
                        return {
                            ...dataset,
                            data: [declinedAppointmentsCount],
                        };
                    }
                    return dataset;
                });
                return newChartData;
            });
    
            // Delay for a short time to allow state update before capturing the content
            setTimeout(() => {
                const content = document.querySelector(".dashboard");
    
                // Generate and download the PDF
                html2canvas(content, { scale: 2 }).then((canvas) => {
                    const pdf = new jsPDF('landscape');
                    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
                    pdf.save('dashboard.pdf');
                });
            }, 100); // Adjust the delay time as needed
        } catch (error) {
            console.error("An error occurred:", error);
            // Handle the error, show an alert, or log it as needed
        }
    };
    
    
    
        


    const [appointments, setAppointments] = useState([]);
    const [appointmentCountPending, setAppointmentCountPending] = useState(0);
    const [appointmentCountAccepted, setAppointmentCountAccepted] = useState(0);
    const [appointmentCountDeclined, setAppointmentCountDeclined] = useState(0);
    const [appointmentCountToday, setAppointmentCountToday] = useState(0);
    const appointmentsCollectionRef = collection(db, "appointment");

    useEffect(() => {
        const getAppointment = async () => {
            const data = await getDocs(appointmentsCollectionRef);
            const appointmentData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setAppointments(appointmentData);

            // Bilangin ang mga appointments base sa kanilang status
            const pendingAppointmentsCount = appointmentData.filter((appointment) => appointment.status === "Pending").length;
            const acceptedAppointmentsCount = appointmentData.filter((appointment) => appointment.status === "Accepted").length;
            const declinedAppointmentsCount = appointmentData.filter((appointment) => appointment.status === "Declined").length;

            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

            const todayAppointmentsCount = appointmentData.filter((appointment) => {
                const appointmentDate = new Date(appointment.appointmentDate);
                return appointmentDate >= todayStart && appointmentDate < todayEnd;
            }).length;

            // I-update ang mga state variables na nauugnay sa iyong mga div
            setAppointmentCountPending(pendingAppointmentsCount);
            setAppointmentCountAccepted(acceptedAppointmentsCount);
            setAppointmentCountDeclined(declinedAppointmentsCount);
            setAppointmentCountToday(todayAppointmentsCount);

            // Update the chart data with the calculated counts
            setChartData((prevChartData) => {
                const newChartData = { ...prevChartData };
                newChartData.datasets = newChartData.datasets.map((dataset) => {
                    if (dataset.label === "Pending") {
                        // Update the "Pending" dataset
                        return {
                            ...dataset,
                            data: [pendingAppointmentsCount],
                        };
                    } else if (dataset.label === "Accepted") {
                        // Update the "Accepted" dataset
                        return {
                            ...dataset,
                            data: [acceptedAppointmentsCount],
                        };
                    } else if (dataset.label === "Declined") {
                        // Update the "Declined" dataset
                        return {
                            ...dataset,
                            data: [declinedAppointmentsCount],
                        };
                    }
                    return dataset;
                });
                return newChartData;
            });
        };

        getAppointment();
    }, []);

    const adminSignOut = () => {
        try {
            document.title = 'Confirm Log Out?';
            Swal.fire({
                title: 'Are you sure you want to Log Out?',
                icon: "question",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: '<i class="fa-solid fa-check"></i> Confirm',
                confirmButtonColor: '#33B864',
                cancelButtonText: '<i class="fa-solid fa-xmark"></i> Cancel',
                cancelButtonColor: '#DC3545',
            }).then((result) => {
                if (result.isConfirmed) {
                    signOut(auth).then(() => {
                        Swal.fire({
                            title: "Log Out Successful",
                            icon: "success",
                            showConfirmButton: false,
                            timer: 2000,
                        }).then(() => {
                            window.location.href = '/'
                        });
                    }).catch(error => {
                        console.error("An error occurred:", error);
                        Swal.fire({
                            title: "An error occurred, please try again later",
                            icon: "error",
                            confirmButtonText: "OK",
                        });
                    });
                } else if (result.isDismissed) {
                    document.title = 'CICT Appointment System';
                }
            });
        } catch (error) {
            console.error("An error occurred:", error);
            Swal.fire({
                title: "An error occurred, please try again later",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const [isAccountOpen, setIsAccountOpen] = useState(false);

    const toggleAccountDropdown = () => {
        setIsAccountOpen(!isAccountOpen);
    };

    const [loggedIn, setLoggedIn] = useState(true);
    const [displayName, setDisplayName] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setDisplayName(user.displayName || 'Display Name Not Set');
                setLoggedIn(true);
            } else {
                setDisplayName(null);
                setLoggedIn(false);
            }
        });
        return () => unsubscribe();
    }, []);

    if (loggedIn && displayName === 'admin') {
        document.title = 'Admin Dashboard';
        return (
            <div>
                <div className="dashboard">
                    <div className="admin-panel">
                        <nav>
                            <div className="profile">
                                <img src={adminP} alt="Admin Profile" />
                                <h3>Welcome Admin!</h3>
                            </div>
                            <br /><br />
                            <div className="reps">
                                <h3 className="menu-heading">Reports</h3>
                                <ul className="menu-list">
                                    <li className="dash">
                                        <FaUser />&nbsp; Dashboard
                                    </li>
                                </ul>
                            </div>
                            <div className="manage">
                                <h3 className="menu-heading">Manage</h3>
                                <ul className="menu-list">
                                    <li className="sched">
                                        <Link to="/Schedule">  <FaCalendarAlt /> Schedule </Link>
                                    </li>
                                    <li className="appoi">
                                        <FaClock /> <Link to="/Appo"> Appointment </Link>
                                    </li>
                                   
                                </ul>
                            </div>
                            <div className="settings">
                                <h3 className="menu-heading">Settings</h3>
                                <ul className="menu-list">
                                    <li className="sett">
                                        <div className="dropdown-container">
                                            <div className="dropdown-button" onClick={toggleAccountDropdown}>
                                            <FontAwesomeIcon icon={faSignOutAlt} />
                                                <button onClick={() => adminSignOut()}> Logout</button>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                    </div>
                    <div className="content">
                        <div className="header">
                            <div className="text-container">
                                <div className="logo-text-container">
                                    <div className="logo-container">
                                        <img src={bulsulogo} alt="BSU LOGO" />
                                    </div>
                                    <h1>BulSU CICT</h1>
                                    <h1 className="second-h1">Appointment System</h1>
                                </div>
                            </div>
                            <div className="togg">
                                <p>Reports &raquo; &raquo; Dashboard Tab</p> <button onClick={handlePrint}>Print Dashboard</button>
                            </div>
                        </div>
                        <div className="container-admin">
                            <div className="main-admin">
                                <div className="cm">
                                    <h2>{appointmentCountPending} </h2>
                                    <p>Pending Appointments</p>
                                    
                                </div>
                                <div className="pp">
                                    <h2>{appointmentCountToday}</h2>
                                    <p>Appointments Today</p>
                                    
                                </div>
                                <div className="ms">
                                    <h2>{appointmentCountDeclined}</h2>
                                    <p>Declined Appointments</p>
                                    
                                </div>
                                <div className="fas">
                                    <h2>{appointmentCountAccepted}</h2>
                                    <p>Accepted Appointments</p>
                                    
                                </div>
                                <div className="actions">
                                    <div className="greport">
                                    <h2 className="chart-title">Monthly Appointment Report</h2>
                                        <Bar data={chartData} options={minMax} />
                                    </div>
                                    <div className="cdonut">
                                    <h2 className="chart-title">Chatbot Report</h2>
                                        <ChatbotReport />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <p>&copy; 2023 Nosacend. All rights reserved.</p>
                    </div>
                </div>


            </div>
        )
    } else if (loggedIn && displayName !== 'admin') {
        document.title = '404 Not Found';
        return (
            <div className='frontbody'>
                {/* Add 404 Not Found content */}
            </div>
        )
    } else if (!loggedIn) {
        Swal.fire({
            title: "You need to Log In first",
            icon: "warning",
            showConfirmButton: false,
            timer: 2000,
        }).then(() => {
            window.location.href = '/login';
        });
        return (
            <div className='frontbody'>
                {/* Add login prompt */}
            </div>
        )
    }
}

import { React, useState, useEffect, useRef } from 'react'
import { db } from '../firebase-config';
import { addDoc, collection, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc, onSnapshot/* , updateDoc,  */ } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.css';
import cictlogo from '../images/cictlogo.png';
import bot from '../images/chatbot.png';
import './HomePage.css';
import { auth } from '../firebase-config';
import { signOut } from "firebase/auth";
import Swal from 'sweetalert2'
import ChatbotComponent from '../Chatbot/ChatbotPage';
import HowitWorks from '../HowitWorks/HowitWorks'
import emailjs from "@emailjs/browser";
import notificationSound from '../images/notification.mp3';

function getDate() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const year = today.getFullYear();

    if (month === 1) {
        const months = "January";
        return `${months} ${date}, ${year}`;
    }
    else if (month === 2) {
        const months = "February";
        return `${months} ${date}, ${year}`;
    }
    else if (month === 3) {
        const months = "March";
        return `${months} ${date}, ${year}`;
    }
    else if (month === 4) {
        const months = "April";
        return `${months} ${date}, ${year}`;
    }
    else if (month === 5) {
        const months = "May";
        return `${months} ${date}, ${year}`;
    }
    else if (month === 6) {
        const months = "June";
        return `${months} ${date}, ${year}`;
    }
    else if (month === 7) {
        const months = "July";
        return `${months} ${date}, ${year}`;
    }
    else if (month === 8) {
        const months = "August";
        return `${months} ${date}, ${year}`;
    }
    else if (month === 9) {
        const months = "September";
        return `${months} ${date}, ${year}`;
    }
    else if (month === 10) {
        const months = "October";
        return `${months} ${date}, ${year}`;
    }
    else if (month === 11) {
        const months = "November";
        return `${months} ${date}, ${year}`;
    }
    else if (month === 12) {
        const months = "December";
        return `${months} ${date}, ${year}`;
    }

}

function getTime() {
    let time = new Date();
    let hour = time.getHours();
    let min = time.getMinutes();
    if (hour >= 1 && hour <= 11) {
        const label = "AM";
        if (min < 10) {
            min = "0" + min;
        }
        return `${hour}:${min}${" "}${label}`;
    }
    else if (hour === 12) {
        if (min === 0) {
            const label = "NN";
            if (min < 10) {
                min = "0" + min;
            }
            return `${hour}:${min}${" "}${label}`;
        }
        else if (min > 0) {
            const label = "PM";
            if (min < 10) {
                min = "0" + min;
            }
            return `${hour}:${min}${" "}${label}`;
        }
    }
    else if (hour >= 13 && hour <= 23) {
        const label = "PM";
        const hours = hour - 12;
        if (min < 10) {
            min = "0" + min;
        }
        return `${hours}:${min}${" "}${label}`;
    }
    else if (hour === 0) {
        if (min === 0) {
            const label = "MN";
            if (min < 10) {
                min = "0" + min;
            }
            return `${hour}:${min}${" "}${label}`;
        }
        else if (min > 0) {
            if (min < 10) {
                min = "0" + min;
            }
            const label = "AM";
            return `${hour}:${min}${" "}${label}`;
        }
    }
}


export default function HomePage() {

    const about = useRef(null);
    const howitworks = useRef(null);
    const appointment = useRef(null);

    const aboutClick = () => {
        about.current?.scrollIntoView({ behavior: 'smooth' });
        document.title = 'About';
        setIsOpen(false);
    };
    const howitworksClick = () => {
        howitworks.current?.scrollIntoView({ behavior: 'smooth' });
        document.title = 'How It Works';
        setIsOpen(false);
    };
    const appointmentClick = () => {
        appointment.current?.scrollIntoView({ behavior: 'smooth' });
        document.title = 'Request Appointment';
        setIsOpen(false);
    };
    const userSignOut = () => {
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
                            timer: 1500,
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
                    })
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

    }

    const [minDate, setMinDate] = useState('');
    useEffect(() => {
        const dtToday = new Date();
        let month = dtToday.getMonth() + 1;
        let day = dtToday.getDate() + 1;
        const year = dtToday.getFullYear();

        if (month < 10) {
            month = '0' + month.toString();
        }
        if (day < 10) {
            day = '0' + day.toString();
        }

        const formattedMinDate = `${year}-${month}-${day}`;
        setMinDate(formattedMinDate);
    }, []);
    const formatDateName = (inputDate) => {

        const date = new Date(inputDate);
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const month = date.getMonth();
        const day = date.getDate();
        const year = date.getFullYear();
        const dateName = `${monthNames[month]} ${day}, ${year}`;
        return dateName;
    };
    const handleAppDateChange = (event) => {
        const inputDate = event.target.value;
        const dateName = formatDateName(inputDate);
        setNewAppDate(dateName);
    };
    const [isOpen, setIsOpen] = useState(false);
    const togglePopup = () => {
        setIsOpen(!isOpen);
        if (isOpen) {
            document.title = 'CICT Appointment System';
        } else if (!isOpen) {
            document.title = 'Request Appointment';
        }
    };

    const [newCollege, setNewCollege] = useState("");
    const [newConcern, setNewConcern] = useState("");
    const [newAppDate, setNewAppDate] = useState("");
    const [newAppTime, setNewAppTime] = useState("");
    const [newStatus, setNewStatus] = useState("Pending");
    const [currentDate, setCurrentDate] = useState(getDate());
    const [currentTime, setCurrentTime] = useState(getTime());

    /* MAP APPOINTMENTS PARA SA ADMIN */
    /* const [appointments, setAppointments] = useState([]);
    const appointmentsCollectionRef = collection(db, "appointment");

    useEffect(() => {

        const getAppointment = async () => {
            const data = await getDocs(appointmentsCollectionRef);
            setAppointments(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        };

        getAppointment()
    }) */

    useEffect(() => emailjs.init("YqpZgIrM3NT9FW2vS"), []);
    const [appointmentCountPending, setAppointmentCountPending] = useState(0);
    const [appointments, setAppointments] = useState([]);
    const appointmentsCollectionRef = collection(db, "appointment");

    useEffect(() => {
        const getAppointment = async () => {
            const data = await getDocs(appointmentsCollectionRef);
            const appointmentData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setAppointments(appointmentData);

            const pendingAppointmentsCount = appointmentData.filter((appointment) => appointment.status === "Pending").length;

            setAppointmentCountPending(pendingAppointmentsCount + 1);

        };

        getAppointment();
    }, []);

    const createAppointment = async () => {

        try {
            if (!newCollege || !newConcern || !newAppDate || !newAppTime) {
                Swal.fire({
                    title: "Please fill up all fields. Try Again.",
                    icon: "warning",
                    showConfirmButton: false,
                    timer: 1500,
                });
                return;
            }

            const isDuplicate = appointments.some((appointment) => {
                return appointment.appdate === newAppDate && appointment.apptime === newAppTime && appointment.status === "Accepted";
            });

            const selectedDate = new Date(newAppDate);
            if (selectedDate.getDay() === 0) {
                Swal.fire({
                    title: "No Sundays!",
                    text: "Appointment requests on Sunday is not allowed.",
                    icon: "error",
                    confirmButtonText: '<i class="fa-solid fa-thumbs-up"></i> Okay',
                });
            } else if (isDuplicate) {
                Swal.fire({
                    title: "Date or Time not available!",
                    text: "An appointment has already been approved on the selected date or time.",
                    icon: "error",
                    confirmButtonText: '<i class="fa-solid fa-thumbs-up"></i> Okay',
                });
            } else {
                const userUid = userLog.uid;
                const email = userLog.email;
                const name = userLog.displayName;
                const newAppointment = {
                    uid: userUid,
                    name: name,
                    email: email,
                    college: newCollege,
                    concern: newConcern,
                    appdate: newAppDate,
                    apptime: newAppTime,
                    time: currentTime,
                    date: currentDate,
                    status: newStatus,

                };

                await Swal.fire({
                    title: "Confirm Appointment Request?",
                    icon: "question",
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: '<i class="fa-solid fa-check"></i> Confirm',
                    cancelButtonText: '<i class="fa-solid fa-xmark"></i> Cancel',
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        await addDoc(userAppointmentsRef, newAppointment);

                        const serviceId = "service_m4b2ns9";
                        const templateId = "template_gg7j3ts"

                        const email = userLog.email;
                        const name = userLog.displayName;

                        emailjs.send(serviceId, templateId, {
                            pendingCount: appointmentCountPending,
                            currentUser: email,
                            name: name,
                            email: email,
                            course: newCollege,
                            date: newAppDate,
                            time: newAppTime,
                            concern: newConcern,
                        });

                        Swal.fire({
                            title: "Appointment Request Successful",
                            text: "Please wait for the confirmation e-mail sent by the Admin",
                            icon: "success",
                            showConfirmButton: false,
                            timer: 1500,
                        }).then(() => {
                            setIsOpen(!isOpen);
                        });
                    } else if (result.isDismissed) {

                    }
                });
            }
        } catch (error) {
            console.error("An error occurred:", error);
            Swal.fire({
                title: "An error occurred, please try again later",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    }

    const cancelAppointment = async (id) => {
        try {
            const appointmentDoc = doc(db, "appointment", id)

            await Swal.fire({
                title: "Cancel Appointment Request?",
                icon: "question",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: '<i class="fa-solid fa-check"></i> Confirm',
                cancelButtonText: '<i class="fa-solid fa-xmark"></i> Cancel',
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await deleteDoc(appointmentDoc);
                    Swal.fire({
                        title: "Appointment Request Canceled",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                } else if (result.isDismissed) {

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
    }

    const deleteAppointment = async (id) => {
        try {


            const appointmentDoc = doc(db, "appointment", id)

            await Swal.fire({
                title: "Delete Appointment Request?",
                icon: "question",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: '<i class="fa-solid fa-check"></i> Confirm',
                cancelButtonText: '<i class="fa-solid fa-xmark"></i> Cancel',
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await deleteDoc(appointmentDoc);
                    Swal.fire({
                        title: "Appointment Request Deleted",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                } else if (result.isDismissed) {

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
    }

    const [loggedIn, setLoggedIn] = useState(true);
    const [displayName, setDisplayName] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setDisplayName(user.displayName || 'Display Name Not Set');
                setLoggedIn(user.emailVerified);
            } else {
                setDisplayName(null);
                setLoggedIn(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const userLog = auth.currentUser;

    const [userAppointments, setUserAppointments] = useState([]);

    const userAppointmentsRef = collection(db, "appointment");

    useEffect(() => {
        if (userLog) {
            const userUid = userLog.uid;
            const userAppointmentsRef = collection(db, "appointment");

            const unsubscribe = onSnapshot(
                query(userAppointmentsRef, where("uid", "==", userUid)),
                (querySnapshot) => {
                    const appointmentsData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                    setUserAppointments(appointmentsData);
                },
                (error) => {
                    console.error("Error getting user appointments:", error);
                }
            );

            return () => {
                // This unsubscribe function will detach the listener when the component unmounts
                unsubscribe();
            };
        }
    }, [userLog]);

    //FOR NOTIF
    const [userNotifications, setUserNotifications] = useState([]);

    useEffect(() => {
        if (userLog) {
            const userUid = userLog.uid;
            const userNotificationCollectionRef = collection(db, "notifications");

            const unsubscribe = onSnapshot(
                query(userNotificationCollectionRef, where("uid", "==", userUid), where("isChecked", "==", true)),
                (querySnapshot) => {
                    const notificationData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                    setUserNotifications(notificationData);
                },
                (error) => {
                    console.error("Error getting notifications:", error);
                }
            );

            return () => {
                unsubscribe();
            };
        }
    }, [userLog]);

    const [unreadUserNotifications, setUnreadUserNotifications] = useState([]);

    useEffect(() => {
        if (userLog) {
            const userUid = userLog.uid;
            const unreadUserNotificationCollectionRef = collection(db, "notifications");

            const unsubscribe = onSnapshot(
                query(unreadUserNotificationCollectionRef, where("uid", "==", userUid), where("isChecked", "==", false)),
                (querySnapshot) => {
                    const notificationData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                    setUnreadUserNotifications(notificationData);
                },
                (error) => {
                    console.error("Error getting notifications:", error);
                }
            );

            return () => {
                unsubscribe();
            };
        }
    }, [userLog]);

    useEffect(() => {
        document.title = 'CICT Appointment System';
    }, []);

    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
        setShouldSwing(false);
    };

    useEffect(() => {
        return () => {
            if (isDropdownOpen) {
                const userUid = userLog.uid;

                const unreadNotificationsQuery = query(
                    collection(db, 'notifications'),
                    where('uid', '==', userUid),
                    where('isChecked', '==', false)
                );

                const getUnreadNotifications = async () => {
                    const querySnapshot = await getDocs(unreadNotificationsQuery);

                    querySnapshot.forEach(async (docSnapshot) => {
                        const notificationDocRef = doc(db, 'notifications', docSnapshot.id);
                        try {
                            await updateDoc(notificationDocRef, {
                                isChecked: true,
                            });
                        } catch (error) {
                            console.error('Error updating notification:', error);
                        }
                    });
                };

                getUnreadNotifications();
            }
        };
    }, [isDropdownOpen, userLog, db]);

    const [shouldSwing, setShouldSwing] = useState(false);

    const playNotificationSound = () => {
        const audio = new Audio(notificationSound);
        audio.play();
    };

    useEffect(() => {
        if (unreadUserNotifications.length !== 0) {
            setShouldSwing(true);
            playNotificationSound();

            const intervalId = setInterval(() => {
                document.title = document.title === 'New Notification!' ? 'CICT Appointment System' : 'New Notification!';
            }, 1000);

            if (Notification.permission === 'granted') {
                new Notification('Update on your Appointment Request!', {
                    body: 'You have unread notifications on the CICT Appointment System.',
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('Update on your Appointment Request!', {
                            body: 'You have unread notifications on the CICT Appointment System.',
                        });
                    }
                });
            }

            return () => clearInterval(intervalId);
        } else {
            document.title = 'CICT Appointment System';
        }
    }, [unreadUserNotifications]);

    const formatTimestamp = (timestamp) => {
        const options = {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        };

        return new Intl.DateTimeFormat('en-US', options).format(timestamp);
    };

    if (!loggedIn) {
        Swal.fire({
            title: "You need to Log In first",
            icon: "warning",
            showConfirmButton: false,
            timer: 1500,
        }).then(() => {
            window.location.href = '/login'
        });
        return (
            <div className='frontbody'>

            </div>
        )
    } else if (loggedIn && displayName === 'admin') {
        document.title = '404 Not Found';
        return (
            <div className='frontbody'>
                {/* MAGLALAGAY NG 404 NOT FOUND */}
            </div>
        );
    } else if (loggedIn && displayName !== 'admin') {

        return (

            <div className='frontbody'>
                <div className='navbar height bg-maroon'>
                    <a href="/home" className="display-none">
                        <span className="navbar-margin text-white"><img src={cictlogo} alt="" className='logosize' /> <span className='text-size'>&nbsp;BulSU CICT <b>Appointment System</b></span></span>
                    </a>

                    <div className='nav-options'>
                        <span className='displayName'>Hello, <strong>{displayName}</strong></span>

                        <button className='btnNav' onClick={aboutClick}><span className="text-white nav-margin" >About</span></button>

                        <button className='btnNav' onClick={howitworksClick}><span className="text-white nav-margin">How It Works</span></button>

                        <button className='btnNav' onClick={appointmentClick}><span className="text-white nav-margin">My Appointment</span></button>

                        <button className={`btnNav ${shouldSwing ? 'swing' : ''}`} onClick={toggleDropdown}><span className="text-white nav-margin" style={{ fontSize: '20px', top: '3px', right: '15px', position: 'relative' }}><i class="fa-solid fa-bell"></i></span></button>
                        {isDropdownOpen && (
                            <div className="notification-dropdown notification-animation">
                                <h2 style={{color:'white'}}>Notifications</h2>
                                <p style={{ textAlign: 'left', fontSize: '18px', fontWeight: '600', color:'white' }}>New</p>
                                {unreadUserNotifications
                                    .sort((a, b) => b.timestamp - a.timestamp)
                                    .map((notify, index) => (
                                        <div key={index} onClick={appointmentClick}>
                                            <div className="notification-item">
                                                <div className='left'>
                                                    <img src={cictlogo} alt="" className='logosize-notif' />
                                                </div>
                                                Your Appointment Request on <strong>{notify.appdate}</strong> at <strong>{notify.apptime}</strong> has been <strong>{notify.status}</strong> by the Admin
                                                <div className='notif-footer'>
                                                    {formatTimestamp(notify.timestamp.toDate())}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {unreadUserNotifications.length === 0 && (
                                    <p style={{color:'white'}}>No new notifications</p>
                                )}
                                <p style={{ textAlign: 'left', fontSize: '18px', fontWeight: '600', color:'white' }}>Earlier</p>
                                {userNotifications
                                    .sort((a, b) => b.timestamp - a.timestamp)
                                    .map((notify, index) => (
                                        <div key={index} onClick={appointmentClick}>
                                            <div className="notification-item">
                                                <div className='left'>
                                                    <img src={cictlogo} alt="" className='logosize-notif' />
                                                </div>
                                                Your Appointment Request on <strong>{notify.appdate}</strong> at <strong>{notify.apptime}</strong> has been <strong>{notify.status}</strong> by the Admin
                                                <div className='notif-footer'>
                                                    {formatTimestamp(notify.timestamp.toDate())}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {userNotifications.length === 0 && (
                                    <p style={{color:'white'}}>No past notifications</p>
                                )}

                            </div>
                        )}

                        <button type="button" onClick={userSignOut} className='nav-margin btn btn-warning'>Log Out</button>
                    </div>
                </div>

                {isOpen && (
                    <div className="popup">
                        <h2> Request Appointment</h2>
                        <input type='hidden' value={setCurrentTime}></input>
                        <input type='hidden' value={setCurrentDate}></input>
                        <input type='hidden' value={setNewStatus}></input>
                        <div className='row'>
                            <div className="col-md-4 mb-3">
                                <label htmlFor="college">Course:</label>
                                <select className='appointment-time' id="email" name="email" onChange={(event) => { setNewCollege(event.target.value) }}>
                                    <option hidden selected>Select Course</option>
                                    <option value="BSIT">BSIT</option>
                                    <option value="BLIS">BLIS</option>
                                    <option value="BSIS">BSIS</option>
                                </select>
                            </div>
                            <div className="col-md-4 mb-3">
                                <label htmlFor="date">Date:</label>
                                <input type='date' id="date" name="date" min={minDate} onChange={handleAppDateChange}></input>
                            </div>
                            <div className="col-md-4 mb-3">
                                <label htmlFor="time">Time:</label>
                                <select className='appointment-time' onChange={(event) => { setNewAppTime(event.target.value) }}>
                                    <option hidden selected>Select Time</option>
                                    <option value="7:00 AM">7:00 AM</option>
                                    <option value="7:15 AM">7:15 AM</option>
                                    <option value="7:30 AM">7:30 AM</option>
                                    <option value="7:45 AM">7:45 AM</option>
                                    <option value="8:00 AM">8:00 AM</option>
                                    <option value="8:15 AM">8:15 AM</option>
                                    <option value="8:30 AM">8:30 AM</option>
                                    <option value="8:45 AM">8:45 AM</option>
                                    <option value="9:00 AM">9:00 AM</option>
                                    <option value="9:15 AM">9:15 AM</option>
                                    <option value="9:30 AM">9:30 AM</option>
                                    <option value="9:45 AM">9:45 AM</option>
                                    <option value="10:00 AM">10:00 AM</option>
                                    <option value="10:15 AM">10:15 AM</option>
                                    <option value="10:30 AM">10:30 AM</option>
                                    <option value="10:45 AM">10:45 AM</option>
                                    <option value="11:00 AM">11:00 AM</option>
                                    <option value="11:15 AM">11:15 AM</option>
                                    <option value="11:30 AM">11:30 AM</option>
                                    <option value="11:45 AM">11:45 AM</option>
                                    <option value="12:00 PM">12:00 PM</option>
                                    <option value="12:15 PM">12:15 PM</option>
                                    <option value="12:30 PM">12:30 PM</option>
                                    <option value="12:45 PM">12:45 PM</option>
                                    <option value="01:00 PM">01:00 PM</option>
                                    <option value="01:15 PM">01:15 PM</option>
                                    <option value="01:30 PM">01:30 PM</option>
                                    <option value="01:45 PM">01:45 PM</option>
                                    <option value="02:00 PM">02:00 PM</option>
                                    <option value="02:15 PM">02:15 PM</option>
                                    <option value="02:30 PM">02:30 PM</option>
                                    <option value="02:45 PM">02:45 PM</option>
                                    <option value="03:00 PM">03:00 PM</option>
                                    <option value="03:15 PM">03:15 PM</option>
                                    <option value="03:30 PM">03:30 PM</option>
                                    <option value="03:45 PM">03:45 PM</option>
                                    <option value="04:00 PM">04:00 PM</option>
                                    <option value="04:15 PM">04:15 PM</option>
                                    <option value="04:30 PM">04:30 PM</option>
                                    <option value="04:45 PM">04:45 PM</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-12">
                            <label htmlFor="message">Message:</label>
                            <textarea rows='4' className='form-control' style={{ resize: 'none' }} type="text" placeholder='Concern...' id="message" name="message" onChange={(event) => { setNewConcern(event.target.value) }}></textarea>
                        </div>
                        <button onClick={createAppointment} className='btn btn-success formBtn'>Submit</button>
                        <button className="close-button formBtn" onClick={togglePopup}>
                            <strong className="close-buttons">X</strong>
                        </button>
                    </div>
                )}

                <div className='animation'>

                    <div className='contents'>

                        <div className='chatbot'>
                            <img src={bot} alt="" className='bot-size' />
                        </div>

                        <div className='paragraphfront' id='paragraphfront'>
                            <div className='aboutL'>
                            <div ref={about} className='about' id='paragraphfront'>
                            <div className='aboutLeft'>
                                <span><h3>ABOUT</h3> <p>Unlock the power of seamless scheduling! 🚀 Click the 'Schedule Now' button to effortlessly request an appointment with our admin.</p>
                                <p>Avoid the necessity for a face-to-face encounter, we provide a Chatbot service to respond to FAQs(Frequently Asked Questions) from students. Managing your appointments is a breeze with our "My Appointment" tab, allowing you to track your pending requests from the admin effortlessly. And if you ever feel lost, don't worry – our "How it works" tab provides comprehensive guidance throughout the entire system.</p></span>
                            </div>
                            <div className='aboutRight'>
                                <img src={cictlogo} alt=''></img>
                                <h2>CICT Appointment System</h2>
                                <div className="popup-container">
                                    <button className='submitAppointment' onClick={appointmentClick}>Schedule Now</button>
                                </div>
                            </div>
                        </div>
                            </div>                        </div>

                        <div ref={howitworks} className='howitworks' id='howitworks'>
                            <div className='howitworks1'>
                                <div className='steps'>
                                    <HowitWorks />
                                </div>
                                <p>How It Works</p>
                            </div>
                        </div>

                        <div ref={appointment} className='appointment' id='appointment'>
                            <span><h3>APPOINTMENT</h3> </span>
                            <button className='btnApp' onClick={togglePopup}>Schedule Now</button>
                            <div>
                                {userAppointments.length > 0 ? (
                                    <table className="table table-hover table-bordered">
                                        <thead style={{ textAlign: 'center' }}>
                                            <tr>
                                                <th >Concern</th>
                                                <th>Appointment Date</th>
                                                <th>Appointment Time</th>
                                                <th>Date Requested</th>
                                                <th>Time Requested</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userAppointments.map((appointment) => {
                                                const isAccepted = appointment.status === 'Accepted';
                                                const isDeclined = appointment.status === 'Declined';
                                                const isChecked = appointment.status === 'Pending';
                                                const statusColor = {
                                                    Accepted: 'green',
                                                    Pending: '#0dcaf0',
                                                    Declined: '#dc3545',
                                                };

                                                const textColor = statusColor[appointment.status];
                                                const longText = appointment.concern;
                                                const maxLength = 50;
                                                const concernMessage = longText.length > maxLength ? longText.slice(0, maxLength) + '...' : longText;
                                                return (
                                                    <tr key={appointment.id}>
                                                        <td style={{ width: '350px', textAlign: 'justify', overflow: 'hidden', textOverflow: 'ellipsis' }}>{concernMessage}</td>
                                                        <td style={{ textAlign: 'center' }}>{appointment.appdate}</td>
                                                        <td style={{ textAlign: 'center' }}>{appointment.apptime}</td>
                                                        <td style={{ textAlign: 'center' }}>{appointment.date}</td>
                                                        <td style={{ textAlign: 'center' }}>{appointment.time}</td>
                                                        <td style={{ textAlign: 'center', color: textColor }}>{appointment.status}</td>
                                                        <td style={{ width: '150px', textAlign: 'center' }}>
                                                            <button
                                                                disabled={isAccepted || isDeclined}
                                                                style={{
                                                                    backgroundColor: isAccepted || isDeclined ? 'lightgrey' : 'red',
                                                                    border: 'none',
                                                                    borderRadius: '5px',
                                                                    padding: '4px',
                                                                    color: 'white',
                                                                    fontWeight: '600',
                                                                }}
                                                                onClick={() => {
                                                                    cancelAppointment(appointment.id);
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                disabled={isChecked}
                                                                style={{
                                                                    backgroundColor: isChecked ? 'lightgrey' : 'red',
                                                                    border: 'none',
                                                                    borderRadius: '5px',
                                                                    padding: '4px',
                                                                    marginLeft: '12px',
                                                                    color: 'white',
                                                                    fontWeight: '600',
                                                                }}
                                                                onClick={() => {
                                                                    deleteAppointment(appointment.id, appointment);
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No appointments found.</p>
                                )}
                            </div>
                        </div>

                        <ChatbotComponent />
                    </div>
                </div>
            </div>
        )
    }
}
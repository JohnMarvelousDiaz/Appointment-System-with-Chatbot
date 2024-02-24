import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { auth } from '../firebase-config';
import { firebase } from '../firebase-config';
import { collection, doc, query, getDocs, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FaClock, FaCalendarAlt, FaUser } from 'react-icons/fa';
import './css/Schedule.css';
import emailjs from "@emailjs/browser";
import bsuLogo from '../img/bsu.png';
import adminP from '../img/user.png';

// Calendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Schedule() {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

const appointmentsCollectionRef = collection(db, "appointment");
const [selectedAppointment, setSelectedAppointment] = useState(null);
const [isPending, setPending] = useState(false);

  //Ca

  useEffect(() => {
    const getAppointment = async () => {
      const data = await getDocs(appointmentsCollectionRef);
      setAppointments(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    getAppointment();
  }, []);

  useEffect(() => emailjs.init("Ldu0id6sHYRigKfaF"), []);

  const updateStatusAccept = async (id) => {
    try {
      setPending(true);

      const statusDoc = doc(db, "appointment", id);
      const newStatus = { status: "Accepted" };
      const serviceId = "service_wvwzjts";
      const templateId = "template_81xzd1y";

      const docSnapshot = await getDocs(statusDoc);
      const appointmentData = docSnapshot.data();

      await updateDoc(statusDoc, newStatus);
      emailjs.send(serviceId, templateId, {
        name: appointmentData.name,
        recipient: appointmentData.email,
        app_status: appointmentData.status,
        date: `${appointmentData.appdate}`,
        time: `${appointmentData.apptime}`,
      });

      Swal.fire({
        title: "Appointment Request Approved",
        text: "An e-mail has been sent to inform the student about the appointment request.",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });

      setPending(false);
    } catch (error) {
      console.error("An error occurred:", error);
      setPending(false);

      Swal.fire({
        title: "Error",
        text: "An error occurred, please try again later",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
 
 
//Fetch dapat sa fullcalendar
  const handleEventRender = (arg) => {
    const view = arg.view.type;
    const appointment = arg.event.extendedProps;

    if (view === 'dayGridMonth') {
      arg.el.innerHTML = appointment.apptime;
    } else if (view === 'timeGridWeek') {
      arg.el.innerHTML = appointment.name;
    } else {
      arg.el.innerHTML = appointment.name;
    }
  };


  // const handleEventClick = (info) => {
  //   console.log(info.event.extendedProps); // Check what's in extendedProps
  //   const appointmentData = info.event.extendedProps;
  //   console.log(appointmentData); // Check appointmentData
  
  //   Swal.fire({
  //     title: 'Appointment Details',
  //     html: `
  //       <b>Name:</b> ${appointmentData.name}<br>
  //       <b>Appointment Date:</b> ${appointmentData.appdate}<br>
  //       <b>Appointment Time:</b> ${appointmentData.apptime}<br>
  //     `,
  //     icon: 'info',
  //     confirmButtonText: 'OK',
  //   });
  // };
  



  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const toggleAccountDropdown = () => {
    setIsAccountOpen(!isAccountOpen);
  };

  const adminSignOut = () => {
    try {
      document.title = 'Confirm Log Out';
      Swal.fire({
        title: 'Are you sure you want to Log Out?',
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: '<i class="fa-solid fa-check"></i> Confirm',
        confirmButtonColor: '#33B864',
        cancelButtonText: '<i class="fa-solid fa-xmark"></i> Cancel',
        cancelButtonColor: '#DC3545',
      }).then((result) => {
        if (result.isConfirmed) {
          signOut(auth)
            .then(() => {
              Swal.fire({
                title: 'Log Out Successful',
                icon: 'success',
                showConfirmButton: false,
                timer: 2000,
              }).then(() => {
                window.location.href = '/';
              });
            })
            .catch((error) => {
              console.error('An error occurred:', error);
              Swal.fire({
                title: 'An error occurred, please try again later',
                icon: 'error',
                confirmButtonText: 'OK',
              });
            });
        } else if (result.isDismissed) {
          document.title = 'CICT Appointment System';
        }
      });
    } catch (error) {
      console.error('An error occurred:', error);
      Swal.fire({
        title: 'An error occurred, please try again later',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }

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

  // Calculate the index of the first and last item on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstItem, indexOfLastItem);

  const firestore = firebase.firestore();
  const collectionRef = firestore.collection('appointment');
  const appdates = [];

  const formatDate = (appdate) => {
    const date = new Date(appdate);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getAppointments = async () => {
    try {
      const querySnapshot = await collectionRef.get();
      querySnapshot.forEach((doc) => {
        const appdate = doc.data().appdate;
        appdates.push(appdate);
      });

      const formattedAppDates = appdates.map((appdate) => formatDate(appdate));

      // Set the formatted appointments to the state
      setAppointments(formattedAppDates);
    } catch (error) {
      console.error('Error querying collection:', error);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);






  if (loggedIn && displayName === 'admin') {
    document.title = 'Schedule';

    return (
      <div>
        <div className="dashboard">
          <div className="admin-panel">
            <nav>
              <div className="s-profile">
                <img src={adminP} alt="Admin Profile" />
                <h3>Welcome Admin!</h3>
              </div>
              <br />
              <br />
              <div className="reps">
                <h3 className="menu-heading">Reports</h3>
                <ul className="menu-list">
                  <li className="s-dash">
                    <Link to="/Admin">
                      <FaUser /> Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="manage">
                <h3 className="menu-heading">Manage</h3>
                <ul className="menu-list">
                  <li className="s-sched">
                    <FaCalendarAlt /> Schedule
                  </li>
                  <li className="s-appo">
                    <Link to="/Appo">
                      <FaClock /> Appointment
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="settings">
                <h3 className="menu-heading">Settings</h3>
                <ul className="menu-list">
                <li className="s-sett">
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

          <div className="s-content">
            <div className="header">
              <div className="text-container">
                <div className="logo-text-container">
                  <div className="logo-container">
                    <img src={bsuLogo} alt="BSU LOGO" />
                  </div>
                  <h1>BulSU CICT</h1>
                  <h1 className="second-h1">Appointment System</h1>
                </div>
              </div>
              <div className="togg">
                <p>Manage &raquo; &raquo; Schedule</p>
                <div>
                </div>
              </div>
            </div>

            <div className="main">

              {/*  */}
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  start: 'today prev,next',
                  center: 'title',
                  end: 'dayGridMonth',
                }}
                events={appointments.map((formattedAppDate) => ({
                  title: 'Appointment',
                  start: formattedAppDate,
                  end: formattedAppDate,
                }))}

                eventRender={handleEventRender}
                // eventClick={handleEventClick}
                height="70vh"
                style={{ width: '60%' }}
              />



            </div>
          </div>
        </div>
        <div class="footer">
                        <p>&copy; 2023 Nosacend. All rights reserved.</p>
                    </div>
      </div>
    );
  } else if (loggedIn && displayName !== 'admin') {
    document.title = '404 Not Found';
    return (
      <div className="frontbody">
        {/* Add content for 404 Not Found */}
      </div>
    );
  } else if (!loggedIn) {
    Swal.fire({
      title: 'You need to Log In first',
      icon: 'warning',
      showConfirmButton: false,
      timer: 2000,
    }).then(() => {
      window.location.href = '/login';
    });
    return <div className="frontbody"></div>;
  }
}

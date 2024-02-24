import React, { useState, useEffect, useRef  } from 'react';
import { db } from '../firebase-config';
import { auth } from '../firebase-config';
import { collection, doc, getDocs, deleteDoc, getDoc, updateDoc, addDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FaCalendarAlt, FaUser, FaClock, FaCheck, FaTimes, FaArchive } from 'react-icons/fa';
import './css/appo_pop.css';
import $ from 'jquery';
import 'datatables.net';
import emailjs from "@emailjs/browser";
import bsuLogo from '../img/bsu.png';
import adminP from '../img/user.png';
import { firebase } from '../firebase-config';

//Print
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const MySwal = withReactContent(Swal);

export default function Appointment() {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const appointmentsCollectionRef = collection(db, "appointment");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isPending, setPending] = useState(false);

  const archivedAppointmentsCollectionRef = collection(db, "archive");

  const userNotificationCollectionRef = collection(db, "notifications");

  //search thingz
  const [originalAppointments, setOriginalAppointments] = useState([]);
  const appointmentDateInputRef = useRef(null);

    //Sorting
    const [selectedStatus, setSelectedStatus] = useState('All');
    
    //Print
    const componentRef = useRef();
    
//
const getPageNumbers = () => {
  const pageNumbers = [];
  const totalPageCount = Math.ceil(appointments.length / itemsPerPage);

  // Define the maximum number of visible page numbers
  const maxVisiblePages = 3;

  // Calculate the range of page numbers to display
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPageCount, startPage + maxVisiblePages - 1);

  // Adjust startPage and endPage if we reach the beginning or end of the page list
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return pageNumbers;
};

const handleSearch = (e) => {
  const term = e.target.value.toLowerCase();

  setSearchTerm(term);

  let filteredData = originalAppointments;

  if (selectedStatus !== 'All') {
    filteredData = filteredData.filter((appointment) => appointment.status.toLowerCase() === selectedStatus.toLowerCase());
  }

  if (term !== '') {
    filteredData = filteredData.filter((appointment) =>
      Object.values(appointment).some((value) =>
        value.toString().toLowerCase().includes(term)
      )
    );
  }

  setAppointments(filteredData);
};

const handleStatusChange = (status) => {
  setSelectedStatus(status);

  if (status === 'All') {
   
    setAppointments(originalAppointments);
  } else {
    const filteredData = originalAppointments.filter((appointment) => appointment.status.toLowerCase() === status.toLowerCase());
    setAppointments(filteredData);
  }
};

//Prinnt
const PrintButton = () => {
  const onPrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Appointment_Report',
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
    `,
  });

  return (
    <button onClick={onPrint}>Print</button>
  );
};

const generatePDF = () => {
  const doc = new jsPDF();

  // BSU Logo
  const logoWidth = 25; 
  const logoHeight = 25; 
  doc.addImage(bsuLogo, 'PNG', doc.internal.pageSize.width / 4.5 - logoWidth / 2, 10, logoWidth, logoHeight);

  const fontSize = 8;

  // Calculate the starting Y position for the text to center it
  const startY = 30 + Math.max(logoHeight, 20);
  const textY = startY + (doc.internal.pageSize.height - startY) / 2 - fontSize / 2;

  // Centertext
  doc.text('BulSU CICT Appointment System', doc.internal.pageSize.width / 2, 20, { align: 'center' });

  doc.autoTable({
    html: '#table',
    startY: startY,
    theme: 'striped',
    styles: { fontSize: fontSize },
  });


//  footer 
 const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString();
  const footerText = `Printed on ${formattedDate} at ${formattedTime}`;

  doc.text(footerText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center', fontSize: fontSize });

  doc.save('Appointment_Report.pdf');
};




      const handleTodayButtonClick = () => {
        const today = new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      
        const formattedToday = today.replace(/^([A-Z])/, (match) => match.toLowerCase());
      
        setSearchTerm(formattedToday);

        // Call handleSearch to trigger the search with the new searchTerm
        handleSearch({ target: { value: formattedToday } });
    
        // Focus on the "Appointment Date" input field
        if (appointmentDateInputRef.current) {
          appointmentDateInputRef.current.focus();
        }
      };
      

      useEffect(() => {
        const getAppointment = async () => {
          const data = await getDocs(appointmentsCollectionRef);
          const originalData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
          setAppointments(originalData);
          setOriginalAppointments(originalData); // Set original appointments here
        };
        document.title = 'Appoinments';
      
        getAppointment();
      }, []);
            

  /* DECLARATION PANG MAP SA USEEFFECT */


  useEffect(() => {
    const getAppointment = async () => {
      const data = await getDocs(appointmentsCollectionRef);
      setAppointments(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    getAppointment();
  }, []);

  

  


  //EMail
  useEffect(() => emailjs.init("Ldu0id6sHYRigKfaF"), []);

  const updateStatusAccept = async (id) => {
    try {
      setPending(true);

      const statusDoc = doc(db, "appointment", id);
      const newStatus = { status: "Accepted" };
      const serviceId = "service_wvwzjts";
      const templateId = "template_81xzd1y";

      const docSnapshot = await getDoc(statusDoc);
      const appointmentData = docSnapshot.data();


      await updateDoc(statusDoc, newStatus);
      await emailjs.send(serviceId, templateId, {
        uniqueID: statusDoc.id,
        name: appointmentData.name,
        recipient: appointmentData.email,
        app_status: appointmentData.status,
        date: `${appointmentData.appdate}`,
        time: `${appointmentData.apptime}`,
      });

      const appointmentNotif = {
        appointmentid: statusDoc.id,
        appdate: appointmentData.appdate,
        apptime: appointmentData.apptime,
        status: "Accepted",
        uid: appointmentData.uid,
        isChecked: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        
      }

      await addDoc(userNotificationCollectionRef, appointmentNotif);

      Swal.fire({
        title: "Appointment Request Approved",
        text: "An e-mail has been sent to inform the student about the appointment request.",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        window.location.reload();
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


  const updateStatusDecline = async (id) => {
    try {
      setPending(true);
  
      const statusDoc = doc(db, "appointment", id);
      const newStatus = { status: "Declined" };
      const serviceId = "service_wvwzjts";
      const templateId = "template_lfu9cdd";
  
      const docSnapshot = await getDoc(statusDoc);
      const appointmentData = docSnapshot.data();
  
      // Display a custom SweetAlert modal with a text area for the custom message
      const { value: customMessage } = await MySwal.fire({
        title: 'Message',
        input: 'textarea',
        inputPlaceholder: 'Enter your reason...',
        showCancelButton: true,
        confirmButtonText: 'Send',
      });
  
      if (customMessage) {  
        // Your logic to store the custom message in Firebase collection per user
        // ... (implement the logic to store custom message in Firebase)
  
        // Update the status and send email with the custom message
        await updateDoc(statusDoc, newStatus);
        emailjs.send(serviceId, templateId, {
          uniqueID: statusDoc.id,
          name: appointmentData.name,
          recipient: appointmentData.email,
          app_status: appointmentData.status,
          date: `${appointmentData.appdate}`,
          time: `${appointmentData.apptime}`,
          customMessage: customMessage, // Pass the custom message to the email template
        });
  
        const appointmentNotif = {
          appointmentid: statusDoc.id,
          appdate: appointmentData.appdate,
          apptime: appointmentData.apptime,
          status: "Declined",
          uid: appointmentData.uid,
          isChecked: false,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        };
  
        await addDoc(userNotificationCollectionRef, appointmentNotif);
  
        Swal.fire({
          title: "Appointment Request Declined",
          text: "An e-mail has been sent to inform the student about the appointment request.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          window.location.reload();
        });
  
        setPending(false);
      } else {
        // Handle the case where the user cancels the custom message input
        setPending(false);
      }
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

  const deleteAppointment = async (id, appointment) => {
    try {
      const archiveAppointment = {
        appointmentid: appointment.id,
        name: appointment.name,
        college: appointment.college,
        concern: appointment.concern,
        appdate: appointment.appdate,
        apptime: appointment.apptime,
        time: appointment.time,
        date: appointment.date,
        status: appointment.status,
      }

      const archiveAppointmentDoc = doc(db, "appointment", id)

      await Swal.fire({
        title: "Delete Appointment Request?",
        icon: "question",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: '<i class="fa-solid fa-check"></i> Confirm',
        cancelButtonText: '<i class="fa-solid fa-xmark"></i> Cancel',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await addDoc(archivedAppointmentsCollectionRef, archiveAppointment);
          await deleteDoc(archiveAppointmentDoc);
          Swal.fire({
            title: "Appointment Request added to Archives",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          }).then(() => {
            window.location.reload();
          });
        } else if (result.isDismissed) {

        }
      });
    } catch (error) {
      console.error("An error occurred:", error);
      Swal.fire({
        title: "Error",
        text: "An error occurred, please try again later",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

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

  // Calculate the index of the first and last item on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstItem, indexOfLastItem);

  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const isAccepted = selectedAppointment && selectedAppointment.status === 'Accepted';
  const isDeclined = selectedAppointment && selectedAppointment.status === 'Declined';
  const isChecked = selectedAppointment && selectedAppointment.status === 'Pending';
  const totalPages = Math.ceil(appointments.length / itemsPerPage);
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
                <li
                  style={{
                    backgroundColor: 'white',
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                  }}
                  className="s-sched"
                >
                  <Link to="/Schedule" style={{ color: '#333', textDecoration: 'none' }}>
                    <FaCalendarAlt style={{ marginRight: '5px' }} /> Schedule
                  </Link>
                </li>
                <li
                  style={{
                    backgroundColor: '#222',
                    color: 'white',
                    textDecoration: 'underline',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  className="s-appo"
                >
                  <Link to="/Appo" style={{ color: 'white', textDecoration: 'none', }}>
                    <FaClock/> Appointment
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
              <p>Manage &raquo; &raquo; Appointment</p>
              <div>
                <h1></h1>
                {/* Other content specific to the Schedule component */}
              </div>
            </div>
            <div className="container-appo">
              <div className="main-appo">
                <li className="arc">
                  <Link to="/Archive">
                    <FaArchive /> Archive
                  </Link>
                </li>
                <div className="appointment-container">

                  <h1>Appointments Tab</h1>
                  <div className="search">
                      <input type="text" placeholder="Search..." value={searchTerm}onChange={handleSearch} ref={appointmentDateInputRef} />
                      <button onClick={handleTodayButtonClick}>Today Appointments</button>
                      
                      <button onClick={generatePDF}>Generate PDF</button>                    
                  {/* //Sorting */}
                  <div className="dropdown-containers">
                    <label htmlFor="statusDropdown">Sort Status:</label>
                    <select
                      id="statusDropdown"
                      value={selectedStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </div>
                      </div>
                  {currentAppointments.length > 0 ? (
                    <table className="table table-bordered" id='table' >
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Course</th>
                          <th>Appointment Date</th>
                          <th>Appointment Time</th>
                          <th>Date Requested</th>
                          <th>Time Requested</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentAppointments.map((appointment) => {
                          const statusColor = {
                            Accepted: 'green',
                            Pending: '#0dcaf0',
                            Declined: '#dc3545',
                          };

                          const textColor = statusColor[appointment.status];

                          return (
                            <tr key={appointment.id}>
                              <td>{appointment.name}</td>
                              <td>{appointment.email}</td>
                              <td>{appointment.college}</td>
                              <td>{appointment.appdate}</td>
                              <td>{appointment.apptime}</td>
                              <td>{appointment.date}</td>
                              <td>{appointment.time}</td>
                              <td style={{ color: textColor }}>{appointment.status}</td>
                              <td>
                                <button
                                  className="view-button"
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                  }}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p className='nappo'>No appointments found.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="pagination">
        <ul>
          <li>
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
              {'Previous'}
            </button>
          </li>
          
          {/* Render page numbers dynamically */}
          {getPageNumbers().map((number) => (
            <li key={number}>
              <button onClick={() => paginate(number)} className={currentPage === number ? 'active' : ''}>
                {number}
              </button>
            </li>
          ))}

          <li>
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
              {'Next'}
            </button>
          </li>
        </ul>
      </div>





          </div>
        </div>
      </div>
      {selectedAppointment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9998,
          }}
        ></div>
      )}

      {selectedAppointment && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "50px",
            width: "100vh",
            border: "2px solid #000",
            boxShadow: "0 0 10px rgba(0, 0, 0, 2)",
            zIndex: 9999,
            maxWidth: "80%",
            maxHeight: "80%",
            overflow: "auto",
          }}
          className="selected-appointment-details"
        >
          <h2>Selected Appointment Details</h2>
          <br /><br />
          <div className="appointment-details">
            <div className="who">
              <h3>WHO: </h3>
            </div>
            <div className="one">
              <p><b>Name: </b>&nbsp;&nbsp;  {selectedAppointment.name}</p>
              <p><b>Email: </b>&nbsp;&nbsp; {selectedAppointment.email}</p>
              <p><b>Course: </b>&nbsp;&nbsp; {selectedAppointment.college}</p>
            </div>
          </div><br /><br />
          <div className="appointment-details">
            <div className="when">
              <h3>WHEN: </h3>
            </div>
            <div className="two">
              <p><b>Appointment Date: </b>&nbsp;&nbsp;   {selectedAppointment.appdate}</p><br /><br />
              <p><b>Appointment Time: </b> &nbsp;&nbsp;  {selectedAppointment.apptime}</p><br /><br />
              <p><b>Date Requested: </b>&nbsp;&nbsp;   {selectedAppointment.date}</p><br /><br />
              <p><b>Time Requested: </b>&nbsp;&nbsp;   {selectedAppointment.time}</p><br /><br />
            </div>
          </div>
          <div className="four">
            <p><b>Concern:</b> </p>
            <p>{selectedAppointment.concern}</p>
          </div>
          <button
            style={{
              backgroundColor: "#f00",
              color: "#fff",
              padding: "5px 10px",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => {
              setSelectedAppointment(null);
            }}
          >
            Close
          </button>
          <button
            className={`accept-button ${isAccepted || isDeclined ? 'disabled' : ''}`}
            disabled={isAccepted || isDeclined}
            onClick={() => {
              updateStatusAccept(selectedAppointment.id);
              setSelectedAppointment(null);
            }}
          >
            <FaCheck /> Accept
          </button>
          <button
            className={`decline-button ${isAccepted || isDeclined ? 'disabled' : ''}`}
            disabled={isAccepted || isDeclined}
            onClick={() => {
              updateStatusDecline(selectedAppointment.id);
              setSelectedAppointment(null);
            }}
          >
            <FaTimes /> Decline
          </button>
          <button
            className={`delete-button ${isChecked ? 'disabled' : ''}`}
            disabled={isChecked}
            onClick={() => {
              deleteAppointment(selectedAppointment.id, selectedAppointment);
              setSelectedAppointment(null);
            }}
          >
            <i className="fa fa-trash" aria-hidden='true'></i>Delete
          </button>
        </div>
      )}
                          <div class="footer">
                        <p>&copy; 2023 Nosacend. All rights reserved.</p>
                    </div>
    </div>
  );
}


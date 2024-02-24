import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { auth } from '../firebase-config';
import { collection, doc, getDocs,deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FaCalendarAlt, FaUser, FaClock, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import './css/appo_pop.css';
import emailjs from "@emailjs/browser";
import bsuLogo from '../img/bsu.png';
import adminP from '../img/user.png';

export default function Appointment() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isPending, setPending] = useState(false);

      /* DECLARATION PANG MAP SA USEEFFECT */

  const [archives, setArchives] = useState([]);
  const archivedAppointmentsCollectionRef = collection(db, "archive");


  useEffect(() => {

    const getArchive = async () => {
        const data = await getDocs(archivedAppointmentsCollectionRef);
        setArchives(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    getArchive();
  }, []);

const deletePermanently = async (id) => {
  try {
      const archiveDoc = doc(db, "archive", id)

      await Swal.fire({
          title: "Permanently Delete Appointment Request?",
          icon: "warning",
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: '<i class="fa-solid fa-check"></i> Confirm',
          cancelButtonText: '<i class="fa-solid fa-xmark"></i> Cancel',
      }).then(async(result) => {
        if (result.isConfirmed) {
          await deleteDoc(archiveDoc);
          Swal.fire({
              title: "Appointment Request has been Deleted",
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
  const currentArchives = archives.slice(indexOfFirstItem, indexOfLastItem);

  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                  <Link to="/Schedule">
                    <FaCalendarAlt /> Schedule
                  </Link>
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
              <p>Manage &raquo; &raquo; Appointment</p>
              <div>
                <h1></h1>
                {/* Other content specific to the Schedule component */}
              </div>
            </div>
            <div className="container-appo">
              <div className="main-appo">
              <li className="appoint">
                    <Link to="/Appo">
                      <FaClock /> Appointment
                    </Link>
                  </li>
                <div className="appointment-container">
                  <h1>Archives Tab</h1>
                  {archives.length > 0 ? (
                    <table className="table table-bordered">
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
                          <th>Tools</th>
                        </tr>
                      </thead>
                      <tbody>
                        {archives.map((archive) => {
                          const statusColor = {
                            Accepted: 'green',
                            Pending: '#0dcaf0',
                            Declined: '#dc3545',
                          };

                          const textColor = statusColor[archive.status];

                          return (
                            <tr key={archive.id}>
                              <td>{archive.name}</td>
                              <td>{archive.email}</td>
                              <td>{archive.college}</td>
                              <td>{archive.appdate}</td>
                              <td>{archive.apptime}</td>
                              <td>{archive.date}</td>
                              <td>{archive.time}</td>
                              <td style={{ color: textColor }}>{archive.status}</td>
                              <td>
                              <button className="trash" onClick={() => { deletePermanently(archive.id) }}> <FaTrash /> Delete</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p className='nappo'>No archive appointments found.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="pagination">
              <ul>
                {archives.map((archive, index) => {
                  if (index < 5) {
                    return (
                      <li key={index}>
                        <button onClick={() => paginate(index + 1)}>{index + 1}</button>
                      </li>
                    );
                  } else if (index === 5) {
                    return (
                      <li key={index}>
                        <button onClick={() => paginate(currentPage + 1)}>{'>>'}</button>
                      </li>
                    );
                  }
                  return null; // Don't render other page numbers
                })}
              </ul>
            </div>



          </div>
        </div>
      </div>
    </div>
  );
}

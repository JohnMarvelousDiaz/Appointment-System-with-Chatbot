import { db } from '../firebase-config';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import React from 'react'
import Swal from "sweetalert2";
import './appointment.css';
import emailjs from "@emailjs/browser";

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

export default function Appointment() {

    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newCollege, setNewCollege] = useState("");
    const [newConcern, setNewConcern] = useState("");
    const [newAppDate, setNewAppDate] = useState("");
    const [newAppTime, setNewAppTime] = useState("");
    const [newStatus, setNewStatus] = useState("Pending");
    const [currentDate, setCurrentDate] = useState(getDate());
    const [currentTime, setCurrentTime] = useState(getTime());

    /* DECLARATION PANG MAP SA USEEFFECT */
    const [appointments, setAppointments] = useState([]);

    const [archives, setArchives] = useState([]);

    const appointmentsCollectionRef = collection(db, "appointment");

    const archivedAppointmentsCollectionRef = collection(db, "archive");

    /* PANG MAP NG APPOINTMENT PARA SA ADMIN */
    useEffect(() => {

        const getAppointment = async () => {
            const data = await getDocs(appointmentsCollectionRef);
            setAppointments(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        };

        getAppointment()

    })

    useEffect(() => {

        const getArchive = async () => {
            const data = await getDocs(archivedAppointmentsCollectionRef);
            setArchives(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        };

        getArchive()

    })

    const createAppointment = async () => {

        try {
            if (!newName || !newEmail || !newCollege || !newConcern || !newAppDate || !newAppTime) {
                Swal.fire({
                    title: "All fields are required",
                    text: "Please fill up all fields. Try Again.",
                    icon: "warning",
                    showConfirmButton: false,
                    timer: 2000,
                });
                return;
            }

            const isDuplicate = appointments.some((appointment) => {
                return appointment.appdate === newAppDate && appointment.apptime === newAppTime && appointment.status === "Accepted";
            });

            const selectedDate = new Date(newAppDate);
            if (selectedDate.getDay() === 0) {
                //GAGAWIN TONG SWEET ALERT HA
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
                const newAppointment = {
                    name: newName,
                    email: newEmail,
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
                }).then((result) => {
                    if (result.isConfirmed) {
                        addDoc(appointmentsCollectionRef, newAppointment);
                        Swal.fire({
                            title: "Appointment Request Successful",
                            text: "Please wait for the confirmation e-mail sent by the Admin",
                            icon: "success",
                            showConfirmButton: false,
                            timer: 2000,
                        }).then(() => {
                            window.location.reload(true);
                        });
                    } else if (result.isDismissed) {

                    }
                });
            }
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

    useEffect(() => emailjs.init("Ldu0id6sHYRigKfaF"), []);

    /* ACCEPT APPOINTMENT */
    const updateStatusAccept = async (id) => {
        try {
            const statusDoc = doc(db, "appointment", id);
            const newStatus = { status: "Accepted" };
            const serviceId = "service_wvwzjts";
            const templateId = "template_81xzd1y";

            const docSnapshot = await getDoc(statusDoc);
            const appointmentData = docSnapshot.data();

            await Swal.fire({
                title: "Approve Appointment Request?",
                icon: "question",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: '<i class="fa-solid fa-check"></i> Confirm',
                cancelButtonText: '<i class="fa-solid fa-xmark"></i> Cancel',
            }).then((result) => {
                if (result.isConfirmed) {
                    updateDoc(statusDoc, newStatus);
                    emailjs.send(serviceId, templateId, {
                        uniqueID: statusDoc.id,
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
    /* DECLINE APPOINTMENT */
    const updateStatusDecline = async (id) => {
        try {
            const statusDoc = doc(db, "appointment", id);
            const newStatus = { status: "Declined" };
            const serviceId = "service_wvwzjts";
            const templateId = "template_lfu9cdd";

            const docSnapshot = await getDoc(statusDoc);
            const appointmentData = docSnapshot.data();
            await Swal.fire({
                title: "Decline Appointment Request?",
                icon: "question",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: '<i class="fa-solid fa-check"></i> Confirm',
                cancelButtonText: '<i class="fa-solid fa-xmark"></i> Cancel',
            }).then((result) => {
                if (result.isConfirmed) {
                    updateDoc(statusDoc, newStatus);
                    emailjs.send(serviceId, templateId, {
                        uniqueID: statusDoc.id,
                        name: appointmentData.name,
                        recipient: appointmentData.email,
                        app_status: appointmentData.status,
                        date: `${appointmentData.appdate}`,
                        time: `${appointmentData.apptime}`,
                    });
                    Swal.fire({
                        title: "Appointment Request Declined",
                        text: "An e-mail has been sent to inform the student about the appointment request.",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 2000,
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
            }).then((result) => {
                if (result.isConfirmed) {
                    deleteDoc(appointmentDoc);
                    Swal.fire({
                        title: "Appointment Request Canceled",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 2000,
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
            }).then((result) => {
                if (result.isConfirmed) {
                    addDoc(archivedAppointmentsCollectionRef, archiveAppointment);
                    deleteDoc(archiveAppointmentDoc);
                    Swal.fire({
                        title: "Appointment Request added to Archives",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 2000,
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
            }).then((result) => {
                if (result.isConfirmed) {
                    deleteDoc(archiveDoc);
                    Swal.fire({
                        title: "Appointment Request has been Deleted",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 2000,
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

    const [minDate, setMinDate] = useState('');

    useEffect(() => {
        const dtToday = new Date();
        let month = dtToday.getMonth() + 1;
        let day = dtToday.getDate();
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

    const returnHome = () => {
        let timerInterval
        Swal.fire({
            title: 'Loading...',
            icon: 'info',
            html:
                'Returning to Home Page in <strong></strong> seconds',
            timer: 3000,
            didOpen: () => {
                Swal.showLoading()
                timerInterval = setInterval(() => {
                    Swal.getHtmlContainer().querySelector('strong')
                        .textContent = (Swal.getTimerLeft() / 1000)
                            .toFixed(0)
                }, 100)
            },
            willClose: () => {
                clearInterval(timerInterval)
                window.location.href = '/';
            }
        })
    }

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

    return (
        <div className='appointment-body'>
            <div>
                <h1>APPOINTMENT APPOINTMENT, CHE</h1>
                <button onClick={returnHome}>Return Home</button><br /><br />
                <input type='hidden' value={setCurrentTime}></input>
                <input type='hidden' value={setCurrentDate}></input>
                <input type='hidden' value={setNewStatus}></input>
                <input type="text" placeholder='Name...' onChange={(event) => { setNewName(event.target.value) }}></input>
                {"  "}
                <input type="email" placeholder='Email...' onChange={(event) => { setNewEmail(event.target.value) }}></input>
                {"  "}
                <input type="text" placeholder='College...' onChange={(event) => { setNewCollege(event.target.value) }}></input>
                {"  "}
                <input type="text" placeholder='Concern...' onChange={(event) => { setNewConcern(event.target.value) }}></input>
                {"  "}
                <input type='date' min={minDate} onChange={handleAppDateChange}></input>
                {"  "}
                <select className='appointment-time' onChange={(event) => { setNewAppTime(event.target.value) }}>
                    <option hidden selected>HH:MM NN</option>
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
                <button onClick={createAppointment}>Submit Appointment</button>
            </div>

            <div className='app-arc'>

                <div className='appointment-container'>
                    <h1>Appointments Tab</h1>
                    {appointments.map((appointment) => {
                        const isAccepted = appointment.status === 'Accepted';
                        const isDeclined = appointment.status === 'Declined';
                        const isChecked = appointment.status === 'Pending';
                        return <div>
                            {" "}
                            <div className='appointment-holder'>
                                <span> Appointment ID: {appointment.id}</span><br />
                                <span> Name: </span> <span className=''> {appointment.name} </span><br />
                                <span> College: </span> <span className=''> {appointment.college} </span><br />
                                <span> Concern: </span> <span className=''> {appointment.concern} </span><br />
                                <span> Date Requested: {appointment.date} <br /> Time Requested: {appointment.time} </span><br />
                                <span> Appointment Date: </span> <span className=''> {appointment.appdate}</span><br />
                                <span> Appointment Time: </span> <span className=''> {appointment.apptime}</span><br />
                                <span> Status: </span> <span className=''> {appointment.status}</span><br />
                                <button disabled={isAccepted || isDeclined} onClick={() => { updateStatusAccept(appointment.id) }}>Accept Appointment</button>
                                <button disabled={isAccepted || isDeclined} onClick={() => { updateStatusDecline(appointment.id) }}>Decline Appointment</button><br />
                                <button disabled={isAccepted || isDeclined} onClick={() => { cancelAppointment(appointment.id) }}>Cancel Appointment</button>
                                <button disabled={isChecked} className='btnArchive' onClick={() => { deleteAppointment(appointment.id, appointment) }}>Delete Appointment<i className="fa fa-trash" aria-hidden='true'></i></button>
                            </div><br />
                        </div>
                    })}
                </div>
                <div className='archive-container'>
                    <h1>Archives Tab</h1>
                    {archives.map((archive) => {
                        return <div>
                            {" "}
                            <div className='archive-holder'>
                                <span> Appointment ID: {archive.appointmentid}</span><br />
                                <span> Name: </span> <span className=''> {archive.name} </span><br />
                                <span> College: </span> <span className=''> {archive.college} </span><br />
                                <span> Concern: </span> <span className=''> {archive.concern} </span><br />
                                <span> Date Requested: {archive.date} <br /> Time Requested: {archive.time} </span><br />
                                <span> Appointment Date: </span> <span className=''> {archive.appdate}</span><br />
                                <span> Appointment Time: </span> <span className=''> {archive.apptime}</span><br />
                                <span> Status: </span> <span className=''> {archive.status}</span><br />
                                <button onClick={() => { deletePermanently(archive.id) }}>Delete Permanently</button>
                            </div><br />
                        </div>
                    })}
                </div>
            </div>
        </div>
    )
}
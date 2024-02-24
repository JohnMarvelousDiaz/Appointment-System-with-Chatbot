/* eslint-disable no-unused-vars */
import { React, useRef, useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.css';
/* import bulsulogo from '../images/bulsulogo.jpg'; */
import cictlogo from '../images/cictlogo.png';
import bot from '../images/chatbot.png';
import './FrontPage.css';
import Swal from 'sweetalert2'
import { auth } from '../firebase-config';
import HowitWorks from '../HowitWorks/HowitWorks'
import Chatbot from '../Chatbot/ChatbotPage'

export default function FrontPage() {
    const about = useRef(null);
    const howitworks = useRef(null);
    const appointment = useRef(null);

    const aboutClick = () => {
        about.current?.scrollIntoView({ behavior: 'smooth' });
        document.title = 'About';
    };

    const howitworksClick = () => {
        howitworks.current?.scrollIntoView({ behavior: 'smooth' });
        document.title = 'How It Works';
    };


    const appointmentClick = () => {
        try {
            document.title = 'Go to Log In Page?';
            Swal.fire({
                title: "You need to Log In first",
                icon: "info",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: '<i class="fa-solid fa-check"></i> Go to Log In Page',
                confirmButtonColor: '#33B864',
                cancelButtonText: '<i class="fa-solid fa-xmark"></i> Cancel',
                cancelButtonColor: '#DC3545',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/login';
                } else if (result.isDismissed) {
                    document.title = 'CICT Appointment System';
                }
            });;
        } catch (error) {
            console.error("An error occurred:", error);
            Swal.fire({
                title: "An error occurred, please try again later",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const [loggedIn, setLoggedIn] = useState(false);
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setDisplayName(user.displayName);
                setLoggedIn(user.emailVerified);
            } else {
                setDisplayName(null);
                setLoggedIn(false);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        document.title = 'CICT Appointment System';
    }, []);

    if (!loggedIn) {

        return (

            <div className='frontbody'>
                <div className='navbar height bg-maroon'>
                    <a href="/" className="display-none">
                        <span className="navbar-margin text-white"><img src={cictlogo} alt="" className='logosize' /> <span className='text-size'>&nbsp;BulSU CICT <b>Appointment System</b></span></span>
                    </a>

                    <div className='nav-options'>
                        <button className='btnNav' onClick={aboutClick}><span className="text-white nav-margin">About</span></button>

                        <button className='btnNav' onClick={howitworksClick}><span className="text-white nav-margin">How It Works</span></button>

                        <button className='btnNav' onClick={appointmentClick}><span className="text-white nav-margin">My Appointment</span></button>

                        <a href='/login'><span className="text-white nav-margin"><button type="button" className=' btn btn-warning'>Log In/Sign Up</button></span></a>
                    </div>
                </div>

                <div className='animation'>

                    <div className='contents'>

                        <div className='paragraphfront' id='paragraphfront'>
                            <div className='aboutL'>
                            <div ref={about} className='about' id='paragraphfront'>
                            <div className='aboutLeft'>
                                <span><h3>ABOUT</h3> <p>Are you tired of the old-fashioned hassle of inquiring information with the admin? Your student life is about to get a whole lot easier with the new CICT Appointment System. We're not just any appointment system; we're your ticket to a hassle-free scheduling experience with the Admin. The CICT Appointment System is a user-friendly website where you can conveniently request an appointment meeting with the Registrar. Whether you have inquiries about enrollment, payments, or anything else, our platform streamlines the process. Additionally, in order to avoid the necessity for a face-to-face encounter, we provide a Chatbot service to respond to FAQs(Frequently Asked Questions) from students. Managing your appointments is a breeze with our "My Appointment" tab, allowing you to track your pending requests from the admin effortlessly. And if you ever feel lost, don't worry – our "How it works" tab provides comprehensive guidance throughout the entire system, ensuring a smooth experience. Say farewell to outdated administrative hassles and embrace a brighter, more efficient student life with the CICT Appointment System. Sign up now to discover a world of stress-free appointment management tailor-made for students like you.</p></span>
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

                        <div ref={appointment} className='howitworks' id='howitworks'>

                        </div>
                    </div>

                </div>
                <Chatbot/>
            </div>
        )
    } else if (loggedIn && displayName !== 'admin') {
        window.location.href = '/home'
    } else if (loggedIn && displayName === 'admin') {
        window.location.href = '/admin'
    }
}

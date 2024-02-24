import React, { useState, useEffect } from 'react'
import cictlogo from '../images/cictlogo.png';
import Swal from "sweetalert2";
import { auth } from '../firebase-config';
import { sendPasswordResetEmail } from "firebase/auth";



export default function ForgotPass() {

    const forgot = {
        height: '43vh',
        marginTop: '27vh',
    }

    const loginPage = () => {
        window.location.href = '/login'
    }

    useEffect(() => {
        document.title = 'Forgot Password';
    }, []);

    const [email, setEmail] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
    const [displayName, setDisplayName] = useState(null);

    const resetPassword = async (error) => {
        error.preventDefault();
        if (!email) {
            Swal.fire({
                title: "Enter an Email",
                icon: "warning",
                showConfirmButton: false,
                timer: 1500,
            });
        } else {
            try {
                await sendPasswordResetEmail(auth, email);
                Swal.fire({
                    title: "Password reset email sent!",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                }).then(() => {
                    window.location.href = 'login';
                });
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    Swal.fire({
                        title: 'User not found',
                        icon: 'error',
                        showConfirmButton: false,
                        timer: 1500,
                    });
                } else {
                    Swal.fire({
                        title: "Error submitting password reset email!",
                        icon: "error",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                }
            }
        }

    }

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

    if (loggedIn && displayName === 'admin') {
        Swal.fire({
            title: "Log in Successful",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
        }).then(() => {
            window.location.href = '/admin';
        });
        return (
            <div className='frontbody'>

            </div>
        )
    } else if (loggedIn && displayName !== 'admin') {
        Swal.fire({
            title: "Log in Successful",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
        }).then(() => {
            window.location.href = '/home';
        });
        return (
            <div className='frontbody'>

            </div>
        )
    } else if (!loggedIn) {
        return (
            <div className='loginbody'>

                <div className='navbar height bg-maroon'>
                    <a href="/" className="display-none">
                        <span className="navbar-margin text-white"><img src={cictlogo} alt="" className='logosize' /> <span className='text-size'>&nbsp;BulSU CICT <b>Appointment System</b></span></span>
                    </a>
                </div>

                <div className='holder'>

                    <div className='container text-white' style={forgot}>

                        <span className='float-start login-label'>Enter your Email</span><br />
                        <form onSubmit={resetPassword}>
                            <div className='input-ic-user'>
                                <input type='email' value={email} onChange={(event) => setEmail(event.target.value)} placeholder='Email' className='float-start email' ></input>
                                <i className="fa fa-user"></i>
                            </div>

                            <button type='submit' className='btn btn-primary btnLogin'>Submit &nbsp; <span><i class="fa fa-arrow-right"></i></span></button>
                        </form>

                        <button className='create-account-link' onClick={loginPage}><span>Go back to Log In Page</span></button><br />

                    </div>
                </div>

            </div>
        )
    }
}
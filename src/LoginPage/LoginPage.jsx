import { React, useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.css';
import './LoginPage.css';
import cictLogo from '../images/cictlogo.png';
import Swal from "sweetalert2";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from '../firebase-config';

export default function LoginPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
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

    const signIn = async (event) => {
        event.preventDefault();
        if (!email || !password) {
            Swal.fire({
                title: "E-mail and Password must be completed",
                icon: "warning",
                showConfirmButton: false,
                timer: 1500,
            });
        } else {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                if (!userCredential.user.emailVerified) {
                  Swal.fire({
                    title: 'Email not verified',
                    text: 'Please verify your email before logging in.',
                    icon: 'warning',
                    showConfirmButton: false,
                    timer: 1500,
                  });
        
                  const resendVerificationEmail = async () => {
                    try {
                      await sendEmailVerification(auth.currentUser);
                      Swal.fire({
                        title: 'Verification Email Sent',
                        text: 'A verification email has been sent to your email address.',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                      });
                    } catch (error) {
                      console.error('Error sending verification email:', error);
                      Swal.fire({
                        title: 'An error occurred while sending the verification email',
                        icon: 'error',
                        confirmButtonText: 'OK',
                      });
                    }
                  };
        
                  Swal.fire({
                    title: 'Resend Verification Email?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No',
                  }).then((result) => {
                    if (result.isConfirmed) {
                      resendVerificationEmail();
                    }
                  });
                } else {
                  Swal.fire({
                    title: 'Log In Successful',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                  }).then(() => {
                    window.location.href = '/';
                  });
                }
              } catch (error) {
                console.log(error);
                if (error.code === 'auth/user-not-found') {
                  Swal.fire({
                    title: 'User not found',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                  });
                } else if (error.code === 'auth/invalid-login-credentials') {
                  Swal.fire({
                    title: 'Wrong Log In Credentials',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                  });
                } else if (error.code === 'auth/too-many-requests') {
                  console.error('An error occurred while logging in:', error);
                  Swal.fire({
                    title: 'Too many failed attempts, please try again later',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                  });
                } else if (error.code === 'auth/user-disabled'){
                  console.error('An error occurred while logging in:', error);
                  Swal.fire({
                    title: 'Account Disabled',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                  });
                }
              }
        }
    }

    const registerPage = () => {
        window.location.href = '/register'
    }
    useEffect(() => {
        document.title = 'Log In';
    }, []);

    if (loggedIn && displayName === 'admin'){
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
              <span className="navbar-margin text-white">
                <img src={cictLogo} alt="" className='logosize' />
                <span className='text-size'>&nbsp;BulSU CICT <b>Appointment System</b></span>
              </span>
            </a>
          </div>
    
          <div className='holder'>
    
            <div className='container text-white'>
    
              <span className='float-start login-label'>Log In to your account</span><br />
              <form onSubmit={signIn}>
                <div className='input-ic-user'>
                  <input type='email' value={email} onChange={(event) => setEmail(event.target.value)} placeholder='E-mail' className='float-start email' ></input>
                </div>
    
                <div className='input-ic-pass'>
                  <input type='password' value={password} onChange={(event) => setPassword(event.target.value)} placeholder='Password' className='float-start'></input>
                </div>
    
                <button type='submit' className='btn btn-primary btnLogin'>Log In &nbsp; <i className="fa fa-arrow-right right"></i></button>
              </form>
    
              <span className='create-account'>Don't have an account yet ?</span><br />
              <button className='create-account-link' onClick={registerPage}><span>Create an account</span></button><br />
              <a href='reset-password'><span className='forgot-pass'>Forgot Password?</span><br /></a>
            </div>
          </div>
        </div>
        )
    }
}

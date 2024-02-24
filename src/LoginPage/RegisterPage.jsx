import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './LoginPage.css';
import cictlogo from '../images/cictlogo.png';
import Swal from 'sweetalert2';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '../firebase-config';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState(''); 
  const [displayName, setDisplayName] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedIn(user.emailVerified);
      } else {
        setLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const register = async (event) => {
    event.preventDefault();

    if (displayName.toLowerCase() === 'admin') {
        Swal.fire({
          title: "Display Name 'admin' is not allowed.",
          icon: 'warning',
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }
    
      if (!email || !password || !displayName || !passwordConfirmation) {
        Swal.fire({
          title: 'E-mail, Password, Display Name, and Password Confirmation must be completed',
          icon: 'warning',
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }
    
      if (password !== passwordConfirmation) {
        Swal.fire({
          title: 'Password and Confirm Password must match',
          icon: 'warning',
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }
    
      // Check if the email matches the allowed domain
      if (!email.endsWith('@bulsu.edu.ph')) {
        Swal.fire({
          title: 'Only BULSU email are allowed to register',
          icon: 'warning',
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }
    
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
        await updateProfile(userCredential.user, { displayName });
    
        await sendEmailVerification(userCredential.user);
    
        Swal.fire({
          title: 'Account Registration Successful',
          text: 'A verification email has been sent to your email address. Please verify your account before logging in.',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          willClose: () => {
            window.location.href = '/login';
          },
        });
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          Swal.fire({
            title: 'Email already in use',
            icon: 'warning',
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          Swal.fire({
            title: 'Unknown error occurred',
            icon: 'warning',
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    }

  const loginPage = () => {
    window.location.href = '/login'
  }

  useEffect(() => {
    document.title = 'Create Account';
  }, []);

  if (loggedIn && displayName !== 'admin') {
    Swal.fire({
      title: 'An account is currently Signed In',
      icon: 'info',
      showConfirmButton: false,
      timer: 1500,
    }).then(() => {
      window.location.href = '/home';
    });
    return (
      <div className='frontbody'></div>
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
          <div className='container text-white'>
            <span className='float-start register-label'>Create an account</span><br />
            <form onSubmit={register}>
              <div className='input-ic-user'>
                <input type='text' value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder='Name' className='float-start'></input>
              </div>
              <div className='input-ic-user'>
                <input type='email' value={email} onChange={(event) => setEmail(event.target.value)} placeholder='E-mail' className='float-start email' ></input>
              </div>
              <div className='input-ic-pass'>
                <input type='password' value={password} onChange={(event) => setPassword(event.target.value)} placeholder='Password' className='float-start'></input>
              </div>
              <div className='input-ic-pass'>
                <input type='password' value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder='Confirm Password' className='float-start'></input>
              </div>
              <button type='submit' className='btn btn-primary btnRegister'>Register</button>
            </form>
            <span className='create-account'>Already have an account?</span><br />
            <button className='create-account-link' onClick={loginPage}><span>Log In Here</span></button><br />
          </div>
        </div>
      </div>
    );
  }
}

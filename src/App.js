import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FrontPage from './FrontPage/FrontPage';
import LoginPage from './LoginPage/LoginPage'
import RegisterPage from './LoginPage/RegisterPage'
import ForgotPass from './LoginPage/ForgotPass'
import HomePage from './HomePage/HomePage'
import Appo from './Appo/Appointment'
import Dashboard from './Dashboard/Dashboard'
import Schedule from './Schedule/Schedule'
import Archive from './Archive/Archive'
import Appointment from './Appointment/Appointment';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={< FrontPage />} />
          <Route path='/login' element={< LoginPage />} />
          <Route path='/register' element={< RegisterPage />} />
          <Route path='/home' element={< HomePage />} />
          <Route path='/appo' element={< Appo />} />
          <Route path='/archive' element={< Archive />} />
          <Route path='/admin' element={< Dashboard />} />
          <Route path='/schedule' element={< Schedule />} />
          <Route path='/reset-password' element={< ForgotPass />} />
          <Route path='/appointment' element={< Appointment />} />
        </Routes>
      </Router>

    </div>
  );
}

export default App;

import React, { useState } from 'react';
import chatbotlogo from '../images/chatbot_logo.png';
import bookAppointmentlogo from '../images/book_appointment.png';
import checkschedulelogo from '../images/check_schedules.png';
import Modal from 'react-bootstrap/Modal';
import './HowitWorks.css'
import FirstSlideShow from './FirstSlideShow';
import SecondSlideShow from './SecondSlideShow';
import ThirdSlideShow from './ThirdSlideShow';

export default function HowitWorks() {
    const [showModalBookAppointment, setShowModalBookAppointment] = useState(false);
    const [showModalCheckSchedules, setShowModalCheckSchedules] = useState(false);
    const [showModalChatbotSystem, setShowModalChatbotSystem] = useState(false);

    const handleShowModal = (modalName) => {
        switch (modalName) {
            case 'bookAppointment':
                setShowModalBookAppointment(true);
                break;
            case 'checkSchedules':
                setShowModalCheckSchedules(true);
                break;
            case 'chatbotSystem':
                setShowModalChatbotSystem(true);
                break;
            default:
                break;
        }
    };

    const handleCloseModal = (modalName) => {
        switch (modalName) {
            case 'bookAppointment':
                setShowModalBookAppointment(false);
                break;
            case 'checkSchedules':
                setShowModalCheckSchedules(false);
                break;
            case 'chatbotSystem':
                setShowModalChatbotSystem(false);
                break;
            default:
                break;
        }
    };

    return (
        <div>
            <div className='row'>
                <div className='col-sm-4'>
                    <br/><br/>
                    <img src={bookAppointmentlogo} alt="bookappointment-logo" className='balogosize' />
                    <br/><br/><br/>
                    <h1>Book Appointment</h1>
                    <br />
                    <button className='chatbot-button' onClick={() => handleShowModal('bookAppointment')}>
                        Learn More
                    </button>

                    <Modal show={showModalBookAppointment} onHide={() => handleCloseModal('bookAppointment')}>
                        <Modal.Header closeButton>
                            <Modal.Title>Book Appointment</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <FirstSlideShow />
                        </Modal.Body>
                    </Modal>
                </div>
                <div className='col-sm-4 scheds'>
                    <br/><br/>
                    <img src={checkschedulelogo} alt="checkschedules-logo" className='cslogosize' />
                    <br/><br/><br/>
                    <h1>Check Schedules</h1>
                    <br/>
                    <button className='chatbot-button' onClick={() => handleShowModal('checkSchedules')}>
                        Learn More
                    </button>

                    <Modal show={showModalCheckSchedules} onHide={() => handleCloseModal('checkSchedules')}>
                        <Modal.Header closeButton>
                            <Modal.Title>Check Schedules</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <SecondSlideShow />
                        </Modal.Body>
                    </Modal>
                </div>
                <div className='col-sm-4'>
                    <br/>
                    <img src={chatbotlogo} alt="chatbot-logo" className='clogosize' />
                    <br/><br/>
                    <h1>Chatbot System</h1>
                    <br />
                    <button className='chatbot-button' onClick={() => handleShowModal('chatbotSystem')}>
                        Learn More
                    </button>

                    <Modal show={showModalChatbotSystem} onHide={() => handleCloseModal('chatbotSystem')}>
                        <Modal.Header closeButton>
                            <Modal.Title>Chatbot System</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <ThirdSlideShow />
                        </Modal.Body>
                    </Modal>
                </div>
            </div>
        </div>
    );
}

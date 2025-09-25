import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const AlertToast = ({ show, message, variant, onClose }) => {
    return (
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
            <Toast
                onClose={onClose}
                show={show}
                delay={4000}
                autohide
                bg={variant}
                className="text-white"
            >
                <Toast.Body>{message}</Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default AlertToast;
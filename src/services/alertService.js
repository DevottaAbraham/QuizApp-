import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

/**
 * A centralized alert service using SweetAlert2.
 */
const alertService = {
    /**
     * Shows a success alert.
     * @param {string} title - The title of the alert.
     * @param {string} text - The text content of the alert.
     */
    success: (title, text = '') => {
        MySwal.fire({
            title,
            text,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
        });
    },

    /**
     * Shows an error alert.
     * @param {string} title - The title of the alert.
     * @param {string} text - The text content of the alert.
     */
    error: (title, text = '') => {
        MySwal.fire({
            title,
            text,
            icon: 'error',
        });
    },
};

export default alertService;
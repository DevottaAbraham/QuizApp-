import React from 'react';
import ReactDOM from 'react-dom/client';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { history } from './services/apiServices';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Use HistoryRouter to enable navigation from outside React components */}
    <HistoryRouter history={history} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HistoryRouter>
  </React.StrictMode>
);
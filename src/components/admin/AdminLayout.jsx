import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, NavDropdown, Form } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import AdminLogin from './AdminLogin';
import Dashboard from './Dashboard';
import ManageQuestions from './ManageQuestions';
import UserManagement from './UserManagement';
import ManageNotices from './ManageNotices';
import PublishQueue from './PublishQueue';
import QuestionHistory from './QuestionHistory';
import AppearanceSettings from './AppearanceSettings';
import ManageAdmins from './ManageAdmins';
import Leaderboard from './Leaderboard';
import { useTheme } from '../../hooks/useTheme';

// This would be a custom hook to manage admin authentication state
const useAdminAuth = () => {
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem("currentAdmin");
    if (!savedAdmin) return null;
    try {
      return JSON.parse(savedAdmin);
    } catch (error) {
      console.error("Failed to parse admin data from localStorage, clearing it.", error);
      localStorage.removeItem("currentAdmin");
      return null;
    }
  });
  const navigate = useNavigate();
    const location = useLocation();

  const login = (adminObject) => {
    setCurrentAdmin(adminObject);
    localStorage.setItem("currentAdmin", JSON.stringify(adminObject));
    navigate('/admin/dashboard');
  };

  const logout = () => {
    localStorage.removeItem("currentAdmin");
    setCurrentAdmin(null);
    navigate('/admin');
  };

  useEffect(() => {
    // If the user is not logged in, ensure they are on the login page.
    if (!currentAdmin && location.pathname !== '/admin/login') {
      navigate('/admin/login', { replace: true });
    }
  }, [currentAdmin, navigate, location.pathname]);

  return { currentAdmin, login, logout };
};

const AdminLayout = () => {
  const { currentAdmin, login, logout } = useAdminAuth();
  const [expanded, setExpanded] = useState(false);
  const { theme, toggleTheme } = useTheme();

    // The main layout now handles routing. If not logged in, it shows the login route.
    // If logged in, it shows the protected routes. This avoids rendering the whole layout just for the login page.
  if (!currentAdmin) {
    return (
      <Routes>
        <Route path="/login" element={<AdminLogin onLogin={login} />} />
      </Routes>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Navbar bg="dark" variant="dark" expand="lg" className="sticky-top shadow" expanded={expanded}>
        <Container fluid>
          <Navbar.Brand as={Link} to="/admin/dashboard">Admin Panel</Navbar.Brand>
          <Navbar.Toggle aria-controls="adminNavbar" onClick={() => setExpanded((prev) => !prev)} />
          <Navbar.Collapse id="adminNavbar">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/admin/dashboard" onClick={() => setExpanded(false)}><i className="bi bi-grid-1x2-fill me-1"></i>Dashboard</Nav.Link>
              <NavDropdown title={<><i className="bi bi-journal-text me-1"></i>Questions</>} id="questions-dropdown">
                <NavDropdown.Item as={Link} to="/admin/questions" onClick={() => setExpanded(false)}>Add/Edit Questions</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/publish" onClick={() => setExpanded(false)}>Publish Queue</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/history" onClick={() => setExpanded(false)}>Question History</NavDropdown.Item>
              </NavDropdown>
              {currentAdmin?.role === 'main' && (
                <Nav.Link as={Link} to="/admin/manage-admins" onClick={() => setExpanded(false)}><i className="bi bi-person-badge-fill me-1"></i>Manage Admins</Nav.Link>
              )}
              <Nav.Link as={Link} to="/admin/users" onClick={() => setExpanded(false)}><i className="bi bi-person-gear me-1"></i>Users</Nav.Link>
              <Nav.Link as={Link} to="/admin/notices" onClick={() => setExpanded(false)}><i className="bi bi-clipboard-data-fill me-1"></i>Notices</Nav.Link>
              <Nav.Link as={Link} to="/admin/appearance" onClick={() => setExpanded(false)}><i className="bi bi-palette-fill me-1"></i>Appearance</Nav.Link>
              <NavDropdown title={<><i className="bi bi-tools me-1"></i> More</>} id="admin-more-dropdown">
                <NavDropdown.Item as={Link} to="/admin/leaderboard" onClick={() => setExpanded(false)}><i className="bi bi-trophy-fill me-2"></i>Leaderboard</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/scores" onClick={() => setExpanded(false)}><i className="bi bi-card-checklist me-2"></i>View Scores</NavDropdown.Item>
                {/* Add other dropdown items here */}
              </NavDropdown>
            </Nav>
            <div className="d-flex align-items-center">
              <Navbar.Text className="me-3">
                Welcome, {currentAdmin.email}
              </Navbar.Text>
              <Form.Check
                type="switch"
                id="theme-switch-admin"
                label={theme === 'light' ? <i className="bi bi-brightness-high-fill"></i> : <i className="bi bi-moon-stars-fill"></i>}
                checked={theme === 'dark'}
                onChange={toggleTheme}
                className="text-white me-3"
              />
              <Button variant="outline-light" size="sm" onClick={logout}>
                <i className="bi bi-shield-slash-fill me-1"></i>Logout
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="container mt-4">
                <Routes>
          <Route index element={<Dashboard />} /> {/* "index" handles both /admin and /admin/dashboard */}
          <Route path="questions" element={<ManageQuestions />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="notices" element={<ManageNotices />} />
          <Route path="appearance" element={<AppearanceSettings />} />
          {/* Redirect from base /admin to dashboard if logged in */}
          {currentAdmin?.role === 'main' && <Route path="manage-admins" element={<ManageAdmins />} />}
          <Route path="publish" element={<PublishQueue />} />
          <Route path="history" element={<QuestionHistory />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          {/* Add other admin routes here */}
        </Routes>
      </main>
    </>
  );
};

export default AdminLayout;

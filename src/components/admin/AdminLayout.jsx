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
import ActiveUser from './ActiveUser';
import ViewScores from './ViewScores';
import { useTheme } from '../../hooks/useTheme';

/**
 * Renders the main application layout for a logged-in admin.
 * This component is wrapped in Routes and can safely use router hooks.
 */
const AdminApp = ({ currentAdmin, onLogout }) => {
  const [expanded, setExpanded] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/admin/login'); // Ensure redirection after logout
  };
  
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
                <NavDropdown.Item as={Link} to="/admin/scores" onClick={() => setExpanded(false)}><i className="bi bi-clipboard2-pulse-fill me-2"></i>View Scores</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/activeUser" onClick={() => setExpanded(false)}><i className="bi bi-card-checklist me-2"></i>Active User</NavDropdown.Item>
                {/* Add other dropdown items here */}
              </NavDropdown>
            </Nav>
            <div className="d-flex align-items-center mt-2 mt-lg-0">
              <Navbar.Text className="me-3 d-none d-lg-block">
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
              <Button variant="outline-light" size="sm" onClick={handleLogout} className="ms-lg-2">
                <i className="bi bi-shield-slash-fill me-1"></i>Logout
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="container-fluid mt-4">
                <Routes>
          <Route index element={<Dashboard />} /> {/* "index" handles both /admin and /admin/dashboard */}
          <Route path="dashboard" element={<Dashboard />} /> {/* Add explicit route for dashboard */}
          <Route path="questions" element={<ManageQuestions />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="notices" element={<ManageNotices />} />
          <Route path="appearance" element={<AppearanceSettings />} />
          {/* Redirect from base /admin to dashboard if logged in */}
          {currentAdmin?.role === 'main' && <Route path="manage-admins" element={<ManageAdmins />} />}
          <Route path="publish" element={<PublishQueue />} />
          <Route path="history" element={<QuestionHistory />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="scores" element={<ViewScores />} />
          <Route path="activeUser" element={<ActiveUser />} />
          {/* Add other admin routes here */}
        </Routes>
      </main>
    </>
  );
};

/**
 * Main layout component for the admin section.
 * It handles the routing logic for authenticated vs. unauthenticated states.
 */
const AdminLayout = () => {
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

  const login = (adminObject) => {
    setCurrentAdmin(adminObject);
    localStorage.setItem("currentAdmin", JSON.stringify(adminObject));
    // Navigation will be handled by the login component
  };

  const logout = () => {
    localStorage.removeItem("currentAdmin");
    setCurrentAdmin(null);
  };

  return (
    <Routes>
      {!currentAdmin ? (
        <>
          <Route path="login" element={<AdminLogin onLogin={login} />} />
      
        </>
      ) : (
        <Route path="*" element={<AdminApp currentAdmin={currentAdmin} onLogout={logout} />} />
      )}
    </Routes>
  );
};

export default AdminLayout;

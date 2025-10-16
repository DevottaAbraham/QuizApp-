import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Navbar, Nav, Container, Button, NavDropdown, Form } from 'react-bootstrap';
import { AdminContext } from './AdminContext';
/**
 * Renders the main application layout for a logged-in admin.
 * This component is wrapped in Routes and can safely use router hooks.
 */
const AdminLayout = ({ currentAdmin, onLogout, theme, toggleTheme }) => {
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    onLogout();
  };
  
  return (
    <AdminContext.Provider value={{ currentAdmin }}>
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
              {/* Only show the Manage Admins link if the logged-in admin is the main 'admin' user */}
              {currentAdmin?.username === 'admin' && <Nav.Link as={Link} to="/admin/manage-admins" onClick={() => setExpanded(false)}><i className="bi bi-person-badge-fill me-1"></i>Manage Admins</Nav.Link>}
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
            <Nav className="ms-auto align-items-center">
              <Navbar.Text className="my-2 my-lg-0 me-lg-3">
                Welcome, <span className="fw-bold">{currentAdmin?.username}</span>
              </Navbar.Text>
              <Form.Check
                  type="switch"
                  id="admin-theme-switch"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  label={theme === 'light' ? <i className="bi bi-brightness-high-fill fs-5"></i> : <i className="bi bi-moon-stars-fill fs-5"></i>}
                  className="d-flex align-items-center my-2 my-lg-0 mx-lg-3"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              />
              <Button variant="outline-light" onClick={handleLogout} className="my-2 my-lg-0">
                <i className="bi bi-shield-slash-fill me-1"></i> Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="container-fluid mt-4">
        <Outlet context={{ currentAdmin }} />
      </main>
    </AdminContext.Provider>
  );
};

export default AdminLayout;

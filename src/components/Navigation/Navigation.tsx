import React from 'react';
import './Navigation.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

function Navigation({ children, home, visible }): React.ReactElement {
  return (
    <div className="h-100 w-100 container-fluid p-0">
      <Navbar bg={visible ? 'dark' : undefined} collapseOnSelect expand="lg" fixed={home ? 'top' : undefined} variant="dark">
        <LinkContainer to="/">
          <Navbar.Brand>Gruh</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <LinkContainer to="/upload">
              <Nav.Link>Upload</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/merchandise">
              <Nav.Link>Merch</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/about">
              <Nav.Link>About</Nav.Link>
            </LinkContainer>
          </Nav>
          <Nav>
            <LinkContainer to="/login">
              <Nav.Link className="mr-2">Log In</Nav.Link>
            </LinkContainer>
            <LinkContainer
              to="/signup"
              activeStyle={{}}
              isActive={() => false}
            >
              <Button variant={home ? 'outline-light' : 'outline-dark'} className="d-flex align-items-center justify-content-center">Sign Up</Button>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div className="content-wrapper p-0 m-0">{children}</div>
    </div>
  );
}

export default Navigation;

import React from "react";
import { Nav, Navbar } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./MyNav.scss";

export default class MyNav extends React.Component {
    render() {
        return (
            <div>
                <Navbar bg="primary" variant="dark">
                    <Navbar.Brand as={NavLink} to="/">Solid Accountant</Navbar.Brand>
                    <Nav className="mr-auto">
                        <NavLink to="/wallet" className="nav-link">Wallet</NavLink>
                        <NavLink to="/about" className="nav-link">About</NavLink>
                    </Nav>
                </Navbar>
            </div>
        )
    }

}
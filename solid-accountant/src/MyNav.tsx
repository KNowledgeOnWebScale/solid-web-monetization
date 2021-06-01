import React from "react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, useHistory } from "react-router-dom";
import { LogoutButton, useSession } from "@inrupt/solid-ui-react";
import "./MyNav.scss";

export default function MyNav() {
    const { session } = useSession();
    const history = useHistory();
    const onLogout = () => history.go(0);
    const renderAuthBtn = (session: any) => {
        if (!session.info.isLoggedIn) {
            return (
                <Button variant="outline-light" as={NavLink} to="/auth">Log in</Button>
            )
        } else {
            return (
                <LogoutButton onLogout={onLogout}>
                    <Button variant="outline-light">Log Out</Button>
                </LogoutButton>
            )
        }
    };
    return (
        <div>
            <Navbar bg="primary" variant="dark">
                <Container fluid="lg">
                    <Navbar.Brand as={NavLink} to="/">Solid Accountant</Navbar.Brand>
                    <Nav className="mr-auto">
                        <NavLink to="/wallet" className="nav-link">Wallet</NavLink>
                        <NavLink to="/about" className="nav-link">About</NavLink>
                    </Nav>
                    {renderAuthBtn(session)}
                </Container>
            </Navbar>
        </div>
    )
}
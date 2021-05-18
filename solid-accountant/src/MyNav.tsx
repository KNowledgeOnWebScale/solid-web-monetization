import React from "react";
import { Button, Nav, Navbar } from "react-bootstrap";
import { NavLink, useHistory } from "react-router-dom";
import { LoginButton, LogoutButton, useSession } from "@inrupt/solid-ui-react";
import "./MyNav.scss";

export default function MyNav() {
    const { session } = useSession();
    const history = useHistory();
    const onLogout = () => history.go(0);
    const renderAuthBtn = (session: any) => {
        const onError = (err: Error) => console.log(err);
        const oidcIssuer = 'https://inrupt.net';
        if (!session.info.isLoggedIn) {
            return (
                <LoginButton
                    oidcIssuer={oidcIssuer}
                    redirectUrl={window.location.href}
                    onError={onError}
                >
                    <Button variant="outline-light">Log In</Button>
                </LoginButton>
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
                <Navbar.Brand as={NavLink} to="/">Solid Accountant</Navbar.Brand>
                <Nav className="mr-auto">
                    <NavLink to="/wallet" className="nav-link">Wallet</NavLink>
                    <NavLink to="/about" className="nav-link">About</NavLink>
                </Nav>
                {renderAuthBtn(session)}
            </Navbar>
        </div>
    )
}
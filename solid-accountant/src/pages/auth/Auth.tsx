import React, { ReactElement } from "react";
import { Col, Container, Row } from "react-bootstrap";
import AuthProvider, { AuthProviderProps } from "../../components/AuthProvider";

import "./Auth.scss";

import inruptLogo from './logos/inrupt.png'
import solidLogo from './logos/solid.svg'

const providers: AuthProviderProps[] = [
    {
        url: 'https://inrupt.net',
        imgUrl: inruptLogo,
        label: 'inrupt.net'
    },
    {
        url: 'https://solidcommunity.net/',
        imgUrl: solidLogo,
        label: 'solidcommunity.net'
    }
]

export default function Auth(): ReactElement {

    return (
        <Container fluid="lg">
            <Row className="pt-3">
                <Col>
                    <h5>Log in</h5>
                    <div className="description">Select an auth provider to log in</div>
                </Col>
            </Row>
            <Row className="pt-2">
                <Col>
                    <div className="providers">
                        {providers.map(p => {
                            return <AuthProvider {...p} />
                        })}
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
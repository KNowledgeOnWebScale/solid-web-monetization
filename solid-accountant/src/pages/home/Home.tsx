import React from "react";
import { Col, Container, Row } from "react-bootstrap";

import "./Home.scss";


export class Home extends React.Component {

    render() {
        return (
            <Container fluid="lg">
                <Row className="pt-3">
                    <Col>
                        <h5>Solid Accountant</h5>
                        <div className="description">Welcome to the Solid Accountant app. This application will allow you to easily assign and remove wallets to your WebID profile.</div>
                    </Col>
                </Row>
            </Container>
        );
    }
}
import React from "react";
import { Col, Container, Row } from "react-bootstrap";

import "./Wallet.scss";


export class Wallet extends React.Component {

    render() {
        return (
            <Container fluid>
                <Row className="pt-3">
                    <Col>
                        <h5>Wallet configuration</h5>
                        <div>TODO: configure your payment pointer</div>
                    </Col>
                </Row>
            </Container>
        );
    }
}
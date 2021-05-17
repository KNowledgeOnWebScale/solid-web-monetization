import React from "react";
import { Col, Container, Row } from "react-bootstrap";

import "./About.scss";

export class About extends React.Component {

    render() {
        return (
            <Container fluid>
                <Row className="pt-3">
                    <Col>
                        <h5>About us</h5>
                        <div>We are a research team of IDLab, UGent, affiliated with imec.</div>
                    </Col>
                </Row>
            </Container>
        );
    }
}
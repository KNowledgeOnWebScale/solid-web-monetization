import React from "react";
import { Col, Container, Row } from "react-bootstrap";

import "./about.component.scss";

export const About: React.FC = () => {

    return (
        <Container fluid="lg">
            <Row className="pt-3">
                <Col>
                    <h5>About us</h5>
                    <div>We are a research team of IDLab, UGent, affiliated with imec.</div>
                </Col>
            </Row>
        </Container>
    );

}
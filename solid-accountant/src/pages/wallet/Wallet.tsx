import React, { ReactElement } from "react";
import { useSession, useDataset, } from "@inrupt/solid-ui-react";
import { Col, Container, Row } from "react-bootstrap";

import "./Wallet.scss";
import Profile from "../../components/Profile";


function FetchProfile(session: any) {
    const datasetUri = session?.info?.webId;
    console.log(datasetUri);
    const { dataset, error } = useDataset(datasetUri);
    if (error) return <div>Failed to load profile</div>;
    if (!dataset) return <div>loading...</div>;
    return <Profile profileDataset={dataset} />;
}

export default function Wallet(): ReactElement {
    const { session } = useSession();

    const WalletInfo = () => {
        if (!session.info.isLoggedIn) {
            return (
                <Col>
                    <div>Log in to view your profile...</div>
                </Col>
            )
        } else {
            return (
                <Col>
                    {FetchProfile(session)}
                </Col>
            )
        }
    }

    return (
        <Container fluid>
            <Row className="pt-3">
                <Col>
                    <h5>Profile</h5>
                </Col>
            </Row>
            <Row className="pt-2">
                {WalletInfo()}
            </Row>
        </Container>
    );
}

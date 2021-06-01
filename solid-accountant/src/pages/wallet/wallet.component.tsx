import React from "react";
import { useSession, useDataset, } from "@inrupt/solid-ui-react";
import { Col, Container, Row } from "react-bootstrap";
import { Profile } from "../../components/profile/profile.component";

import "./wallet.component.scss";


export const Wallet: React.FC = () => {
    const { session } = useSession();
    const datasetUri = session?.info?.webId;
    const { dataset, error } = useDataset(datasetUri);

    const FetchProfile = () => {
        if (error) return <div>Failed to load profile</div>;
        if (!dataset) return <div>loading...</div>;
        return <Profile profileDataset={dataset} />;
    }

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
                    {FetchProfile()}
                </Col>
            )
        }
    }

    return (
        <Container fluid="lg">
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

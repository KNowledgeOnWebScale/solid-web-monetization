import { getNamedNodeAll, getSolidDataset, getStringNoLocale, getThing, SolidDataset, ThingPersisted } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { FOAF } from "@inrupt/vocab-common-rdf";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import { Profile } from "../../components/profile/profile.component";
import "./wallet.component.scss";


type Inputs = {
    paymentPointer: string;
};

export const Wallet: React.FC = () => {
    const { session, sessionRequestInProgress } = useSession();
    const paymentPointersProp = 'http://paymentpointers.org/ns#hasPaymentPointer';

    const [me, setMe] = useState<ThingPersisted | null>(null);
    const [dataset, setDataset] = useState<SolidDataset | null>(null);
    const [paymentPointers, setPaymentPointers] = useState<any>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = data => console.log(data);

    useEffect(() => {
        const getPaymentPointers = (me: ThingPersisted) => {
            const nodes = getNamedNodeAll(me!, paymentPointersProp);
            setPaymentPointers(nodes);
        }
        const fetchThing = async () => {
            const webId = session?.info?.webId;
            if (webId) {
                const ds = await getSolidDataset(webId as string);
                setDataset(ds);
            }
            if (dataset) {
                const profile = await getThing(dataset!, webId as string);
                setMe(profile);
            }
            if (me) {
                getPaymentPointers(me!);
            }
        }

        fetchThing();
    }, [session, dataset, me]);

    const addNewPaymentPointer = () => {
        if (paymentPointers?.length === 0) {
            return (
                <div>
                    <h6>Add a new payment pointer</h6>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group>
                            <Form.Label>Payment pointer</Form.Label>
                            <Row>
                                <Col className="col">
                                    <Form.Control type="text" placeholder="$pay.me.com" {...register("paymentPointer", { required: true })} />
                                </Col>
                                <Col className="col-auto">
                                    <Button type="submit" variant="primary">Add</Button>
                                </Col>
                            </Row>
                            {errors?.paymentPointer ? <Form.Text className="text-danger">This field is required</Form.Text> : <Form.Text className="text-muted">Please use $ syntax</Form.Text>}
                        </Form.Group>
                    </Form>
                </div>
            );
        }
    }

    function Page() {
        if (sessionRequestInProgress) return "Loading...";
        return (
            <div>
                <p>Hello {!me ? '?' : getStringNoLocale(me, FOAF.name)};</p>
                <p>These are you currently found payment pointers:</p>
                <ul>
                    {paymentPointers?.map((e: any) => <li><em>{JSON.stringify(e)}</em></li>)}
                </ul>

                {addNewPaymentPointer()}

            </div>
        );
    }

    const FetchProfile = () => {
        if (!dataset) return <div>loading...</div>;
        return !dataset ? '-' : <Profile profileDataset={dataset} />;
    }

    const MyProfile = () => {
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
                    <h5>Wallet </h5>
                    {Page()}
                </Col>
            </Row>

            <Row className="pt-2">
                <Col>
                    <h5>Profile</h5>
                    {MyProfile()}
                </Col>
            </Row>
        </Container >
    );
}

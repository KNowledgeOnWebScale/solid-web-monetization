import { addLiteral, addNamedNode, addStringNoLocale, createThing, getNamedNode, getNamedNodeAll, getSolidDataset, getStringNoLocale, getThing, removeNamedNode, saveSolidDatasetAt, setNamedNode, setStringNoLocale, setThing, setUrl, SolidDataset, ThingPersisted } from "@inrupt/solid-client";
import { useSession, } from "@inrupt/solid-ui-react";
import { FOAF } from "@inrupt/vocab-common-rdf";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Profile } from "../../components/profile/profile.component";
import "./wallet.component.scss";
import { DataFactory, NamedNode } from "n3";


type Inputs = {
    paymentPointer: string;
};

export const Wallet: React.FC = () => {
    const { session, sessionRequestInProgress } = useSession();
    const paymentPointersProp = 'https://paymentpointers.org/ns#hasPaymentPointer';
    const ILPP = 'https://paymentpointers.org/ns#InterledgerPaymentPointer';
    const ppValue = 'https://paymentpointers.org/ns#paymentPointerValue';

    const [dataset, setDataset] = useState<SolidDataset | null>(null);
    const [me, setMe] = useState<ThingPersisted | null>(null);
    const [paymentPointers, setPaymentPointers] = useState<any>(null);


    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();

    const onSubmit = handleSubmit(data => {
        // a -> http://www.w3.org/1999/02/22-rdf-syntax-ns#type



        // Build 2 quads
        let meThing = getThing(dataset!, session.info.webId!)
        meThing = setNamedNode(meThing!, paymentPointersProp, DataFactory.namedNode(ILPP));
        let ilppThing = createThing({url: ILPP});
        ilppThing = setStringNoLocale(ilppThing, ppValue, data?.paymentPointer);
        let ds = setThing(dataset!, ilppThing)
        ds = setThing(ds!, meThing);
        return saveSolidDatasetAt(session.info.webId!, ds!, { fetch: session.fetch }).then(setDataset)

        // setUrl(dataset, "#pointer", paymentPointersPrefix );

        // setNamedNode(me, )
        // // me hasPaymentPointer [ type pp:InterledgerPayementPointer; pp:paymentPointerValue LITERAL]
        // setNamedNode(me, paymentPointersProp, )

    });

    useEffect(() => {
        console.log('called')
        const getPaymentPointers = (me: ThingPersisted) => {
            const nodes = getNamedNodeAll(me!, paymentPointersProp);
            setPaymentPointers(nodes);
        }
        const fetchThing = async () => {
            const webId = session?.info?.webId;
            if (webId) {
                const ds = await getSolidDataset(webId as string);
                const profile = await getThing(ds!, webId as string);

                setDataset(ds);
                setMe(profile);
                getPaymentPointers(profile!);
            }
            // if (dataset) {
            // }
            // if (me) {
            // }
        }

        fetchThing();
    }, [session?.info?.webId,]);

    const addNewPaymentPointer = () => {
        // if (paymentPointers?.length === 0) {
            return (
                <div>
                    <h6>Add a new payment pointer</h6>
                    <Form onSubmit={onSubmit}>
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
        // }
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

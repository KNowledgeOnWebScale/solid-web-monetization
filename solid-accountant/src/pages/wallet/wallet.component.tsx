import { addIri, addNamedNode, addStringNoLocale, addTerm, addUrl, createSolidDataset, createThing, getNamedNodeAll, getSolidDataset, getStringNoLocale, getThing, saveSolidDatasetAt, saveSolidDatasetInContainer, setNamedNode, setStringNoLocale, setTerm, setThing, setUrl, SolidDataset, ThingPersisted } from "@inrupt/solid-client";
import { addRdfJsQuadToDataset } from "@inrupt/solid-client/dist/rdf.internal";
import { useSession } from "@inrupt/solid-ui-react";
import { FOAF, RDF, RDFS} from "@inrupt/vocab-common-rdf";
import { BlankNode, DataFactory, Quad } from "n3";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Profile } from "../../components/profile/profile.component";
import "./wallet.component.scss";


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

        const webId = session.info!.webId!;
        const myBlank = DataFactory.blankNode();

        // Build 2 quads
        // let meThing = getThing(dataset!, session.info.webId!)
        // meThing = setTerm(meThing!, paymentPointersProp, myBlank);
        // let ilppThing = createThing({url: ILPP});
        // ilppThing = setStringNoLocale(ilppThing, ppValue, data?.paymentPointer);
        // let ds = setThing(dataset!, ilppThing)
        // ds = setThing(ds!, meThing);

        let ds = dataset!;
        console.log(RDF.type)
        let ppThing = createThing({name: myBlank.value});
        ppThing = setUrl(ppThing, RDF.type, DataFactory.namedNode(ILPP));
        ppThing = setStringNoLocale(ppThing, DataFactory.namedNode(ppValue), data.paymentPointer);
        ds = setThing(ds, ppThing);
        let meThing = getThing(ds, webId)!;
        meThing = setTerm(meThing, DataFactory.namedNode(paymentPointersProp), myBlank);
        // ds = addRdfJsQuadToDataset(ds, DataFactory.quad(myBlank, RDF.type, DataFactory.namedNode(ILPP)));
        // ds = addRdfJsQuadToDataset(ds, DataFactory.quad(myBlank, DataFactory.namedNode(ppValue), DataFactory.literal(data.paymentPointer)));
        // ds = addRdfJsQuadToDataset(ds, DataFactory.quad(DataFactory.namedNode(webId), DataFactory.namedNode(paymentPointersProp), myBlank));
        // setDataset(ds);
        ds = setThing(ds, meThing);


        return saveSolidDatasetAt(webId, ds!, {fetch: session.fetch}).then(setDataset);
        // return saveSolidDatasetAt(session.info.webId!, ds, { fetch: session.fetch }).then(setDataset)

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

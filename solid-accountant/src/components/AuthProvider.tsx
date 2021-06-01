import { LoginButton } from "@inrupt/solid-ui-react";
import { ReactElement } from "react";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";

import "./AuthProvider.scss";

export default function AuthProvider(props: AuthProviderProps): ReactElement {
    const onError = console.error;

    return (
        <LoginButton
            oidcIssuer={props.url}
            redirectUrl={window.location.href}
            onError={onError}
        >

            <OverlayTrigger placement="top" overlay={
                <Tooltip id="overlay-example" {...props}>
                    {props?.label}
                    </Tooltip>
            }>
                <div className="auth-provider">
                    <div className="logo"><img src={props?.imgUrl} alt="Provider logo"></img></div>
                </div>
            </OverlayTrigger>
        </LoginButton >
    );
}

export interface AuthProviderProps {
    url: string;
    imgUrl: string;
    label?: string;
}
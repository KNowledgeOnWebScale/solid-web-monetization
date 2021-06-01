import { LoginButton } from "@inrupt/solid-ui-react";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";

import "./auth-provider.component.scss";

export const AuthProvider: React.FC<AuthProviderProps> = (props) => {
    const onError = console.error;
    let url = window.location.href;
    if (url.endsWith('#auth')) {
        url = url.split('#')[0];
    }

    return (

        <LoginButton
            oidcIssuer={props.url}
            redirectUrl={window.location.href}
            onError={onError}
        >
            <OverlayTrigger placement="top" key={props?.url} overlay={
                <Tooltip id={props?.url}>
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
import { ReactElement } from "react";


export default function Profile(props:any): ReactElement {
    const { profileDataset } = props;
    
    return (
        <div>
            <pre>
                {JSON.stringify(profileDataset, null, 2)}
            </pre>
        </div>
    );
}
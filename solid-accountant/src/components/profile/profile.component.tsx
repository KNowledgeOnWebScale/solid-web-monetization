import React from "react";

export interface ProfileProps {
    profileDataset: any;
}

export const Profile: React.FC<ProfileProps> = (props) => {
    const { profileDataset } = props;

    return (
        <div>
            <pre>
                {JSON.stringify(profileDataset, null, 2)}
            </pre>
        </div>
    );
}
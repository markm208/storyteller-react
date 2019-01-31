import React from 'react';

function TitleDescription({playbackDescription}) {

    //display the playback title and the playback decription
    return (
        <div>
            <h3>
                {playbackDescription.title}
            </h3>
            <p>
                {playbackDescription.description}
            </p>
        </div>
    );
}

export default TitleDescription;
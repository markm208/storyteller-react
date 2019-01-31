import React from 'react';

function EventSummary({latestEvent, eventIndex, totalEventCount}) {

    //if there is no latest event, for example, before the first event is played
    if(!latestEvent) {
        
        //don't display anything
        return <span>Next event index: none of {totalEventCount} total <br/>No Event</span>;
    }

    //some text to display about the event
    let text;

    //fill the text based on the event type
    if(latestEvent.type === "Create File") {
        text = `Create File: ${latestEvent.initialName}`;
    } else if(latestEvent.type === "Delete File") {
        text = `Delete File: ${latestEvent.fileName}`;
    } else if(latestEvent.type === "Move File") {
        text = `Move File: moving ${latestEvent.fileName} from ${latestEvent.oldParentDirectoryName} to ${latestEvent.newParentDirectoryName}`;
    } else if(latestEvent.type === "Rename File") {
        text = `Rename File: renaming from ${latestEvent.oldFileName} to ${latestEvent.newFileName}`;
    } else if(latestEvent.type === "Create Directory") {
        text = `Create Directory: ${latestEvent.initialName}`;
    } else if(latestEvent.type === "Delete Directory") {
        text = `Delete Directory: ${latestEvent.directoryName}`;
    } else if(latestEvent.type === "Move Directory") {
        text = `Move Directory: moving ${latestEvent.directoryName} from ${latestEvent.oldParentDirectoryName} to ${latestEvent.newParentDirectoryName}`;
    } else if(latestEvent.type === "Rename Directory") {
        text = `Rename Directory: renaming from ${latestEvent.oldDirectoryName} to ${latestEvent.newDirectoryName}`;
    } else if(latestEvent.type === "Insert") {
        if(latestEvent.character === "\r") {
            text = `Insert: \\r`;
        } else if(latestEvent.character === "\n") {
            text = `Insert: \\n`;
        } else if(latestEvent.character === "\t") {
            text = `Insert: \\t`;
        } else if(latestEvent.character === " ") {
            text = `Insert: space`;
        } else {
            text = `Insert: ${latestEvent.character}`;
        }
    } else if(latestEvent.type === "Delete") {
        text = `Delete: ${latestEvent.character}`;
    }

    //display a progress count and some text about the latest event
    return (
        <span>
            Next event index: {eventIndex} of {totalEventCount} total. <br /> {text}
        </span>
    );
}

export default EventSummary;
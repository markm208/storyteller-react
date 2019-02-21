import React, { PureComponent } from 'react';
import FileTabs from './FileTabs';
import CodeWindow from './CodeWindow';
import PlaybackControls from './PlaybackControls';
//import OrderedCodeList from './OrderedCodeList';
import CodeList from './CodeList';
import FileSystemView from './FileSystemView';
import EventSummary from './EventSummary';
import AllComments from './AllComments';
import Slider from './Slider';

class PlaybackWindow extends PureComponent {

    constructor(props) {
        super(props);

        //set the initial state
        this.state = {
            codeEventsIndex: 0,             //index of the next event to playback in the prop's codeEvents array
            timerId: null,                  //the id of an interval timer used to control auto-playback
            autoPlaySpeedMs: 70,            //the amount of time in between events during auto-playback
            activeFile: null,               //the id of the most recent active file (used to choose the code window to display)
            latestEvent: null,              //the latest event played back (displayed in the EventSummary)
            allFiles: {},                   //an object with all of the files (keys are file ids)
            allDirs: {},                    //an object with all of the directories (keys are dir ids)
            code: {},                       //an object with all of the insert events for each file in their correct final positions (keys are file ids)
            filesWithChanges: {},           //an object with the ids of files that have changes in them used to indicate which files have changes
            recentInserts: {},              //an object with the ids of all of the recently inserted code characters
            commentHighlightedCode: {}      //an object with all of the highlighted code events in a comment
        };
    }

    // //called when the props change (after a fetch of the playback data from the server)
    // componentDidUpdate(prevProps) {

    //     //the initial value for playbackData.codeEvents in the App constructor is an empty array
    //     //after fetching the data from a server it has playback events in it

    //     //if the code events get filled in from the server
    //     if (prevProps.playbackData.codeEvents.length === 0 && this.props.playbackData.codeEvents.length > 0) {

    //         //add all the code so that each insert event backs up to its prev neighbor
    //         const orderedCodeLists = this.buildOrderedCodeLists(this.props.playbackData.codeEvents);

    //         //add this new object to the state
    //         this.setState({ code: orderedCodeLists });
    //     }
    // }

    // //adds every insert event in the playback to a list where each insert is in front of its previous neighbor
    // buildOrderedCodeLists = (codeEvents) => {

    //     //holds all of the ordered code lists keyed by file id
    //     const orderedCodeLists = {};

    //     //go through all of the events in the playback
    //     codeEvents.forEach(codeEvent => {

    //         //if this is a create file event
    //         if (codeEvent.type === "Create File") {

    //             //create an empty ordered code list
    //             orderedCodeLists[codeEvent.fileId] = new OrderedCodeList();

    //         } else if (codeEvent.type === "Insert") { //an insert event

    //             //add the code in its correct place
    //             orderedCodeLists[codeEvent.fileId].addCode(codeEvent);
    //         }
    //     });

    //     return orderedCodeLists;
    // }

    //-- UI Event handlers --
    //called when a file is selected to be displayed in the code window
    fileSelected = (fileId) => {

        //make the selected file the active one (will cause the code window to re-render)
        this.setState({ activeFile: fileId });
    }

    //called when a comment is selected
    commentSelected = (commentId, commentEventIndex, highlightedCode) => {

        //move to the selected comment (if not already on the comment point) 
        this.moveToEventIndex(commentEventIndex);

        //add the highlighted code to the state for this comment 
        //(perhaps overriding a highlighted comment from the call to moveToEventIndex() above)
        this.setState({ commentHighlightedCode: highlightedCode });

        //if there is some highlighted code 
        if (highlightedCode[0]) {

            //make sure the file with the highlight is visible as a code window (will cause the code window to re-render)
            this.setState({ activeFile: highlightedCode[0].fileId });
        }
    }

    //toggles the play/pause state of auto-playback
    togglePlayPause = (requestedPlayState) => {

        //if the request is to start auto-playback
        if (requestedPlayState === "Play") {

            //set an interval timer at a rate of one event per state.autoPlaySpeedMs
            //I pass in a reference to the playback window so that I can access state and props
            const timerId = setInterval((thePlaybackWindow) => {

                //if the playback is complete
                if (thePlaybackWindow.state.codeEventsIndex >= thePlaybackWindow.props.playbackData.codeEvents.length) {

                    //stop the timer
                    clearInterval(thePlaybackWindow.state.timerId);
                    thePlaybackWindow.setState({ timerId: null });

                } else { //there are still more events to playback

                    //get the next event to be played back
                    const nextEvent = thePlaybackWindow.props.playbackData.codeEvents[thePlaybackWindow.state.codeEventsIndex];

                    //if the next event has a comment attached to it
                    if (thePlaybackWindow.props.playbackData.allComments[nextEvent.id]) {

                        //stop the timer, pause for the comment
                        clearInterval(thePlaybackWindow.state.timerId);
                        thePlaybackWindow.setState({ timerId: null });
                    }

                    //move forward one event
                    thePlaybackWindow.moveForward(1, true);
                }
            }, this.state.autoPlaySpeedMs, this); //<- pass in 'this' a reference to the PlaybackWindow

            //store the timer id in state
            this.setState({ timerId: timerId });

        } else { //user has chosen to pause auto-playback

            //stop the timer
            clearInterval(this.state.timerId);
            this.setState({ timerId: null });
        }
    }

    //-- Move methods --
    //moves the playback to a particular event index
    moveToEventIndex = (newEventIndex) => {

        //if the timer is running during a move, stop the timer
        if (this.state.timerId) {
            clearInterval(this.state.timerId);
            this.setState({ timerId: null });
        }

        //holds the number of steps to take to get to the desired location
        let numberOfDesiredSteps;

        //if the desired index comes after the current index I will continue to move forward
        if (newEventIndex > this.state.codeEventsIndex) {

            //calculate how many forward steps to take
            numberOfDesiredSteps = newEventIndex - this.state.codeEventsIndex;

            //move forward
            this.moveForward(numberOfDesiredSteps, false);

        } else if (newEventIndex < this.state.codeEventsIndex) { //switching to moving backward

            //calculate the number of steps to take
            numberOfDesiredSteps = this.state.codeEventsIndex - newEventIndex;

            //move backward
            this.moveBackward(numberOfDesiredSteps, false);

        } //else- there is no difference between newEventIndex and this.state.codeEventsIndex, no where to move 
    }

    //moves the playback forward some number of steps
    moveForward = (desiredRelevantSteps, pauseOnComments) => {

        //if there is any room to move forward
        if (this.state.codeEventsIndex < this.props.playbackData.codeEvents.length) {

            let latestEvents = [];          //holds the group of events to playback
            let numberOfRelevantSteps = 0;  //counts the number of relevant steps (some events can be marked as not relevant and shouldn't be counted)
            let numberOfSteps = 0;          //the total number of events played back
            let startingPosition;           //the starting position where to grab events from the codeEvents array

            //get the starting position of the next event event
            startingPosition = this.state.codeEventsIndex;

            //move through the events from the next forward event until the end
            //I will break if I reach the desired number of steps
            for (let i = startingPosition; i < this.props.playbackData.codeEvents.length; i++) {

                //get the next event to be played back 
                const currentEvent = this.props.playbackData.codeEvents[i];

                //add it to the group of events that will be played back
                latestEvents.push(currentEvent);

                //counter for the number of events
                numberOfSteps++;

                //if the event is relevant
                if (currentEvent.permanentRelevance !== "never relevant") {

                    //counter for the relevant events
                    numberOfRelevantSteps++;
                }

                //if the desired number of events has been reached OR
                //there is a comment at this event 
                if (numberOfRelevantSteps === desiredRelevantSteps ||
                    (pauseOnComments && this.props.playbackData.allComments[currentEvent.id])) {

                    //stop moving through all of the events
                    break;
                }
            }

            //calculate the new code events index based on the starting position 
            //and how many events were processed in this step
            const newCodeEventsIndex = startingPosition + numberOfSteps;

            //update the state 
            this.updatePlaybackState(latestEvents, newCodeEventsIndex, "forward");
        }
    }

    //moves the playback backward some number of steps
    moveBackward = (desiredRelevantSteps, pauseOnComments) => {

        //if there is any room to move backward
        if (this.state.codeEventsIndex > 0) {

            let latestEvents = [];          //holds the group of events to playback
            let numberOfRelevantSteps = 0;  //counts the number of relevant steps (some events can be marked as not relevant and shouldn't be counted)
            let numberOfSteps = 0;          //the total number of events played back
            let startingPosition;           //the starting position where to grab events from the codeEvents array

            //get the starting position of the next event event
            startingPosition = this.state.codeEventsIndex - 1;

            //move through the events from the next backward event until the beginning
            //I will break if I reach the desired number of steps
            for (let i = startingPosition; i >= 0; i--) {

                //get the next event to be played back 
                const currentEvent = this.props.playbackData.codeEvents[i];

                //if this event has a comment and it is not the first event moving backwards
                if (pauseOnComments && this.props.playbackData.allComments[currentEvent.id] &&
                    i !== startingPosition) {

                    //stop moving through events
                    break;

                } else { //don't have to worry about comments here

                    //add it to the group of events that will be played back
                    latestEvents.push(currentEvent);

                    //counter for the number of events
                    numberOfSteps++;

                    //if the event is relevant
                    if (currentEvent.permanentRelevance !== "never relevant") {

                        //counter for the relevant events
                        numberOfRelevantSteps++;
                    }

                    //if the desired number of events has been reached
                    if (numberOfRelevantSteps === desiredRelevantSteps) {

                        //stop moving through all of the events
                        break;
                    }
                }
            }

            //calculate the new code events index based on the starting position 
            //and how many events were processed in this step
            //const newCodeEventsIndex = (startingPosition - numberOfSteps) >= 0 ? (startingPosition - numberOfSteps) : 0;
            const newCodeEventsIndex = (startingPosition - numberOfSteps) + 1;

            //update the state 
            this.updatePlaybackState(latestEvents, newCodeEventsIndex, "backward");
        }
    }

    //-- Updating the state of the component --
    //update the state of the playback by playing an array of events
    updatePlaybackState(latestEvents, newCodeEventsIndex, latestDirection) {

        //use React's setState to update the state of the files based on the latest events
        this.setState(prevState => {

            //holds the ids of all the files with a change in them
            const newFilesWithChanges = {}

            //holds the ids of recently inserted code
            const newRecentInserts = {};

            //holds an array of highlighted code
            let newHighlightedCode = [];

            //holds the active file, init to the previous active file if there is one
            let newActiveFile = this.state.codeEventsIndex > 0 ? prevState.activeFile : null;

            //the new state of all the files and dirs
            let newAllFiles = {};
            let newAllDirs = {};

            //copy the previous state of the files and dirs
            Object.assign(newAllFiles, prevState.allFiles);
            Object.assign(newAllDirs, prevState.allDirs);

            //go through all of the recent events
            latestEvents.forEach(event => {

                //if this event is from a new file
                if (event.type === "Create File") {

                    if (latestDirection === "forward") {

                        //create a new code list for the new file
                        prevState.code[event.fileId] = new CodeList([]);

                        //add a new file
                        newAllFiles[event.fileId] = {
                            fileId: event.fileId,
                            parentDirectoryId: event.parentDirectoryId,
                            currentName: event.initialName
                        };

                        //mark this file as one that has changed
                        newFilesWithChanges[event.fileId] = event.fileId;

                        //if this is the last event, make this file active
                        newActiveFile = event.fileId;

                    } else { //moving backward

                        //remove the code list
                        delete prevState.code[event.fileId];

                        //delete the file info from the object with all files
                        delete newAllFiles[event.fileId];
                    }

                } else if (event.type === "Delete File") {

                    if (latestDirection === "forward") {

                        //delete the file info from the object with all files
                        delete newAllFiles[event.fileId];

                    } else { //moving backward

                        //add the file back
                        newAllFiles[event.fileId] = {
                            fileId: event.fileId,
                            parentDirectoryId: event.parentDirectoryId,
                            currentName: event.fileName //<- the name property is different in the "Delete File" than in a "Create File" event
                        };

                        //if this is the last event, make this file active
                        newActiveFile = event.fileId;
                    }

                } else if (event.type === "Insert") {

                    if (latestDirection === "forward") {

                        //insert the code 
                        prevState.code[event.fileId].insert(event);
                        
                        //add this event to the recent inserts
                        newRecentInserts[event.id] = event.id;

                        //mark this file as one that has changed
                        newFilesWithChanges[event.fileId] = event.fileId;

                    } else { //moving backward

                        //make the code in the ordered code list invisible
                        prevState.code[event.fileId].reverseInsert(event.id);
                    }

                    //if this is the last event, make this file active
                    newActiveFile = event.fileId;

                } else if (event.type === "Delete") {

                    if (latestDirection === "forward") {

                        //make the deleted code in the ordered code list invisible
                        prevState.code[event.fileId].delete(event.previousNeighborId);

                        //mark this file as one that has changed
                        newFilesWithChanges[event.fileId] = event.fileId;

                    } else { //moving backward

                        //make the deleted code in the ordered list visible
                        prevState.code[event.fileId].reverseDelete(event.previousNeighborId);
                    }

                    //if this is the last event, make this file active
                    newActiveFile = event.fileId;

                } else if (event.type === "Rename File") {

                    if (latestDirection === "forward") {

                        //change to the new name
                        newAllFiles[event.fileId].currentName = event.newFileName;

                    } else { //moving backward

                        //change back to the old name
                        newAllFiles[event.fileId].currentName = event.oldFileName;
                    }

                    //if this is the last event, make this file active
                    newActiveFile = event.fileId;

                } else if (event.type === "Move File") {

                    if (latestDirection === "forward") {

                        //change the parent dir id
                        newAllFiles[event.fileId].parentDirectoryId = event.newParentDirectoryId;

                    } else { //moving backward

                        //change the parent dir id back to the original
                        newAllFiles[event.fileId].parentDirectoryId = event.oldParentDirectoryId;
                    }

                    //if this is the last event, make this file active
                    newActiveFile = event.fileId;

                } else if (event.type === "Create Directory") {

                    if (latestDirection === "forward") {

                        //add a new directory
                        newAllDirs[event.directoryId] = {
                            dirId: event.directoryId,
                            parentDirectoryId: event.parentDirectoryId,
                            currentName: event.initialName
                        };

                    } else { //moving backward

                        //remove the directory
                        delete newAllDirs[event.directoryId];
                    }

                } else if (event.type === "Delete Directory") {

                    if (latestDirection === "forward") {

                        //remove the directory
                        delete newAllDirs[event.directoryId];

                    } else { //moving backward

                        //add the directory back
                        newAllDirs[event.directoryId] = {
                            dirId: event.directoryId,
                            parentDirectoryId: event.parentDirectoryId,
                            currentName: event.directoryName
                        };
                    }

                } else if (event.type === "Rename Directory") {

                    if (latestDirection === "forward") {

                        //change the name
                        newAllDirs[event.directoryId].currentName = event.newDirectoryName;

                    } else { //moving backward

                        //change the name back to the original
                        newAllDirs[event.directoryId].currentName = event.oldDirectoryName;
                    }

                } else if (event.type === "Move Directory") {

                    if (latestDirection === "forward") {

                        //change the parent dir id
                        newAllDirs[event.directoryId].parentDirectoryId = event.newParentDirectoryId;

                    } else { //moving backward

                        //change the parent dir id back
                        newAllDirs[event.directoryId].parentDirectoryId = event.oldParentDirectoryId;
                    }
                }
            });

            //holds the latest event in the group
            //let latestEvent = latestEvents[latestEvents.length - 1];
            
            //get the event right before the new code event index (or the first event if at the beginning) to see
            //if there is a comment so that I can highlight the comment text
            let latestEvent = this.props.playbackData.codeEvents[newCodeEventsIndex > 0 ? (newCodeEventsIndex - 1) : 0];

            //if the latest event has a comment associated with it
            if (this.props.playbackData.allComments[latestEvent.id]) {

                //get the comment point
                const commentPoint = this.props.playbackData.allComments[latestEvent.id];

                //get the first comment
                const firstComment = commentPoint.commentArray[0];

                //get the array of highlighted code 
                newHighlightedCode = firstComment.selectedCode;

                //if there is some highlighted code 
                if (newHighlightedCode[0]) {

                    //make sure the file with the highlight is visible as a code window
                    newActiveFile = newHighlightedCode[0].fileId;
                }
            }

            //return the new state of the playback
            return {
                codeEventsIndex: newCodeEventsIndex,
                activeFile: newActiveFile,
                latestEvent: latestEvent,
                allFiles: newAllFiles,
                allDirs: newAllDirs,
                filesWithChanges: newFilesWithChanges,
                recentInserts: newRecentInserts,
                commentHighlightedCode: newHighlightedCode,
                code: prevState.code
            };
        });
    }

    render() {

        return (
            <div>
                <AllComments 
                    allCommentPoints={this.props.playbackData.allComments} 
                    commentSelected={this.commentSelected} />
                <PlaybackControls 
                    autoPlaying={this.state.timerId !== null} 
                    togglePlayPause={this.togglePlayPause} 
                    moveForward={this.moveForward} 
                    moveBackward={this.moveBackward} />
                <Slider 
                    totalEventCount={this.props.playbackData.codeEvents.length} 
                    sliderValue={this.state.codeEventsIndex} 
                    allCommentPoints={this.props.playbackData.allComments} 
                    moveToEventIndex={this.moveToEventIndex} />
                <EventSummary 
                    latestEvent={this.state.latestEvent} 
                    eventIndex={this.state.codeEventsIndex} 
                    totalEventCount={this.props.playbackData.codeEvents.length} />
                <FileTabs 
                    allFiles={this.state.allFiles} 
                    filesWithChanges={this.state.filesWithChanges} 
                    fileSelected={this.fileSelected} />
                <CodeWindow 
                    code={this.state.code[this.state.activeFile]} 
                    recentInserts={this.state.recentInserts} 
                    commentHighlightedCode={this.state.commentHighlightedCode} />
                <FileSystemView 
                    allFiles={this.state.allFiles} 
                    allDirs={this.state.allDirs} 
                    fileSelected={this.fileSelected} />
            </div>
        );
    }
}

export default PlaybackWindow;

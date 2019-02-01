import React, { Component } from 'react';
import FileTabs from './FileTabs';
import CodeWindow from './CodeWindow';
import PlaybackControls from './PlaybackControls';
import CodeList from './CodeList';
import FileSystemView from './FileSystemView';
import EventSummary from './EventSummary';

class PlaybackWindow extends Component {

    constructor(props) {
        super(props);

        //set the initial state (it will be filled in when the component mounts)
        this.state = {
            codeEventsIndex: 0,             //index of the next event to playback
            mostRecentDirection: "forward", //the most recent direction that the playback has moved in
            timerId: null,                  //the id of an interval timer used to control auto-playback
            autoPlaySpeedMs: 150,           //the amount of time in between events during auto-playback
            activeFile: null,               //the id of the most recent active file (used to choose the code window to display)
            latestEvent: null,              //the latest event played back (displayed in the EventSummary)
            allFiles: {},                   //an object with all of the files (key are file ids)
            allDirs: {},                    //an object with all of the directories (keys are dir ids)
            code: {},                       //an object with all of the insert events for each file (keys are file ids)
            filesWithChanges: {}            //an object with the ids of files that have changes in them
        };
    }

    //called when a file is selected to be displayed in the code window
    fileSelected = (fileId) => {

        //make the selected file the active one (will cause the code window to re-render)
        this.setState({activeFile: fileId});
    }

    //toggles the play/pause state of auto-playback
    togglePlayPause = (playState) => {

        //if the request is to start auto-playback
        if(playState === "Play") {

            //set an interval timer at a rate of one event per state.autoPlaySpeedMs
            //I pass in a reference to the playback window so that I can access state and props
            const timerId = setInterval((thePlaybackWindow) => {

                //console.log("Running timer...");
                
                //if the playback is complete
                if(thePlaybackWindow.state.codeEventsIndex >= thePlaybackWindow.props.playbackData.codeEvents.length) {
                    
                    //stop the timer
                    clearInterval(thePlaybackWindow.state.timerId);
                    thePlaybackWindow.setState({timerId: null});

                } else { //there are still more events to playback
                    
                    //move forward one event
                    thePlaybackWindow.moveForward(1);                    
                }
            }, this.state.autoPlaySpeedMs, this); //<- pass in 'this' a reference to the PlaybackWindow

            //store the timer id in state
            this.setState({timerId: timerId});

        } else { //user has chosen to pause auto-playback

            //stop the timer
            clearInterval(this.state.timerId);
            this.setState({timerId: null});
        }
    }

    //moves the playback to a particular event index
    moveToEventIndex = (newEventIndex) => {

        //console.log(`moving slider to ${newEventIndex}`);

        //if the timer is running during a slide, stop the timer
        if(this.state.timerId) {
            clearInterval(this.state.timerId);
            this.setState({timerId: null});
        }

        //holds the number of steps to take to get to the desired location
        let numberOfDesiredSteps;

        //if the playback was most recently moving forward
        if(this.state.mostRecentDirection === "forward") {
            
            //if the desired index comes after the current index I will continue to move forward
            if(newEventIndex >= this.state.codeEventsIndex) {

                //calculate how many forward steps to take
                numberOfDesiredSteps = newEventIndex - this.state.codeEventsIndex;
                //console.log(`moving ${numberOfDesiredSteps} steps forward`);
                
                //if there is at least one
                if(numberOfDesiredSteps > 0) {

                    //move forward
                    this.moveForward(numberOfDesiredSteps);
                }

            } else { //switching to moving backward

                //calculate the number of steps to take
                numberOfDesiredSteps = this.state.codeEventsIndex - newEventIndex;
                //console.log(`moving ${numberOfDesiredSteps} steps backward`);

                //if there is at least one step
                if(numberOfDesiredSteps > 0) {

                    //move backward
                    this.moveBackward(numberOfDesiredSteps);
                }
            }
        } else { //the playback was most recently moving backward

            //if the desired index comes before the current index I will continue to move backward
            if(newEventIndex <= this.state.codeEventsIndex) {

                //calculate the number of steps to take
                numberOfDesiredSteps = this.state.codeEventsIndex - newEventIndex;
                //console.log(`moving ${numberOfDesiredSteps} steps backward`);
                
                //if there is at least one step
                if(numberOfDesiredSteps > 0) {

                    //move backward
                    this.moveBackward(numberOfDesiredSteps);
                }

            } else { //switching to moving forward

                //calculate the number of steps to take
                numberOfDesiredSteps = newEventIndex - this.state.codeEventsIndex;
                //console.log(`moving ${numberOfDesiredSteps} steps forward`);
                
                //if there is at least one step                
                if(numberOfDesiredSteps > 0) {
                    this.moveForward(numberOfDesiredSteps);
                }
            }
        }
    }

    //moves the playback forward some number of steps
    moveForward = (desiredRelevantSteps) => {
        let latestEvents = [];          //holds the group of events to playback
        let numberOfRelevantSteps = 0;  //counts the number of relevant steps (some events can be marked as not relevant and shouldn't be counted)
        let numberOfSteps = 0;          //the total number of events played back
        let startingPosition;           //the starting position where to grab events from the codeEvents array
        
        //get the starting position of the next event event
        startingPosition = this.getStartingPosition("forward");
        //console.log(`Starting pos: ${startingPosition} moving forward`);

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

            //if the desired number of events has been reached
            if (numberOfRelevantSteps === desiredRelevantSteps) {

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

    //moves the playback backward some number of steps
    moveBackward = (desiredRelevantSteps) => {
        let latestEvents = [];          //holds the group of events to playback
        let numberOfRelevantSteps = 0;  //counts the number of relevant steps (some events can be marked as not relevant and shouldn't be counted)
        let numberOfSteps = 0;          //the total number of events played back
        let startingPosition;           //the starting position where to grab events from the codeEvents array
        
        //get the starting position of the next event event
        startingPosition = this.getStartingPosition("backward");
        //console.log(`Starting pos: ${startingPosition} moving backward`);

        //move through the events from the next backward event until the beginning
        //I will break if I reach the desired number of steps
        for (let i = startingPosition; i >= 0; i--) {

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

            //if the desired number of events has been reached
            if (numberOfRelevantSteps === desiredRelevantSteps) {

                //stop moving through all of the events
                break;
            }
        }

        //calculate the new code events index based on the starting position 
        //and how many events were processed in this step
        const newCodeEventsIndex = startingPosition - numberOfSteps;
        
        //update the state 
        this.updatePlaybackState(latestEvents, newCodeEventsIndex, "backward");
    }

    //update the state of the playback by playing an array of events
    updatePlaybackState(latestEvents, newCodeEventsIndex, latestDirection) {

        //use React's setState to update the state of the files based on the latest events
        this.setState((prevState, props) => {

            //holds all the information about the new code and files
            let codeData = {
                newCodeLists: {},               //the changes to code that have happened due to the latest events
                newAllFiles: prevState.allFiles,//all the files in the playback so far
                newAllDirs: prevState.allDirs,  //all the dirs in the playback so far
                newFilesWithChanges: {}         //holds the ids of all the files with a change in them
            };

            //holds the active file, init to the previous active file if there is one
            let newActiveFile = this.state.codeEventsIndex > 0 ? prevState.activeFile : null;

            //go through all of the recent events
            latestEvents.forEach(event => {

                //if this event is from a new file
                if(event.type === "Create File") {

                    if(latestDirection === "forward") {
                        this.createFile(event, codeData, prevState);
                        
                        //if this is the last event, make this file active
                        newActiveFile = event.fileId;
                        
                    } else {
                        this.reverseCreateFile(event, codeData, prevState);
                    }

                } else if(event.type === "Delete File") {

                    if(latestDirection === "forward") {
                        this.deleteFile(event, codeData, prevState);
                    } else {
                        this.reverseDeleteFile(event, codeData, prevState);
                        
                        //if this is the last event, make this file active
                        newActiveFile = event.fileId;
                    }

                } else if(event.type === "Insert") { 

                    if(latestDirection === "forward") {
                        this.insert(event, codeData, prevState);
                    } else {
                        this.reverseInsert(event, codeData, prevState);
                    }
                    
                    //if this is the last event, make this file active
                    newActiveFile = event.fileId;

                } else if(event.type === "Delete") {

                    if(latestDirection === "forward") {
                        this.delete(event, codeData, prevState);
                    } else {
                        this.reverseDelete(event, codeData, prevState);                        
                    }

                    //if this is the last event, make this file active
                    newActiveFile = event.fileId;

                } else if(event.type === "Rename File") {

                    if(latestDirection === "forward") {
                        this.renameFile(event, codeData, prevState);
                    } else {
                        this.reverseRenameFile(event, codeData, prevState);
                    }

                    //if this is the last event, make this file active
                    newActiveFile = event.fileId;

                } else if(event.type === "Move File") {

                    if(latestDirection === "forward") {
                        this.moveFile(event, codeData, prevState);
                    } else {
                        this.reverseMoveFile(event, codeData, prevState);
                    }

                    //if this is the last event, make this file active
                    newActiveFile = event.fileId;

                } else if(event.type === "Create Directory") {

                    if(latestDirection === "forward") {
                        this.createDirectory(event, codeData, prevState);
                    } else {
                        this.reverseCreateDirectory(event, codeData, prevState);
                    }

                } else if(event.type === "Delete Directory") {

                    if(latestDirection === "forward") {
                        this.deleteDirectory(event, codeData, prevState);
                    } else {
                        this.reverseDeleteDirectory(event, codeData, prevState);
                    }

                } else if(event.type === "Rename Directory") {
                
                    if(latestDirection === "forward") {
                        this.renameDirectory(event, codeData, prevState);
                    } else {
                        this.reverseRenameDirectory(event, codeData, prevState);
                    }

                } else if(event.type === "Move Directory") {
                
                    if(latestDirection === "forward") {
                        this.moveDirectory(event, codeData, prevState);
                    } else {
                        this.reverseMoveDirectory(event, codeData, prevState);
                    }
                }
            });

            //holds the latest event in the group
            let latestEvent = latestEvents[latestEvents.length - 1];

            //get the previous state of the code so it can be updated with the latest changes
            let newCode = prevState.code;

            //for all of the changes to the code that have been made in the latest group of events
            for(let fileId in codeData.newCodeLists) {

                //update the code with what is in the code list
                newCode[fileId] = codeData.newCodeLists[fileId].toArray();
            }
                        
            //return the new state of the playback
            return {
                codeEventsIndex: newCodeEventsIndex,
                mostRecentDirection: latestDirection,
                activeFile: newActiveFile,
                latestEvent: latestEvent,
                allFiles: codeData.newAllFiles,
                allDirs: codeData.newAllDirs,
                code: newCode,
                filesWithChanges: codeData.newFilesWithChanges
            };
        });
    }

    createFile(event, codeData, prevState) {
        //console.log("inside createFile()");

        //add a new file
        codeData.newAllFiles[event.fileId] = {
            fileId: event.fileId,
            parentDirectoryId: event.parentDirectoryId,
            currentName: event.initialName
        };

        //create an empty code list in the map
        codeData.newCodeLists[event.fileId] = new CodeList([]);

        //mark this file as one that has changed
        codeData.newFilesWithChanges[event.fileId] = event.fileId;
    }

    reverseCreateFile(event, codeData, prevState) {
        //console.log("inside reverseCreateFile()");

        //delete the file info from the object with all files
        delete codeData.newAllFiles[event.fileId];

        //the code list for this file will be empty at this point, just leave it
    }

    deleteFile(event, codeData, prevState) {
        //console.log("inside deleteFile()");

        //delete the file info from the object with all files
        delete codeData.newAllFiles[event.fileId];

        //leave the code unchanged because if I move in reverse I'll want that code back in 
        //the state it was in when the file was deleted
    }

    reverseDeleteFile(event, codeData, prevState) {
        //console.log("inside reverseDeleteFile()");

        //add the file back
        codeData.newAllFiles[event.fileId] = {
            fileId: event.fileId,
            parentDirectoryId: event.parentDirectoryId,
            currentName: event.fileName //<- the name property is different in the "Delete File" than in a "Create File" event
        };

        //create a code list in the map with the previous file contents
        codeData.newCodeLists[event.fileId] = new CodeList(prevState.code[event.fileId]);
    }

    renameFile(event, codeData, prevState) {
        //console.log("inside renameFile()");

        //change to the new name
        codeData.newAllFiles[event.fileId].currentName = event.newFileName;
    }

    reverseRenameFile(event, codeData, prevState) {
        //console.log("inside reverseRenameFile()");

        //change back to the old name
        codeData.newAllFiles[event.fileId].currentName = event.oldFileName;
    }

    moveFile(event, codeData, prevState) {
        //console.log("inside moveFile()");

        //change the parent dir id
        codeData.newAllFiles[event.fileId].parentDirectoryId = event.newParentDirectoryId;
    }

    reverseMoveFile(event, codeData, prevState) {
        //console.log("inside reverseMoveFile()");

        //change the parent dir id back to the original
        codeData.newAllFiles[event.fileId].parentDirectoryId = event.oldParentDirectoryId;
    }

    createDirectory(event, codeData, prevState) {
        //console.log("inside createDirectory()");

        //add a new directory
        codeData.newAllDirs[event.directoryId] = {
            dirId: event.directoryId,
            parentDirectoryId: event.parentDirectoryId,
            currentName: event.initialName
        };
    }

    reverseCreateDirectory(event, codeData, prevState) {
        //console.log("inside reverseCreateDirectory()");

        //remove the directory
        delete codeData.newAllDirs[event.directoryId];
    }

    deleteDirectory(event, codeData, prevState) {
        //console.log("inside deleteDirectory()");

        //remove the directory
        delete codeData.newAllDirs[event.directoryId];
    }

    reverseDeleteDirectory(event, codeData, prevState) {
        //console.log("inside reverseDeleteDirectory()");

        //add the directory back
        codeData.newAllDirs[event.directoryId] = {
            dirId: event.directoryId,
            parentDirectoryId: event.parentDirectoryId,
            currentName: event.directoryName
        };
    }

    renameDirectory(event, codeData, prevState) {
        //console.log("inside renameDirectory()");

        //change the name
        codeData.newAllDirs[event.directoryId].currentName = event.newDirectoryName;
    }

    reverseRenameDirectory(event, codeData, prevState) {
        //console.log("inside reverseRenameDirectory()");

        //change the name back to the original
        codeData.newAllDirs[event.directoryId].currentName = event.oldDirectoryName;
    }

    moveDirectory(event, codeData, prevState) {
        //console.log("inside moveDirectory()");

        //change the parent dir id
        codeData.newAllDirs[event.directoryId].parentDirectoryId = event.newParentDirectoryId;
    }

    reverseMoveDirectory(event, codeData, prevState) {
        //console.log("inside reverseMoveDirectory()");

        //change the parent dir id back
        codeData.newAllDirs[event.directoryId].parentDirectoryId = event.oldParentDirectoryId;
    }

    insert(event, codeData, prevState) {
        //console.log("inside insert()");

        //temporarily mark this event as a recent insert
        event["recentInsert"] = true;

        //if a code list does not exist for the file affected by this event
        if(!codeData.newCodeLists[event.fileId]) {
            
            //create a new code list with the code in this file 
            codeData.newCodeLists[event.fileId] = new CodeList(prevState.code[event.fileId]);
        } 
        //else- the code list has been created from a previous event in the latest events
        
        //add the insert event 
        codeData.newCodeLists[event.fileId].addCode(event);

        //mark this file as one that has changed
        codeData.newFilesWithChanges[event.fileId] = event.fileId;

    }

    reverseInsert(event, codeData, prevState) {
        //console.log("inside reverseInsert()");

        //if a code list does not exist for the file affected by this event
        if(!codeData.newCodeLists[event.fileId]) {
            
            //create a new code list with the code in this file 
            codeData.newCodeLists[event.fileId] = new CodeList(prevState.code[event.fileId]);
        } 
        //else- the code list has been created from a previous event in the latest events
        
        //delete the insert event 
        codeData.newCodeLists[event.fileId].deleteCode(event.id);        
    }

    delete(event, codeData, prevState) {
        //console.log("inside delete()");

        //if a code list does not exist for the file affected by this event
        if(!codeData.newCodeLists[event.fileId]) {

            //create a new code list with the code in this file 
            codeData.newCodeLists[event.fileId] = new CodeList(prevState.code[event.fileId]);                    
        } 
        //else- the code list has been created from a previous event in the latest events
        
        //add the insert event that is being deleted to this delete event so that it can be reversed later
        event["deletedInsertEvent"] = codeData.newCodeLists[event.fileId].retrieveEventOnId(event.previousNeighborId);
        
        //delete the code event
        codeData.newCodeLists[event.fileId].deleteCode(event.previousNeighborId);

        //mark this file as one that has changed
        codeData.newFilesWithChanges[event.fileId] = event.fileId;
    }

    reverseDelete(event, codeData, prevState) {
        
        //console.log("inside reverseDelete()");
        //if I am reversing a delete then the delete event should have the insert event associated
        //with it attached from the original call to delete()
        
        //retrieve the insert event from the delete  
        const insertEvent = event.deletedInsertEvent;

        //insert the previously deleted insert event
        this.insert(insertEvent, codeData, prevState);

        //remove the insert event from this delete event
        delete event.deletedInsertEvent;
    }

    getStartingPosition(desiredPosition) {

        //if we are *continuing* to move in the same direction as the last step
        if (desiredPosition === this.state.mostRecentDirection) {
            
            //use the previous index
            return this.state.codeEventsIndex;

        } else if (desiredPosition === "backward" && this.state.mostRecentDirection === "forward") {
            
            //move backward one event
            return this.state.codeEventsIndex - 1;

        } else if (desiredPosition === "forward" && this.state.mostRecentDirection === "backward") {

            //move forward one event
            return this.state.codeEventsIndex + 1;
        }
    }

    render() {        
        return (
            <div>
                <PlaybackControls totalEventCount={this.props.playbackData.codeEvents.length} sliderValue={this.state.codeEventsIndex} autoPlaying={this.state.timerId !== null} togglePlayPause={this.togglePlayPause} moveToEventIndex={this.moveToEventIndex} moveForward={this.moveForward} moveBackward={this.moveBackward} />
                <EventSummary latestEvent={this.state.latestEvent} eventIndex={this.state.codeEventsIndex} totalEventCount={this.props.playbackData.codeEvents.length} />
                <FileTabs allFiles={this.state.allFiles} filesWithChanges={this.state.filesWithChanges} fileSelected={this.fileSelected} />
                <CodeWindow code={this.state.code[this.state.activeFile]} />
                <FileSystemView allFiles={this.state.allFiles} allDirs={this.state.allDirs} fileSelected={this.fileSelected}/>
            </div>
        );
    }
}

export default PlaybackWindow;

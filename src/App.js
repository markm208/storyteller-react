import React, { Component } from 'react';
import './App.css';
import TitleDescription from './TitleDescription';
import PlaybackWindow from './PlaybackWindow';

import { fakeFetch1, fakeFetch2, fakeFetch3, fakeFetch4, fakeFetch5 } from './FakeDataStore';

class App extends Component {
    constructor(props) {
        super(props);

        //the state will be filled in more completely from the server when the component mounts
        this.state = {
            playbackData: {
                playbackDescription: {
                    title: "Loading Playback Data...",
                    description: "",
                    comments: {}
                },
                codeEvents: []
            }
        };
    }

    componentDidMount() {

        //get the data from the server (currently using test data)
        const playbackData = fakeFetch5();

        //handle any legacy playback formats
        this.handleLegacyPlaybackData(playbackData);

        //fetch the playback data from the server and store it in the state
        this.setState({ playbackData: playbackData });
    }

    //pre 1.0 versions of storyteller used a property called 'comments' to hold comments
    //post 1.0 uses an updated data structure to hold comments property called 'allComments'
    //this function changes the comments if the old style is present
    handleLegacyPlaybackData(playbackData) {

        //if there is a 'comments' property (this happens in pre 1.0 versions of storyteller)
        if(playbackData.comments) {

            //holds every insert event and the file id associated with them
            const allInsertToFileMappings = {};

            //holds all of the new comment objects
            const allComments = {};

            //go through each of the events in the playback
            playbackData.codeEvents.forEach((event, index) => {

                //if the event is an insert event
                if(event.type === "Insert") {

                    //add the file id mapping 
                    allInsertToFileMappings[event.id] = event.fileId;
                }

                //if there is a comment at this event in the playback
                if(playbackData.comments[event.id]) {

                    //get the original comment array from the playback data
                    const oldCommentArray = playbackData.comments[event.id];

                    //this will be a new an improved version of the array
                    //go through each of the original objects in the old array
                    const newCommentArray = oldCommentArray.map((oldObject, objIndex) => {

                        //copy the old object into a new one
                        const newObject = Object.assign({}, oldObject);

                        //store an id
                        newObject["commentId"] = `commentId-${event.id}-${objIndex}`;

                        //go through the selected code ids and return a new array
                        newObject.selectedCode = newObject.selectedCodeIds.map(selectedCodeId => {
                            
                            //create a new object with the event id and the file id where the insert event comes from 
                            return {
                                eventId: selectedCodeId, 
                                fileId: allInsertToFileMappings[selectedCodeId]
                            };
                        });

                        //get rid of the old selected code ids
                        delete newObject.selectedCodeIds;

                        //add the new and improved object to the array
                        return newObject;
                    });

                    //for each comment point store the event index and the new array
                    allComments[event.id] = {
                        eventId: event.id,
                        eventIndex: index,
                        commentArray: newCommentArray
                    };
                }
            });

            playbackData["allComments"] = allComments;
            delete playbackData.comments;

            //allComments: {
            //    some-event-id: {
            //        eventId: some-event-id,
            //        eventIndex: 8,
            //        commentArray: [{displayCommentEvent: {}, 
            //                       developerGroupId: ..., 
            //                       selectedCode: [{eventId: anEventId, fileId: aFileId}, 
            //                                      {eventId: anEventId, fileId: aFileId}], 
            //                       ...}, 
            //                       {...}, 
            //                       {...}]
            //    }
            //}
        }
    }

    render() {
        return (
            <div>
                <TitleDescription playbackDescription={this.state.playbackData.playbackDescription} />
                <PlaybackWindow playbackData={this.state.playbackData} />
            </div>
        );
    }
}

export default App;

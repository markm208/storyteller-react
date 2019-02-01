import React, { Component } from 'react';
import './App.css';
import TitleDescription from './TitleDescription';
import PlaybackWindow from './PlaybackWindow';

import { fakeFetch1, fakeFetch2, fakeFetch3 } from './FakeDataStore';

class App extends Component {
    constructor(props) {
        super(props);

        //set the initial state (it will be filled in more completely when the component mounts)
        this.state = {
            playbackData: {
                playbackDescription: {
                    title: "Loading Playback Data...",
                    description: ""
                },
                codeEvents: []
            }
        };
    }

    componentDidMount() {

        //fetch the playback data from the server and store it in the state
        this.setState({ playbackData: fakeFetch2() });
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

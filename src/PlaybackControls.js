import React, { Component } from 'react';

class PlaybackControls extends Component {

    //moves the playback forward one step
    nextStep = () => {
        this.props.moveForward(1);
    }

    //moves the playback backward one step 
    previousStep = () => {
        this.props.moveBackward(1);
    }

    //toggles the play/pause behavior
    togglePlayPause = (event) => {
        event.preventDefault();

        //grab the current text from the button
        const isPlaying = event.target.innerHTML === "Pause";

        //if the playback is auto playing
        if(isPlaying) {
            
            //pause it
            this.props.togglePlayPause("Pause");
        
        } else { //the playback is paused

            //start playing it
            this.props.togglePlayPause("Play");
        }
    }

    //called when the slider moves
    moveSlider = (event) => {

        //get the value of the slider
        const newSliderValue = event.target.value;
        
        //move the playback to that position
        this.props.moveToEventIndex(newSliderValue);
    }

    render() {
        return (
            <div>
                <button onClick={this.previousStep}>&lt;</button>
                <button onClick={this.togglePlayPause}>{this.props.autoPlaying ? "Pause" : "Play"}</button>
                <button onClick={this.nextStep}>&gt;</button>
                <input id="eventSlider" type="range" min="-1" max={this.props.totalEventCount} step="1" value={this.props.sliderValue} onChange={this.moveSlider} />
            </div>
        );    
    }
}

export default PlaybackControls;
import React, { PureComponent } from 'react';

class PlaybackControls extends PureComponent {

    //moves the playback forward one step
    nextStep = () => {
        this.props.moveForward(1, false);
    }

    //moves the playback backward one step 
    previousStep = () => {
        this.props.moveBackward(1, false);
    }

    //moves the playback forward to the next comment or to the end if there are no more comments
    nextComment = () => {
        this.props.moveForward(Number.MAX_SAFE_INTEGER, true);
    }

    //moves the playback backward to the next comment or to the beginning if there are no more comments 
    previousComment = () => {
        this.props.moveBackward(Number.MAX_SAFE_INTEGER, true);
    }
    

    //moves the playback forward to the end ignoring all comments
    moveToEnd = () => {
        this.props.moveForward(Number.MAX_SAFE_INTEGER, false);
    }

    //moves the playback backward to the beginning ignoring all comments 
    moveToBeginning = () => {
        this.props.moveBackward(Number.MAX_SAFE_INTEGER, false);
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
                <button onClick={this.moveToBeginning}>&lt;&lt;&lt;</button>
                <button onClick={this.previousComment}>&lt;&lt;</button>
                <button onClick={this.previousStep}>&lt;</button>
                <button onClick={this.togglePlayPause}>{this.props.autoPlaying ? "Pause" : "Play"}</button>
                <button onClick={this.nextStep}>&gt;</button>
                <button onClick={this.nextComment}>&gt;&gt;</button>
                <button onClick={this.moveToEnd}>&gt;&gt;&gt;</button>
                <input id="eventSlider" type="range" min="0" max={this.props.totalEventCount} step="1" value={this.props.sliderValue} onChange={this.moveSlider} />
            </div>
        );    
    }
}

export default PlaybackControls;
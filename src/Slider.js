import React, { PureComponent } from 'react';
import './Slider.css';
import { relative } from 'path';

class Slider extends PureComponent {

    //called when the slider moves
    moveSlider = (event) => {

        //get the value of the slider
        const newSliderValue = event.target.value;
        
        //move the playback to that position
        this.props.moveToEventIndex(newSliderValue);
    }

    render() {

        //go through each of the comment points and add an option for a comment hash mark
        const tickMarks = [];
        for(let eventId in this.props.allCommentPoints) {
            const commentPoint = this.props.allCommentPoints[eventId];
            
            //these options will get added to a datalist in the slider
            tickMarks.push (
                <option value={commentPoint.eventIndex} />
            );
        }

        //get all of the comment points and sort them
        // const allCommentPointsArray = [];
        // for(let eventId in this.props.allCommentPoints) {
        //     allCommentPointsArray.push(this.props.allCommentPoints[eventId]);
        // }

        // allCommentPointsArray.sort( (left, right) => left.eventIndex - right.eventIndex );
        
        // const commentMarkers = allCommentPointsArray.map(commentPoint => {
        //     const percentPoint = (commentPoint.eventIndex * 100.0) / this.props.totalEventCount;
        //     console.log("Comment Percent Point: " + percentPoint);
            
        //     return (
        //         <span style={ {left: percentPoint + "%"} } className="commentMarker">&nbsp;</span>
        //     );            
        // });

        return (
            <div>
                <input list="tickMarks" id="eventSlider" type="range" min="0" max={this.props.totalEventCount} step="1" value={this.props.sliderValue} onChange={this.moveSlider} />
                <datalist id="tickMarks">
                    {tickMarks}
                </datalist>
            </div>
        );    
    }
}

export default Slider;
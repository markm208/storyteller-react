import React, { PureComponent } from 'react';
import CommentPoint from './CommentPoint';
import './AllComments.css';

class AllComments extends PureComponent {
    
    render() {

        //used to hold all of the comment points (initially unsorted)
        const allSortedCommentPoints = [];

        //copy all of the individual comment objects into an array
        for(let eventId in this.props.allCommentPoints) {
            allSortedCommentPoints.push(this.props.allCommentPoints[eventId]);
        }

        //sort the array based on the event index
        allSortedCommentPoints.sort((left, right) => left.eventIndex - right.eventIndex);
        
        //holds all of the comment point UI elements    
        const allCommentsPointsUI = allSortedCommentPoints.map(commentPoint => {
            return (
                <CommentPoint 
                    key={commentPoint.eventId} 
                    commentPoint={commentPoint}
                    commentSelected={this.props.commentSelected} />
            );
        });

        return (
            <div className="commentWindow">
                <input placeholder="Search Comments (this doesn't work yet)"/><button>Search</button>
                <div className="allComments">
                    <div>
                        {allCommentsPointsUI}
                    </div>
                </div>
            </div>
        );
    }
}
export default AllComments;
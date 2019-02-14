import React from 'react';
import CommentPoint from './CommentPoint';
import './AllComments.css';

function AllComments({allCommentPoints, commentSelected}) {

    //used to hold all of the comment points (initially unsorted)
    const allSortedCommentPoints = [];

    //copy all of the individual comment objects into an array
    for(let eventId in allCommentPoints) {
        allSortedCommentPoints.push(allCommentPoints[eventId]);
    }

    //sort the array based on the event index
    allSortedCommentPoints.sort((left, right) => left.eventIndex - right.eventIndex);
    
    //holds all of the comment point UI elements    
    const allCommentsPointsUI = allSortedCommentPoints.map(commentPoint => {
        return (
            <CommentPoint 
                key={commentPoint.eventId} 
                commentPoint={commentPoint}
                commentSelected={commentSelected} />
        );
    });

    return (
        <div className="commentWindow">
            <div>Search Bar Here</div>
            <div>Comment Navigation Here</div>
            <div>
                {allCommentsPointsUI}
            </div>
        </div>
    );
}

export default AllComments;
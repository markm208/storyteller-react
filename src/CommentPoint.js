import React from 'react';
import Comment from './Comment';
import './CommentPoint.css';

function CommentPoint({commentPoint, commentSelected}) {

    // function commentPointClicked(event) {
    //     console.log(`comment point clicked ${event.eventNumber}`);
    // }

    return (
        <div className="commentPoint">
            {commentPoint.commentArray.map((comment, index) => {
                return (
                    <Comment 
                        key={comment.commentId} 
                        comment={comment}
                        commentEventIndex={commentPoint.eventIndex} 
                        commentSelected={commentSelected} />
                );
            })}
        </div>
    );
}

export default CommentPoint;
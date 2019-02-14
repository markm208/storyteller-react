import React from 'react';
import './Comment.css';

function Comment({comment, commentEventIndex, commentSelected}) {

    function commentClicked(event, comment) {
        
        event.preventDefault();

        //
        commentSelected(comment.commentId, commentEventIndex + 1, comment.selectedCode);
    }

    return (
        <div className="commentText" dangerouslySetInnerHTML={{__html: comment.commentText }} onClick={(event) => commentClicked(event, comment)}/>        
    );
}

export default Comment;
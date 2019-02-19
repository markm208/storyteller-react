import React, { PureComponent } from 'react';
import Comment from './Comment';
import './CommentPoint.css';

class CommentPoint extends PureComponent {

    // function commentPointClicked(event) {
    //     console.log(`comment point clicked ${event.eventNumber}`);
    // }
    
    render() {
        return (
            <div className="commentPoint">
                {this.props.commentPoint.commentArray.map((comment, index) => {
                    return (
                        <Comment 
                            key={comment.commentId} 
                            comment={comment}
                            commentEventIndex={this.props.commentPoint.eventIndex} 
                            commentSelected={this.props.commentSelected} />
                    );
                })}
            </div>
        );
    }
}
export default CommentPoint;
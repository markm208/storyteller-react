import React, { PureComponent } from 'react';
import './Comment.css';

class Comment extends PureComponent {
    
    commentClicked = (event) => {
            
        event.preventDefault();

        //move to the selected comment 
        this.props.commentSelected(this.props.comment.commentId, this.props.commentEventIndex + 1, this.props.comment.selectedCode);
    }

    render() {

        //for each of the comment images
        const allImages = this.props.comment.images.map(image => {
    
            return (
                <img src={image.dataURL} key={image.imgId} className="commentImage"/>
            );
        });
        
        return (
            <div>
                <div className="commentText" dangerouslySetInnerHTML={{__html: this.props.comment.commentText }} onClick={this.commentClicked}/>
                {allImages}
            </div>
        );
    }
}
export default Comment;
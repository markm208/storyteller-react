import React, { PureComponent } from 'react';
import CodeSpan from './CodeSpan';

class CodeWindow extends PureComponent {
    
    render() {

        //if there is no code, for example, before the first event is played
        if(!this.props.code) {

            //don't display anything
            return null;
        }

        //this gets the visible code in the file
        const code = this.props.code.toArray();
        
        //holds highlighted 
        const recentCommentHighlight = {};

        //turn the array of comments into an object based on
        this.props.commentHighlightedCode.forEach(comment => {
            recentCommentHighlight[comment.eventId] = comment;
        });

        //the number of lines in the file (start with one to handle the last line
        //which will not have a new line yet)
        let lineCount = 1;

        let recentInsert;
        let commentHighlight;

        //create the code spans
        const codeSpans = code.map(event => {
            
            //count the number of newlines to find out how many line numbers there are
            if(event.character === "\n") {
                lineCount++;
            }

            //if this is a recent insert event
            if(this.props.recentInserts[event.id]) {
                recentInsert = true;
            } else {
                recentInsert = false;
            }

            //if(this.props.commentHighlightedCode[event.id]) {
            if(recentCommentHighlight[event.id]) {
                commentHighlight = true;
            } else {
                commentHighlight = false;
            }

            //create the code span
            return(<CodeSpan codeEvent={event} recentInsert={recentInsert} commentHighlight={commentHighlight} key={event.id} />);
        });
        
        //create the line numbers for the code window
        let lineNumbers = [];
        for(let lineNumber = 1;lineNumber <= lineCount;lineNumber++) {
            lineNumbers.push(<div className="lineNumber" key={lineNumber}>{lineNumber}. </div>);
        } 

        //create a line number gutter and a code container
        return (
            <div className="codeContainer">
                <div className="lineNumberGutter" style={{"float": "left", "userSelect": "none", "backgroundColor": "lightgray"}}>
                    {lineNumbers}
                </div>
                <div className="codeContainer">
                    {codeSpans}
                </div>
            </div>
        );
    }
}
export default CodeWindow;
import React from 'react';
import CodeSpan from './CodeSpan';

function CodeWindow ({code}) {

    //if there is no code, for example, before the first event is played
    if(!code) {

        //don't display anything
        return null;
    }

    //the number of lines in the file (start with one to handle the last line
    //which will not have a new line yet)
    let lineCount = 1;

    //create the code spans
    const codeSpans = code.map(event => {
        
        //count the number of newlines to find out how many line numbers there are
        if(event.character === "\n") {
            lineCount++;
        }

        //create the code span
        return(<CodeSpan codeEvent={event} key={event.id} />);
    });
    
    //create the line numbers for the code window
    let lineNumbers = [];
    for(let lineNumber = 1;lineNumber <= lineCount;lineNumber++) {
        lineNumbers.push(<div className="lineNumber" key={lineNumber}>{lineNumber}. </div>);
    } 

    //create a line number gutter and a code container
    return (
        <div>
            <div className="lineNumberGutter" style={{"float": "left", "userSelect": "none", "backgroundColor": "lightgray"}}>
                {lineNumbers}
            </div>
            <div className="codeContainer">
                {codeSpans}
            </div>
        </div>
    );
}

export default CodeWindow;
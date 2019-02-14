import React from 'react';
import './CodeSpan.css';

function CodeSpan({codeEvent}) {

    let retVal = null;

    //a single code span may have many different classes, this holds them
    let classNames = [];

    //if the event is a recent insert
    if(codeEvent.recentInsert) {
        
        //add the class
        classNames.push("recentInsert");
        
        //remove the property from the event so it is not marked as relevant after this step
        delete codeEvent.recentInsert;
    }
    
    if(codeEvent.commentHighlight) {

        //add the class
        classNames.push("commentHighlight");
        
        //remove the property from the event so it is not marked as a comment highlight after this step
        delete codeEvent.commentHighlight;
    }

    //handle newlines, tabs, spaces, and regular code by creating a span or br
    if(codeEvent.character === "\n") {
        
        classNames.push("newLine");
        //create a br
        retVal = <br className={classNames.join(" ")}/>
    
    } else if(codeEvent.character === "\r") {
    
        classNames.push("slash-r");
        retVal = <span className={classNames.join(" ")}></span>
    
    } else if(codeEvent.character === "\t") {
    
        classNames.push("tab");
        retVal = <span className={classNames.join(" ")}>&nbsp;&nbsp;&nbsp;&nbsp;</span>
    
    } else if(codeEvent.character === " ") {
    
        classNames.push("space");
        retVal = <span className={classNames.join(" ")}>&nbsp;</span>        
    
    } else {
        classNames.push("code");
        retVal = <span className={classNames.join(" ")}>{codeEvent.character}</span>
    }

    return retVal;
}

export default CodeSpan;
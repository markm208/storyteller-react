import React, { PureComponent } from 'react';
import './CodeSpan.css';

class CodeSpan extends PureComponent {

    render() {

        let retVal = null;

        //a single code span may have many different classes, this holds them
        let classNames = [];

        //if the event is a recent insert
        if (this.props.recentInsert) {

            //add the class
            classNames.push("recentInsert");
        }

        if (this.props.commentHighlight) {

            //add the class
            classNames.push("commentHighlight");
        }

        //handle newlines, tabs, spaces, and regular code by creating a span or br
        if (this.props.codeEvent.character === "\n") {

            classNames.push("newLine");
            //create a br
            retVal = <br className={classNames.join(" ")} />

        } else if (this.props.codeEvent.character === "\r") {

            classNames.push("slash-r");
            retVal = <span className={classNames.join(" ")}></span>

        } else if (this.props.codeEvent.character === "\t") {

            classNames.push("tab");
            retVal = <span className={classNames.join(" ")}>&nbsp;&nbsp;&nbsp;&nbsp;</span>

        } else if (this.props.codeEvent.character === " ") {

            classNames.push("space");
            retVal = <span className={classNames.join(" ")}>&nbsp;</span>

        } else {
            classNames.push("code");
            retVal = <span className={classNames.join(" ")}>{this.props.codeEvent.character}</span>
        }

        return retVal;
    }
}
export default CodeSpan;
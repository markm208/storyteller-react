import React, { PureComponent } from 'react';

class FileTabs extends PureComponent {
    
    //function to call parent function
    fileClicked = (event, fileId) => {
        event.preventDefault();

        //call the parent component's function to indicate which file was selected
        this.props.fileSelected(fileId);
    }
    
    render() {
            
        //an array of file links/buttons to make the selected file display on the screen
        let allFileTabs = [];

        for(let fileId in this.props.allFiles) {

            //get the file name
            let fileName = this.props.allFiles[fileId].currentName;

            //if this file has had some changes in it (create file, insert, or delete)
            if(this.props.filesWithChanges[fileId]) {

                //add an indicator to the file name
                fileName = fileName + " *";

                //add a selectable element with the file name and a recentFileChange class
                allFileTabs.push(
                    <button key={this.props.allFiles[fileId].fileId} 
                            className="recentFileChange"
                            onClick={(event) => this.fileClicked(event, fileId)}>
                        {fileName}
                    </button>
                );

            } else {
                
                //add a selectable element with the file name
                allFileTabs.push(
                    <button key={this.props.allFiles[fileId].fileId} 
                            onClick={(event) => this.fileClicked(event, fileId)}>
                        {fileName}
                    </button>
                );
            }
        }

        return (<div>{allFileTabs}</div>);
    }
}

export default FileTabs;
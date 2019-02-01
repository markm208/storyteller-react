import React from 'react';

function FileTabs({allFiles, filesWithChanges, fileSelected}) {
    
    //function to call parent function
    function fileClicked(event, fileId) {
        event.preventDefault();

        //call the parent component's function to indicate which file was selected
        fileSelected(fileId);
    }
    
    //an array of file links/buttons to make the selected file display on the screen
    let allFileTabs = [];

    for(let fileId in allFiles) {

        //get the file name
        let fileName = allFiles[fileId].currentName;

        //if this file has had some changes in it (create file, insert, or delete)
        if(filesWithChanges[fileId]) {

            //add an indicator to the file name
            fileName = fileName + " *";

            //add a selectable element with the file name and a recentFileChange class
            allFileTabs.push(
                <button key={allFiles[fileId].fileId} 
                        className="recentFileChange"
                        onClick={(event) => fileClicked(event, fileId)}>
                    {fileName}
                </button>
            );

        } else {
            
            //add a selectable element with the file name
            allFileTabs.push(
                <button key={allFiles[fileId].fileId} 
                        onClick={(event) => fileClicked(event, fileId)}>
                    {fileName}
                </button>
            );
        }
    }

    return (<div>{allFileTabs}</div>);
}

export default FileTabs;
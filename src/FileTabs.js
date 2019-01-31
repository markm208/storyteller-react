import React from 'react';

function FileTabs({allFiles, fileSelected}) {
    
    //function to call parent function
    function fileClicked(event, fileId) {
        event.preventDefault();

        //call the parent component's function to indicate which file was selected
        fileSelected(fileId);
    }
    
    //an array of file links/buttons to make the selected file display on the screen
    let allFileTabs = [];

    for(let fileId in allFiles) {

        //add a selectable element
        allFileTabs.push(
            <button key={allFiles[fileId].fileId} 
                    onClick={(event) => fileClicked(event, fileId)}>
                {allFiles[fileId].currentName}
            </button>
        );
    }

    return (<div>{allFileTabs}</div>);
}

export default FileTabs;
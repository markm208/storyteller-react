import React, { Component } from 'react';

class FileSystemView extends Component {

    shouldComponentUpdate (nextProps) {
        for(let dirId in this.props.allDirs) {
            if(dirId in nextProps.allDirs === false) {
                return true;
            }
        }
        for(let dirId in nextProps.allDirs) {
            if(dirId in this.props.allDirs === false) {
                return true;
            }
        }

        for(let fileId in this.props.allFiles) {
            if(fileId in nextProps.allFiles === false) {
                return true;
            }
        }

        for(let fileId in nextProps.allFiles) {
            if(fileId in this.props.allFiles === false) {
                return true;
            }
        }

        return false;
    }
    //This is a recursive function that builds up a global view of the file system.
    //Two objects will be passed in to the function that holds info about the all 
    //the directories (allDirs) and all of the files (allFiles).
    //
    //Example allDirs:
    //{ 
    //  aDirId1: {dirId: "aDirId1", parentDirectoryId: null, currentName: "root"}
    //  aDirId2: {dirId: "aDirId2", parentDirectoryId: "aDirId1", currentName: "dir1"}
    //  aDirId3: {dirId: "aDirId3", parentDirectoryId: "aDirId1", currentName: "dir2"}
    //}
    //
    //Example allFiles:
    //{
    //  aFileId1: {fileId: "aFileId1", parentDirectoryId: "aDirId3", currentName: "file1.txt"}
    //}
    //
    //The function will walk these objects and it will create a single object that looks 
    //something like this:
    //{ 
    //  aDirId1: {
    //    dirId: "aDirId1",
    //    currentName: "root",
    //    allFiles: [],
    //    parentDirectoryId: null,
    //    subDirectories: { 
    //      aDirId2: {...}, 
    //      aDirId3: {..., allFiles: [aFileId1: {...}]}
    //    }
    //}
    getDirectoryFromParentId(dirObject, parentDirId, allDirs, allFiles) {

        //go through all of the directory id properties in the object
        for (let dirId in allDirs) {

            //get a reference to the directory from the object
            const latestDir = Object.assign({}, allDirs[dirId]);

            //if this directory is a child of the passed in parent director id
            if (latestDir.parentDirectoryId === parentDirId) {

                //an array of all of the files in the directory
                const filesInLatestDir = [];

                //go through all of the file id properties
                for (let fileId in allFiles) {

                    //get a file
                    const file = allFiles[fileId];

                    //if the file is a child of the passed in parent directory id
                    if (file.parentDirectoryId === latestDir.dirId) {

                        //add this file to the array
                        filesInLatestDir.push(file);
                    }
                }

                //add a property with all of the files in it
                latestDir["allFiles"] = filesInLatestDir;

                //add a property for all of the sub-directories
                latestDir["subDirectories"] = {};

                //add the directory to the file system object
                dirObject[latestDir.dirId] = latestDir;

                //recurse and add child directories to the file system object
                this.getDirectoryFromParentId(dirObject[latestDir.dirId].subDirectories, latestDir.dirId, allDirs, allFiles);
            }
        }
    }

    //This function creates a UI for the file system object
    createDirectoryListing(directory) {

        //if there are some properties in the directory object 
        if (Object.keys(directory).length > 0) {

            //the ui elements for sub-directories 
            let dirUI = [];

            //go through the properties, each one is a directory
            for (let dirId in directory) {

                //get the latest director
                const latestDir = directory[dirId];

                //holds the file links
                const files = [];

                //go through all of the files in the directory
                //for (let fileId in latestDir.allFiles) {
                latestDir.allFiles.forEach(file => {

                    //create an array of links to the files
                    files.push(
                        <li key={file.fileId}>
                            <a href="#" onClick={(event) => this.fileClicked(event, file.fileId)}>
                                {file.currentName}
                            </a>
                        </li>
                    );
                });

                //create a ui element for the passed in directory
                //include the dir name, all files (if there are any), and a recursive call for the subdirectories
                dirUI.push (
                    <ul key={latestDir.dirId}>
                        <li className="dirName" >
                            {latestDir.currentName}
                        </li>
                        {files.length > 0 ? <ul className="fileLinks">{files}</ul> : null}                        
                        {Object.keys(latestDir.subDirectories).length > 0 ? <span className="subdirs">{this.createDirectoryListing(latestDir.subDirectories)}</span> : null}
                    </ul>
                );
            }

            return dirUI;
        
        } else { //empty object, don't build anything and do not recurse
            return null;
        }
    }

    //function to call parent function
    fileClicked(event, fileId) {
        event.preventDefault();

        //call the parent component's function to indicate which file was selected
        this.props.fileSelected(fileId);
    }
    
    render() {
        //console.log("re-rendering FileSystemView");

        //hold a global view of the file system
        const fileSystemObject = {};

        //build up a global view of the file system
        this.getDirectoryFromParentId(fileSystemObject, null, this.props.allDirs, this.props.allFiles);

        //return a UI of the global view of the file system         
        return this.createDirectoryListing(fileSystemObject);
    }
}

export default FileSystemView;
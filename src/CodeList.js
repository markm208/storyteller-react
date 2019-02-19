//This class is a data structure to easily get all of the code in a 
//file in the order it will be displayed on the page where it is easy
//to insert new code and to delete existing code. It is a linked list
//of 'events' with a hash table that links to the nodes by the event id.
//
//One can turn the linked list into an array of insert events in the
//order that they should show up in the file associated with this
//CodeList with a call to toArray().
//
//The eventMap is the hash table where the keys are event ids and the
//values are references to nodes that hold that event.
//
//The startNode and endNode refer to dummy nodes that are always 
//present. New nodes are always placed in between these.   
class CodeList {

    constructor(codeEvents) {

        //holds mappings between event ids and event nodes
        this.eventMap = {};

        //the first event node (it never holds a real event)
        this.startNode = {
            prev: null,
            event: null,
            next: null
        };

        //events with a prev neighbor id of "none" back up to the first event node 
        this.eventMap["none"] = this.startNode;

        //refers to the latest event node created
        let latestNode = this.startNode;

        //go through all of the code events
        codeEvents.forEach(event => {
            
            //create a new node
            let newNode = {
                prev: latestNode,
                event: event,
                next: null
            };

            //make the latest node refer to the new node
            latestNode.next = newNode;

            //push the latest node reference forward
            latestNode = newNode;

            //store the node in the map
            this.eventMap[event.id] = newNode;
        });

        //add the last node (it never holds a real event and I do not need to add it to the map)
        this.endNode = {
            prev: latestNode,
            event: null,
            next: null
        };

        //make the second to last node refer to the tail node
        latestNode.next = this.endNode;
    }
    
    //retrieves a node based on the id of an event
    retrieveNodeOnId(eventId) {

        //get the node by event id
        let node = this.eventMap[eventId];
        
        //if the node isn't present display an error
        if(!node) {
            console.log(`Inside retrieveNodeOnId()`);        
            console.log(eventId);        
            //this.print();
            throw `Node node with the id: ${eventId} does not exist in the code list`;
        }

        return node;
    }

    //retrieves an event held inside a node based on the id of an event
    retrieveEventOnId(eventId) {

        //get the node and then retrieve the event
        return this.retrieveNodeOnId(eventId).event;
    }

    //adds a new node in the list that holds the passed in event. The node
    //will be placed just after the event's previous neighbor in the list. 
    addCode(event) {
        
        //get the node behind the new 
        let previousNode = this.retrieveNodeOnId(event.previousNeighborId);

        //create a new node with the correct links that has not been deleted
        let newNode = {
            prev: previousNode,
            event: event,
            next: previousNode.next,
            isDeleted: false
        };

        //adjust the nodes around the new node
        previousNode.next = newNode;
        newNode.next.prev = newNode;

        //store a reference to the node in the map
        this.eventMap[event.id] = newNode;
    }

    //removes a node from the list based on an id
    // removeCode(eventId) {

    //     //get the node to remove
    //     let nodeToDelete = this.retrieveNodeOnId(eventId);
        
    //     //adjust the neighbors of the deleted node
    //     nodeToDelete.prev.next = nodeToDelete.next;
    //     nodeToDelete.next.prev = nodeToDelete.prev;

    //     //remove the node from the map
    //     delete this.eventMap[eventId];
    // }

    //used to display an insert event in a playback in the forward direction
    insert(event) {

        //if the event is already in the list because it was inserted and then reverse inserted
        if(event.id in this.eventMap) {

            //retrieve a previously deleted event
            const deletedInsert = this.retrieveNodeOnId(event.id);

            //mark it as not deleted
            deletedInsert.isDeleted = false;

        } else { //this event has never been played back

            //add the new insert event to the code
            this.addCode(event);
        }
    }

    //used to reverse an insert in the backward direction
    reverseInsert(eventId) {

        //get the node with the insert
        const deletedInsert = this.retrieveNodeOnId(eventId);

        //mark it as deleted
        deletedInsert.isDeleted = true;
    }

    //used to delete an insert event in the forward direction
    delete(eventId) {

        //get the insert event that is about to be deleted
        const deletedInsert = this.retrieveNodeOnId(eventId);
        
        //mark it as deleted
        deletedInsert.isDeleted = true;
    }

    //used to reverse a delete in the backward direction
    reverseDelete(eventId) {

        //get the insert event that is being reverse deleted
        const deletedInsert = this.retrieveNodeOnId(eventId);

        //mark it as not deleted
        deletedInsert.isDeleted = false;
    }

    //converts the linked list to an array of events
    toArray() {

        //the insert events in the order they will show up in a file
        let events = [];

        //move through all of the nodes in the list between the startNode and endNode
        let currentNode = this.startNode.next;
        
        //move through the nodes (except the start and end node)
        while(currentNode.next != null) {

            //if the node has not been deleted
            if(currentNode.isDeleted === false) {

                //get the current node's insert event and add it to the return array
                events.push(currentNode.event);
            }

            //move on to the next node
            currentNode = currentNode.next;
        }

        return events;
    }

    //for debugging, print the map and the linked list
    print() {

        //print all the keys in the map
        console.log("Event map:");
        for(let eventId in this.eventMap) {
            console.log(eventId);
        }

        //print something for each of the nodes
        console.log("\nNodes:");
        let currentNode = this.startNode;

        while(currentNode) {
            console.log(`prev: ${currentNode.prev} event: ${currentNode.event? currentNode.event.character : "null"} next: ${currentNode.next}`);

            currentNode = currentNode.next;
        }
    }
}
export default CodeList;
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
class OrderedCodeList {

    constructor() {

        //holds mappings between event ids and event nodes
        this.eventMap = {};

        //the first event node (it never holds a real event)
        this.startNode = {
            prev: null,
            event: null,
            next: null,
            playedState: "Start Node"
        };

        //events with a prev neighbor id of "none" back up to the first event node 
        this.eventMap["none"] = this.startNode;

        //add the last node (it never holds a real event and I do not need to add it to the map)
        this.endNode = {
            prev: this.startNode,
            event: null,
            next: null,
            playedState: "End Node"
        };

        //make the first node's next refer to the tail node
        this.startNode.next = this.endNode;
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
            throw `Node node with the id: ${eventId} does not exist in the ordered code list`;
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

        //create a new node with the correct links
        let newNode = {
            prev: previousNode,
            event: event,
            next: previousNode.next,
            playedState: "Not Played"
        };

        //adjust the nodes around the new node
        previousNode.next = newNode;
        newNode.next.prev = newNode;

        //store a reference to the node in the map
        this.eventMap[event.id] = newNode;
    }

    insertCode(eventId) {

        //get the node to insert
        let nodeToDelete = this.retrieveNodeOnId(eventId);
        
        //mark the event as having been inserted
        nodeToDelete.playedState = "Inserted"
    }

    //deletes a node from the list based on an id
    deleteCode(eventId) {

        //get the node to remove
        let nodeToDelete = this.retrieveNodeOnId(eventId);
        
        //mark the event as having been deleted
        nodeToDelete.playedState = "Deleted"
    }

    //converts the linked list to an array of events
    toArray() {

        //the insert events in the order they will show up in a file
        let events = [];

        //move through all of the nodes in the list between the startNode and endNode
        let currentNode = this.startNode.next;
        
        //move through the nodes (except the start and end node)
        while(currentNode.next != null) {

            //if the current node has been inserted
            if(currentNode.playedState === "Inserted") {

                //get the event
                events.push(currentNode.event);
            }

            //move to the next node
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
export default OrderedCodeList;
let savedFilamentCollection;
chrome.storage.sync.get(["savedFilaments"]).then((result) => {
    savedFilamentCollection = new FilamentCollection(result.savedFilaments);

    loadSwatchButtons( savedFilamentCollection);
});

const observer = new MutationObserver(mutationsList => {
    mutationsList.forEach(mutation => {

        // Check if nodes were added
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
    
            mutation.addedNodes.forEach(addedNode => {
                const swatchCardElements = findAllSwatchCards(addedNode);
                if (swatchCardElements.length > 0) {
                    // Your logic for handling each .swatchcard element
                    swatchCardElements.forEach(swatchCardElement => {
                        addCollectionTools(swatchCardElement, savedFilamentCollection);
                    });
                }
            });
        }
    });
});


function findAllSwatchCards(node) {
    const swatchCardElements = [];
    if (node.nodeType === 1 && node.classList.contains('swatchcard')) {
        // If the current node has the class .swatchcard, add it to the array
        swatchCardElements.push(node);
    }

    // Iterate over descendants
    for (let i = 0; i < node.childNodes.length; i++) {
        const descendants = findAllSwatchCards(node.childNodes[i]);
        swatchCardElements.push(...descendants);
    }

    return swatchCardElements;
}

// Start observing changes in the entire document
observer.observe(document.body, { childList: true, subtree: true });


function loadSwatchButtons(collection) {
    var swatchCards = document.querySelectorAll('.swatchcard');
    swatchCards.forEach(function(card) {
        addCollectionTools(card, collection)
    })
} 

function addCollectionTools(card, collection) {
    var button = document.createElement("button");
    var swatchId = parseInt(card.getAttribute('data-swatch-id'));
        var firstChild = card.firstChild;

        var cardButton = card.insertBefore(button.cloneNode(true), firstChild);
        
        var action = 'add';
        
        if (collection.includesXYZ(swatchId)){
            card.classList.add('inlibrary');
            action = 'remove';
        }

        setButtonImage(cardButton, action);

        cardButton.setAttribute('data-swatch-id', swatchId);
        cardButton.setAttribute('data-library-action', action);
        
        cardButton.onclick = clickHandler;
}

function clickHandler()  {
    var swatchId = parseInt(this.getAttribute('data-swatch-id'));
    var action = this.getAttribute('data-library-action');
    var swatchCard = this.parentNode;
    


    if (action == 'add'){
        savedFilamentCollection.addByXYZ(swatchId);
        savedFilamentCollection.save('savedFilaments')
        setButtonImage(this, "remove");
        this.setAttribute('data-library-action', "remove");
        swatchCard.classList.add('inlibrary');
    }
     else if (action == 'remove') {
        savedFilamentCollection.removeByXYZ(swatchId);
        savedFilamentCollection.save('savedFilaments');
        setButtonImage(this, "add");
        this.setAttribute('data-library-action', "add");
        swatchCard.classList.remove('inlibrary');

    } 
}

function setButtonImage(button, type) {
    
    var imageElement = document.createElement('img');

    if (type == "remove"){
        imageElement.src = chrome.runtime.getURL("images/remove_icon.png");
        imageElement.alt = "Remove swatch from library";

    } else {
        imageElement.src = chrome.runtime.getURL("images/add_icon.png");
        imageElement.alt = "Add swatch to library";      
    }

    button.replaceChildren(imageElement);
     
}


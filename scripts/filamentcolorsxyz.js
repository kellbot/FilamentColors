let savedFilamentCollection;
chrome.storage.sync.get(["savedFilaments"]).then((result) => {
    savedFilamentCollection = new FilamentCollection(result.savedFilaments);

    console.log(result);
    console.log(savedFilamentCollection);

    loadSwatchButtons( savedFilamentCollection);
});



function loadSwatchButtons(collection) {
    var swatchCards = document.querySelectorAll('.swatchcard');
    var button = document.createElement("button")

    swatchCards.forEach(function(card) {
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
    })
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


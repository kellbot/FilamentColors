var button = document.createElement("button")

var swatchList = [];

// Load the swatch library and create buttons
chrome.storage.sync.get(["libraryFilaments"]).then((result) => {
    console.log("Swatch library loaded");
    
    if ( result.libraryFilaments) {
        swatchList = result.libraryFilaments;
    }
    loadSwatchButtons(swatchList);
});


function clickHandler()  {
    var swatchId = this.getAttribute('data-swatch-id');
    var action = this.getAttribute('data-library-action');
    var swatchCard = this.parentNode;
    
    chrome.storage.sync.get(["libraryFilaments"]).then((result) => {
      
        var filaments;
        try {
            filaments = new Set(result.libraryFilaments);
        } catch (error) {
            filaments = new Set([]);
        }
        

        if (action == 'add'){
            filaments.add(swatchId);
            setButtonImage(this, "remove");
            this.setAttribute('data-library-action', "remove");
            swatchCard.classList.add('inlibrary');

        } else if (action == 'remove') {
            filaments.delete(swatchId);
            setButtonImage(this, "add");
            this.setAttribute('data-library-action', "add");
            swatchCard.classList.remove('inlibrary');


        } 

           
        chrome.storage.sync.set({ libraryFilaments: [...filaments] }).then(() => {
            console.log(filaments);
          });
      });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  
    if (changes.libraryFilaments) {
        swatchList = changes.libraryFilaments.newValue;
        sendFilamentCount(changes.libraryFilaments.newValue.length);   
    }
  });

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
  
      if (request.getSwatchCount) {        
        sendFilamentCount(swatchList.length);
      }
    }
  );

function sendFilamentCount(count) {
    const response = chrome.runtime.sendMessage({filamentCount: count}).then((response) => 
    {
        console.log(response);
    });
}

function loadSwatchButtons(swatchArray) {
    var swatchCards = document.querySelectorAll('.swatchcard');
    swatchCards.forEach(function(card) {
        var swatchId = card.getAttribute('data-swatch-id');
        var firstChild = card.firstChild;

        var cardButton = card.insertBefore(button.cloneNode(true), firstChild);
        
        var action = swatchArray.includes(swatchId) ? 'remove' : 'add';
        
        if (swatchArray.includes(swatchId)){
            card.classList.add('inlibrary');
        }

        setButtonImage(cardButton, action);

        cardButton.setAttribute('data-swatch-id', swatchId);
        cardButton.setAttribute('data-library-action', action);
        
        cardButton.onclick = clickHandler;
    })
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


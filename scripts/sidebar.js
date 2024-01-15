const APIURL = 'https://filamentcolors.xyz/api/swatch/';
let filamentCollection;

// Pul
loadSidebar();



// Loads and verifies saved entries
function loadSavedCollection(saveData) {
    let collection = [];
    saveData.forEach((entry) => {
        if ( typeof(entry) == 'CollectedFilament') {
            collection.push(entry);
        } else {
            console.log ("Unexpected save data found:");
            console.log(entry);
        }
    });
    return collection;
}


// Get saved library
function loadSidebar(){

    // fetch the collection data from sync storage
    chrome.storage.sync.get(["savedFilaments"]).then((result) => {

        if ( result.savedFilaments) {
            // Contains entries 
            filamentCollection = loadSavedCollection(result.savedFilaments);
            // Populate swatch list
            refreshSwatches();
        }
    });
}



chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log("Library data changed");
    if (changes.savedFilaments) {
        filamentCollection = loadSavedCollection(result.savedFilaments);
        refreshSwatches();
    }
  });


//this assumes the global filamentcollection is up to date
function refreshSwatches(){

    var swatchul = document.getElementById('swatchlist');
    // Empty out the UL
    while (swatchul.firstChild) {
        swatchul.removeChild(swatchul.firstChild);
    }

    // load or create filament data from filamentcolors.xyz
    chrome.storage.local.get(["xyzFilamentData"]).then( (storage) => 
    {
        let localFilamentColorData = storage.filamentData;

        // This is from the global
        filamentCollection.forEach(function(filamentEntry) {

            // check the local store for the filament
            if (!localFilamentColorData.id) {
                 fetch(APIURL + filamentEntry.id, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                }).then(res => {
                    return res.json();
                }).then(responseData => {
                    if (responseData.id == id) 
                    {
                        localFilamentColorData[id] = responseData;
                        chrome.storage.local.set({filamentData: localFilamentColorData}).then(() => {
                            console.log("Updated filament " + id);
                          });
                    }
                })
            }

            var swatchli = document.createElement("li");
            let swatchdiv = document.createElement("div");

            let swatchdata = localFilamentColorData[id];
            if (swatchdata) {
                swatchdiv.classList.add('colorswatch');
                swatchdiv.style.backgroundColor = '#' + swatchdata.hex_color;
                swatchtext = document.createElement('p');
                
                swatchtext.innerHTML = swatchdata.manufacturer.name + ": " + swatchdata.color_name;

                swatchli.appendChild(swatchdiv);
                swatchli.appendChild(swatchtext);
               
            } else {
                swatchli.innerHTML = id + " loading...";
            }
            swatchul.appendChild(swatchli);
    
        });
    })

    

    

}
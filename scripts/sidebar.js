const APIURL = 'https://filamentcolors.xyz/api/swatch/';

refreshSwatches();




function refreshSwatches() {
    // Load the swatch library and create buttons
    chrome.storage.sync.get(["libraryFilaments"]).then((result) => {
        console.log("Swatch library loaded");
        
        if ( result.libraryFilaments) {
            swatchList = result.libraryFilaments;
        }
        populateSwatchList(swatchList);
    });
}


chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log("Library data changed");
    if (changes.libraryFilaments) {
        refreshSwatches();
    }
  });

function populateSwatchList(ids){

    var swatchul = document.getElementById('swatchlist');
    // Empty out the UL
    while (swatchul.firstChild) {
        swatchul.removeChild(swatchul.firstChild);
    }

    // load or create filament data
    chrome.storage.local.get(["filamentData"]).then( (storage) => 
    {
        let localFilaments = storage.filamentData;
        ids.forEach(function(id) {

            // check the local store for the filament
            if (!localFilaments.id) {
                 fetch(APIURL + id, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                }).then(res => {
                    return res.json();
                }).then(responseData => {
                    if (responseData.id == id) 
                    {
                        localFilaments[id] = responseData;
                        chrome.storage.local.set({filamentData: localFilaments}).then(() => {
                            console.log("Updated filament " + id);
                          });
                    }
                })
            }

            var swatchli = document.createElement("li");
            let swatchdata = localFilaments[id];
            if (swatchdata) {
                swatchli.innerHTML = swatchdata.manufacturer.name + ": " + swatchdata.color_name;
            } else {
                swatchli.innerHTML = id + "loading...";
            }
            swatchul.appendChild(swatchli);
    
        });
    })

    

    

}
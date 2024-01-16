const APIURL = 'https://filamentcolors.xyz/api/swatch/';
var swatchul = document.getElementById('swatchlist');  

let savedFilamentCollection;
chrome.storage.sync.get(["savedFilaments"]).then((result) => {
    savedFilamentCollection = new FilamentCollection(result.savedFilaments);

    loadSidebar(savedFilamentCollection);
});



// Load a FilamentCollection into the sidebar
function loadSidebar(filamentCollection) {
    refreshSwatches(filamentCollection);
}



chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log("Library data changed");
    if (changes.savedFilaments) {
        savedFilamentCollection = new FilamentCollection(changes.savedFilaments.newValue);
        refreshSwatches(savedFilamentCollection);
    }
  });


// Populates the swtch UL
async function refreshSwatches(collection) {


    var storedData = await chrome.storage.local.get(["xyzFilamentData"]);

    let colorDataCache = storedData.xyzFilamentData;

    if (!colorDataCache) colorDataCache = {};

    // Empty out the UL
    while (swatchul.firstChild) {
        swatchul.removeChild(swatchul.firstChild);
    }

    collection.filaments.forEach(filament => {
        if (filament.xyzid){
            if (typeof filament.xyzid === 'string')
                filament.xyzid = parseInt(filament.xyzid);
            if (!colorDataCache[filament.xyzid]) {
                updateXYZ(filament.xyzid).then( (colorData) => {
                    addSwatch(colorData);
                })
            } else {
                addSwatch(colorDataCache[filament.xyzid])
            }
        }
    });

}

function addSwatch(colorData) {

    var swatchli = document.createElement("li");
    let swatchdiv = document.createElement("div");
    swatchdiv.classList.add('colorswatch');
    swatchdiv.style.backgroundColor = '#' + colorData.hex_color;
    swatchtext = document.createElement('p');
    swatchtext.innerHTML = colorData.manufacturer.name + ": " + colorData.color_name;
    swatchli.appendChild(swatchdiv);
    swatchli.appendChild(swatchtext);
    swatchul.appendChild(swatchli);
}

function updateXYZ(xyzid) {
    console.log("Making API call");
    return fetch(APIURL + xyzid, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        }).then(res => {
            return res.json();
        }).then(responseData => {
            if (responseData.id == xyzid) 
            {
                saveColorData(responseData);
                return responseData;
            }
    })
}

function saveColorData(colorData) {
    chrome.storage.local.get(["xyzFilamentData"]).then( (storage) => 
    {
        allData = storage.xyzFilamentData;
        allData[colorData.id] = colorData;
        chrome.storage.local.set({xyzFilamentData: allData});
    });
}

    // load or create filament data from filamentcolors.xyz
    //     chrome.storage.local.get(["xyzFilamentData"]).then( (storage) => 
    //     {
    //         let localFilamentColorData = storage.filamentData;

    //         // This is from the global
    //         filamentCollection.forEach(function(filamentEntry) {

    //             // check the local store for the filament
    //             if (!localFilamentColorData.id) {
    //                  fetch(APIURL + filamentEntry.id, {
    //                 method: 'GET',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //                 }).then(res => {
    //                     return res.json();
    //                 }).then(responseData => {
    //                     if (responseData.id == id) 
    //                     {
    //                         localFilamentColorData[id] = responseData;
    //                         chrome.storage.local.set({filamentData: localFilamentColorData}).then(() => {
    //                             console.log("Updated filament " + id);
    //                           });
    //                     }
    //                 })
    //             }



    //             let swatchdata = localFilamentColorData[id];
    //             if (swatchdata) {
    //                 

    //             } else {
    //                 swatchli.innerHTML = id + " loading...";
    //             }
    //             swatchul.appendChild(swatchli);

    //         });
    //     })


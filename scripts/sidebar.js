const APIURL = 'https://filamentcolors.xyz/api/';
const SWATCHENDPOINT = 'swatch/'
var swatchul = document.getElementById('swatchlist');  

let savedFilamentCollection;
let savedBrands;
let customFilaments = new TinyStore({autoincrement: true}) ;

let customButton = document.getElementById("customButton");
let customForm = document.getElementById("customFilamentForm");
let saveCustomButton = document.getElementById("saveCustom");
let collectionButton = document.getElementById("collectionButton");

var colorPicker = new JSColor('#hexColorPicker', {format:'hex', hash: false});

chrome.storage.local.get(["xyzBrandData"]).then((result) => {
    
    if (!result.xyzBrandData || result.xyzBrandData.length < 1) {
        getBrandData().then( (brands) => { populateManufacturers(brands) }       );
    } else {
        savedBrands = result.xyzBrandData;
        populateManufacturers(savedBrands);
    }
    
});

chrome.storage.sync.get(["savedFilaments", "customTinyStore"]).then((result) => {
    savedFilamentCollection = new FilamentCollection(result.savedFilaments);
    customFilaments.import(result.customTinyStore);
    loadSidebar(savedFilamentCollection);
    refreshCustoms(customFilaments.data);
});



// Load a FilamentCollection into the sidebar
function loadSidebar(filamentCollection) {
    refreshSwatches(filamentCollection);
    addButtonListeners(filamentCollection);

}



chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log("Library data changed");
    if (changes.savedFilaments) {
        savedFilamentCollection = new FilamentCollection(changes.savedFilaments.newValue);
        refreshSwatches(savedFilamentCollection);
    }
  });

function addButtonListeners(collection) {
    // link to filament collection

    collectionButton.onclick = (function (){
        chrome.tabs.create({ url: collection.xyzURL() });
    });

    // custom filament button
    customButton.onclick = (function (){
        customForm.style.display = 'block';
        this.style.display = 'none';
    });

    saveCustomButton.onclick = (function (){
        let fd = new FormData(customForm);
        var jsonData = {};
        fd.forEach((value, key) => {
                jsonData[key] = value;
                
            });

            // Log the JSON objectol
            customFilaments.add(jsonData);
           chrome.storage.sync.set({customTinyStore: customFilaments.export()});
            refreshCustoms(customFilaments.data);
            return false;
    });
}

function refreshCustoms(customList){

    if (!customList) return false;
    let customul = document.getElementById('customlist');
    while (customul.firstChild) {
        customul.removeChild(customul.firstChild);
    }

    Object.keys(customList).forEach(key => {
        let brandId = parseInt(customList[key].brand);

        if (brandId){
            addSwatch({hex: customList[key].hex, brand: savedBrands[brandId].name, name: customList[key].description }, customul)

        } else {
            console.log("Brand ID missing");
            console.log(brandId);
            console.log(savedBrands);
            console.log(customList);
        }
    })
}


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
                    addSwatch({hex: colorData.hex_color, brand: colorData.manufacturer.name, name: colorData.color_name}, swatchul);
                })
            } else {
                let swatchData = colorDataCache[filament.xyzid];
                addSwatch({hex: swatchData.hex_color, brand: swatchData.manufacturer.name, name: swatchData.color_name}, swatchul);
            }
        }
    });

}

function addSwatch({hex, brand, name}, domul) {


    var swatchli = document.createElement("li");
    let swatchdiv = document.createElement("div");
    swatchdiv.classList.add('colorswatch');
    swatchdiv.style.backgroundColor = '#' + hex;
    swatchtext = document.createElement('p');
    swatchtext.classList.add('tooltip');
    swatchtext.innerHTML = brand + ": " + name;
    
    swatchdiv.appendChild(swatchtext);
    swatchli.appendChild(swatchdiv);
    domul.appendChild(swatchli);
}

function updateXYZ(xyzid) {
    console.log("Making API call");
    return fetch(APIURL + SWATCHENDPOINT + xyzid, {
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

async function getBrandData() {
    console.log("Making API call");

        var nextURL = APIURL + 'manufacturer/';
        var savedBrands = {};
        let i = 0;
        while (nextURL) {

            await fetch (nextURL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then(res => {
                return res.json();
            }).then(responseData => {
    
                if (responseData.results) {
                    nextURL = responseData.next;
                    let pageBrands = {};
                    responseData.results.forEach((result) => {
                        savedBrands[result.id] = result
                    });
                }
                return false;
            })
            i++;
            if (i == 5) nextURL = false;
        }
        return chrome.storage.local.set({xyzBrandData: savedBrands}).then(() => savedBrands);
        

}

function saveColorData(colorData) {
    chrome.storage.local.get(["xyzFilamentData"]).then( (storage) => 
    {
        allData = storage.xyzFilamentData? storage.xyzFilamentData : {};
        allData[colorData.id] = colorData;
        chrome.storage.local.set({xyzFilamentData: allData});
    });
}

// Function to populate the dropdown with random names and values
function populateManufacturers(brands) {
    const dropdown = document.getElementById('brandSelector');
    if (!brands) throw new Error("Brand data not found");

    let sortableArray = [];
    Object.keys(brands).forEach((i) => {
       sortableArray.push(brands[i]); 
    });
    sortableArray.sort((a, b) => {
        return a.name.localeCompare(b.name);
    })

    sortableArray.forEach((brand) => {

    
        const option = document.createElement('option');
        const brandName = brand.name;
        const brandvalue = brand.id;

        option.text = brandName;
        option.value = brandvalue;

        dropdown.add(option);
    });
}
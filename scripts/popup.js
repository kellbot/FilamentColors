
function getSwatchList(event) 
{
    console.log("Loading swatch list");
    chrome.storage.sync.get(["libraryFilaments"]).then((result) => {
        var swatchList = [];
        if ( result.libraryFilaments) {
            swatchList = result.libraryFilaments;
        }
        let url = "https://filamentcolors.xyz/library/collection/" + swatchList.join(",") + "/";
        console.log(url);
        this.setAttribute('href', url);

        chrome.tabs.create({ url: url });
    });
}
console.log("Script loaded");
document.getElementById('collectionList').addEventListener('click', getSwatchList);
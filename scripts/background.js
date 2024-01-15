function updateFilamentCount(count) {
  let countString =  " " + count  + " ";
  chrome.action.setBadgeText({ text: countString});
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.filamentCount) {        
      updateFilamentCount(request.filamentCount);
      sendResponse({text: "Updated badge to " + request.filamentCount});
    }
  }
);

const filamentcolors = 'https://filamentcolors.xyz'

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(filamentcolors)) {

  await chrome.scripting.executeScript({
      target : {tabId : tab.id},
      files : [ "scripts/library.js" ],
  })
.then(() => {
  chrome.runtime.sendMessage({getSwatchCount:true}).then((response, sender, sendResponse) => 
  {
    updateFilamentCount(response.filamentCount)
  });

});

     
       
      
    }
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    if (changeInfo.url && changeInfo.url.startsWith(filamentcolors)) {
      chrome.scripting.executeScript({
        target : {tabId : tab.id},
        files : [ "scripts/library.js" ],
    })
    }
  });
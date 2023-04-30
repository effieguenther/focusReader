console.log("background running")

chrome.runtime.onMessage.addListener(gotMessage) 

function gotMessage(msg, sender, sendResponse) {
    console.log(message.txt);
};

document.addEventListener("DOMContentLoaded", () => {
    HALF_BOLD_SWITCH = document.querySelector('#halfBold') 
    if (HALF_BOLD_SWITCH) {console.log("switch located")};

    HALF_BOLD_SWITCH.addEventListener('click', () => {
        chrome.tabs.query({active: true}, (tabs) => {
            const tab = tabs[0];
            if (tab) {
                chrome.scripting.executeScript(
                    {
                        target:{tabId: tab.id, allFrames: true},
                        func: halfBoldFunction
                    },
                    
                )
            } else {
                alert("there are no active tabs");
            }
        })         
     });

     function halfBoldFunction() {
        console.log("function called");
        document.querySelector("body").style.color = "red";
     }
});
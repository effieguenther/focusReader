document.addEventListener("DOMContentLoaded", () => {
    const HALF_BOLD_SWITCH = document.querySelector('#halfBold'); 
    
    //load the saved state of the checkbox
    //requires storage permission in manifest.json
    chrome.storage.sync.get("halfBoldEnabled", (data) => {
        HALF_BOLD_SWITCH.checked = data.halfBoldEnabled;
    });

    HALF_BOLD_SWITCH.addEventListener("change", () => {
        //save the state of the checkbox
        chrome.storage.sync.set({halfBoldEnabled: HALF_BOLD_SWITCH.checked});
        
        //locate the current tab and use programmatic injection to call a function which executes within the tab, and not within the isolated popup window
        chrome.tabs.query({active: true}, (tabs) => {
            const tab = tabs[0];
            if (tab) {
                //requrires scripting permission in manifest.json
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
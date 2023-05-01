document.addEventListener("DOMContentLoaded", () => {
    const HALF_BOLD_SWITCH = document.querySelector('#halfBold'); 
    
    //load the saved state of the checkbox
    //requires storage permission in manifest.json
    /*chrome.storage.sync.get("halfBoldEnabled", () => {
        HALF_BOLD_SWITCH.checked = data.halfBoldEnabled;
    });
    console.log(data.halfBoldEnabled);*/

    HALF_BOLD_SWITCH.addEventListener("change", () => {
        //save the state of the checkbox
        /*chrome.storage.sync.set({halfBoldEnabled: HALF_BOLD_SWITCH.checked});
        console.log(data.halfBoldEnabled);*/
        
        //locate the current tab and use programmatic injection to call a function which executes within the tab, and not within the isolated popup window
        chrome.tabs.query({active: true}, (tabs) => {
            const tab = tabs[0];
            if (tab) {
                if (HALF_BOLD_SWITCH.checked) {
                //requrires scripting permission in manifest.json
                chrome.scripting.executeScript(
                    {
                        target:{tabId: tab.id, allFrames: true},
                        func: halfBoldFunction
                    },
                    
                )
                } else {
                    chrome.scripting.executeScript(
                        {
                            target:{tabId: tab.id, allFrames: true},
                            func: returnToDefault
                        },
                        
                    ) 
                }
            } else {
                alert("there are no active tabs");
            }
        })         
     });

     function halfBoldFunction() {
        console.log("halfBoldFunction called");
        const PARAGRAPHS = document.querySelectorAll("p");
        
        for (let i = 0; i < PARAGRAPHS.length; i++) {
            const WORDS = PARAGRAPHS[i].textContent.split(" ");

            for (let i = 0; i < WORDS.length; i++) {
                const word = WORDS[i];
                const halfLength = Math.ceil(word.length / 2);
                const firstHalf = word.slice(0, halfLength);
                const secondHalf = word.slice(halfLength);
                WORDS[i] = `<b>${firstHalf}</b>${secondHalf}`;
            }
            PARAGRAPHS[i].innerHTML = WORDS.join(" ");
        }  
     }

     function returnToDefault() {
        console.log("returnToDefault called");
        document.querySelector("body").style.color = "";
     }
});
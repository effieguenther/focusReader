//run this file only when the popup is opened
document.addEventListener("DOMContentLoaded", () => {
    const HALF_BOLD_SWITCH = document.querySelector('#halfBold'); 
    const COMIC_SANS_SWITCH = document.querySelector('#comicSans');
    
    //load the saved state of the checkbox
    //requires storage permission in manifest.json
    chrome.storage.local.get("halfBoldEnabled", (data) => {
        HALF_BOLD_SWITCH.checked = data.halfBoldEnabled;
        console.log(data.halfBoldEnabled);
    });

    chrome.storage.local.get("comicSansEnabled", (data) => {
        COMIC_SANS_SWITCH.checked = data.comicSansEnabled;
    });


    HALF_BOLD_SWITCH.addEventListener("change", () => {
        //save the state of the checkbox
        chrome.storage.local.set({halfBoldEnabled: HALF_BOLD_SWITCH.checked});
        console.log(HALF_BOLD_SWITCH.halfBoldEnabled);
        
        //locate the current tab and use programmatic injection to call a function which executes within the tab, and not within the isolated popup window
        //requrires scripting permission in manifest.json
        chrome.tabs.query({active: true}, (tabs) => {
            const tab = tabs[0];
            if (tab) {
                if (HALF_BOLD_SWITCH.checked) {
                chrome.scripting.executeScript(
                    {
                        target:{tabId: tab.id, allFrames: false},
                        func: halfBoldFunction
                    },
                    
                )
                } else {
                    chrome.scripting.executeScript(
                        {
                            target:{tabId: tab.id, allFrames: false},
                            func: returnToDefault
                        },
                        
                    ) 
                }
            } else {
                alert("there are no active tabs");
            }
        })         
     });

     COMIC_SANS_SWITCH.addEventListener("change", () => {
        chrome.storage.local.set({comicSansEnabled: COMIC_SANS_SWITCH.checked})

        chrome.tabs.query({active: true}, (tabs) => {
            const tab = tabs[0];
            if (tab) {
                if (COMIC_SANS_SWITCH.checked) {
                chrome.scripting.executeScript(
                    {
                        target:{tabId: tab.id, allFrames: false},
                        func: comicSansFunction
                    },
                    
                )
                } else {
                    chrome.scripting.executeScript(
                        {
                            target:{tabId: tab.id, allFrames: false},
                            func: returnStyleToDefault
                        },
                        
                    ) 
                }
            } else {
                alert("there are no active tabs");
            }
        })         
     })

     function halfBoldFunction() {
        console.log("halfBoldFunction called");
        const PARAGRAPHS = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6");
        const originalContent = [];
        
        for (let i = 0; i < PARAGRAPHS.length; i++) {
            originalContent.push(PARAGRAPHS[i].textContent);
            const WORDS = PARAGRAPHS[i].textContent.split(" ");

            for (let j = 0; j < WORDS.length; j++) {
                const word = WORDS[j];
                const halfLength = Math.ceil(word.length / 2);
                const firstHalf = word.slice(0, halfLength);
                const secondHalf = word.slice(halfLength);
                WORDS[j] = `<b>${firstHalf}</b>${secondHalf}`;
            }
            PARAGRAPHS[i].innerHTML = WORDS.join(" ");
        }  
        chrome.storage.local.set({originalContent: originalContent}, function(){
            console.log(originalContent);
        });
     }

     function returnToDefault() {
        console.log("returnToDefault called");
        chrome.storage.local.get(['originalContent'], function(result) {
            const PARAGRAPHS = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6");
            for (let i = 0; i < PARAGRAPHS.length; i++) {
                PARAGRAPHS[i].innerHTML = result.originalContent[i];
            }
         }) 
    };

    function comicSansFunction() {
        chrome.storage.local.set({originalFont: document.body.style.fontFamily});
        const elements = document.querySelectorAll("*");
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.fontFamily = "Comic Sans MS, sans-serif";
        };
    };

    function returnStyleToDefault() {
        chrome.storage.local.get("originalFont", (data) => {
            let originalFont = data.originalFont;
            const elements = document.querySelectorAll("*");
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.fontFamily = originalFont;
            };
        });
    };
});
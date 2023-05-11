//run this file only when the popup is opened
document.addEventListener("DOMContentLoaded", () => {
    const HALF_BOLD_SWITCH = document.querySelector('#halfBold'); 
    const COMIC_SANS_SWITCH = document.querySelector('#comicSans');
    const INCREASE_SPACING_SWITCH = document.querySelector('#increaseSpacing');
    
    //load the saved state of the checkboxes
    //requires storage permission in manifest.json
    chrome.storage.local.get("halfBoldEnabled", (data) => {
        HALF_BOLD_SWITCH.checked = data.halfBoldEnabled;
    });
    chrome.storage.local.get("comicSansEnabled", (data) => {
        COMIC_SANS_SWITCH.checked = data.comicSansEnabled;
    });
    chrome.storage.local.get("increaseSpacingEnabled", (data) => {
        INCREASE_SPACING_SWITCH.checked = data.increaseSpacingEnabled;
    })


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
                            func: returnFontToDefault
                        },
                        
                    ) 
                }
            } else {
                alert("there are no active tabs");
            }
        })         
     })

     INCREASE_SPACING_SWITCH.addEventListener("change", () => {
        chrome.storage.local.set({increaseSpacingEnabled: INCREASE_SPACING_SWITCH.checked})

        chrome.tabs.query({active: true}, (tabs) => {
            const tab = tabs[0];
            if (tab) {
                if (INCREASE_SPACING_SWITCH.checked) {
                chrome.scripting.executeScript(
                    {
                        target:{tabId: tab.id, allFrames: false},
                        func: increaseSpacingFunction
                    },
                    
                )
                } else {
                    chrome.scripting.executeScript(
                        {
                            target:{tabId: tab.id, allFrames: false},
                            func: returnSpacingToDefault
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
        const PARAGRAPHS = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6");
        const originalContent = [];
        
        for (let i = 0; i < PARAGRAPHS.length; i++) {
            //original innerHTML of the element is loaded into an array
            originalContent.push(PARAGRAPHS[i].textContent);
            
            const WORDS = PARAGRAPHS[i].textContent.split(" ");
            for (let j = 0; j < WORDS.length; j++) {
                const word = WORDS[j];
                //isolates the first half and second half of the word
                const halfLength = Math.ceil(word.length / 2);
                const firstHalf = word.slice(0, halfLength);
                const secondHalf = word.slice(halfLength);
                //replaces each word with the first half bolded
                WORDS[j] = `<b>${firstHalf}</b>${secondHalf}`;
            }
            //applies each half-bolded word back into the text content of the element
            PARAGRAPHS[i].innerHTML = WORDS.join(" ");
            
        } 
        //stores the original text content of the elements
        chrome.storage.local.set({originalContent: originalContent}, function(){});
     }

     function returnToDefault() {
        console.log("returnToDefault called");
        chrome.storage.local.get(['originalContent'], function(result) {
            const elements = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6");
            for (let i = 0; i < elements.length; i++) {
                elements[i].innerText = result.originalContent[i];
            }
         })
    };

    function comicSansFunction() {
        console.log("comic sans function called");
        chrome.storage.local.set({originalFont: document.body.style.fontFamily});
        const elements = document.querySelectorAll("*");
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.fontFamily = "Comic Sans MS, sans-serif";
        };
    };

    function increaseSpacingFunction() {
        console.log("increase spacing function called");
        const elements = document.querySelectorAll("*");
        for (let i=0; i < elements.length; i++) {
            elements[i].style.letterSpacing = "0.1em"; 
            elements[i].style.lineHeight = "2em";
        }
    }

    function returnFontToDefault() {
        chrome.storage.local.get("originalFont", (data) => {
            let originalFont = data.originalFont;
            const elements = document.querySelectorAll("*");
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.fontFamily = originalFont;
            };
        });
    };

    function returnSpacingToDefault() {
        const elements = document.querySelectorAll("*");
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.letterSpacing = "normal";
            elements[i].style.lineHeight = "normal";
        };
    }

});
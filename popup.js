//run this file only when the popup is opened
document.addEventListener("DOMContentLoaded", () => {
    const HALF_BOLD_SWITCH = document.querySelector('#halfBold'); 
    const FONT_SELECT = document.querySelector('#fonts');
    const INCREASE_SPACING_SWITCH = document.querySelector('#increaseSpacing');
    
    //load the saved state of the checkboxes with an async function
    //requires storage permission in manifest.json
    async function getData() {
        try {
            const data1 = await chrome.storage.local.get("halfBoldEnabled");
            HALF_BOLD_SWITCH.checked = data1.halfBoldEnabled;
        
            const data2 = await chrome.storage.local.get("fontSelected");
            FONT_SELECT.value = data2.fontSelected;
        
            const data3 = await chrome.storage.local.get("increaseSpacingEnabled");
            INCREASE_SPACING_SWITCH.checked = data3.increaseSpacingEnabled;
        } catch (error) {
            console.error(error);
        };
    };
    getData();

    //store the original font of the page
    if (FONT_SELECT.value === "") {
        chrome.storage.local.set({originalFont: document.body.style.fontFamily});
    };

//this code runs when the half bold switch is clicked
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

//this code runs when a new option is selected in the font drop down menu
     FONT_SELECT.addEventListener("change", function() {
        //store the option which is selected

        chrome.storage.local.set({fontSelected: this.value });
        console.log(this.value);

        chrome.tabs.query({active: true}, (tabs) => {
            const tab = tabs[0];
            if (tab) {
                chrome.scripting.executeScript(
                    {
                        target:{tabId: tab.id, allFrames: false},
                        func: fontFunction
                    },
                    
                );
            } else {
                alert("there are no active tabs");
            };
        });         
     });

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

    async function fontFunction() {
        console.log("font function called");
        let currentFont = "";
        let originalFont = "";
        const elements = document.querySelectorAll("*");


        //retrieve the font which is currently selected and the original font of the page
        async function getFontData() {
            try {
                const data1 = await chrome.storage.local.get("fontSelected");
                currentFont = data1.fontSelected;

                const data2 = await chrome.storage.local.get("originalFont");
                originalFont = data2.originalFont;
            } catch (error) {
                console.error(error);
            };
        };
        await getFontData();
        console.log(currentFont);

        //if the font selected is "" (default option) then the current font should be the original font of the page
        if (currentFont === "") {
            currentFont = originalFont;
        };

        for (let i = 0; i < elements.length; i++) {
            elements[i].style.fontFamily = currentFont;
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
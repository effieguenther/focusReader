console.log("script running");

const halfBoldSwitch = document.querySelector("#halfBold");

halfBoldSwitch.addEventListener('click', () => {
    if (halfBoldSwitch.checked) {
        console.log("box checked");
    } else {
        console.log("box unchecked");
    }
})
document.addEventListener("DOMContentLoaded", () => {
    console.log("popup opened");
    const HALF_BOLD_SWITCH = document.querySelector("#halfBold");

    HALF_BOLD_SWITCH.addEventListener('click', () => {
        if (HALF_BOLD_SWITCH.checked) {
            console.log("box checked")
        } else {
            console.log("box unchecked");
        }
    })
})



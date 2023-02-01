const menuBtn = document.querySelector(".menubar div");
const modal = document.querySelector(".menu");
menuBtn.addEventListener("click", () => {
    modal.style.display = "block";

    modal.classList.remove("menuSlideOut"),
        void modal.offsetWidth;
    void modal.offsetWidth,
        modal.classList.add("menuSlideIn");
})

modal.addEventListener("click", () => {
    void modal.offsetWidth,
        modal.classList.add("menuSlideOut");

    modal.classList.remove("menuSlideIn"),
        void modal.offsetWidth;
    setTimeout(function () { modal.style.display = "none"; }, 450);
})


const adBox = document.querySelectorAll(".ad");
function AdPC() {
    const adSetNum = Math.floor(Math.random() * 5 + 1);
    return `/img/PC_${adSetNum}.png`;
}

function AdMobile() {
    const adSetNum = Math.floor(Math.random() * 5 + 1);
    return `/img/MOBILE_${adSetNum}.png`;
}

window.addEventListener('DOMContentLoaded', function () {
    if (window.innerWidth >= 1200) {
        adBox[0].src = AdPC();
        adBox[1].src = AdPC();
    } else if (window.innerWidth < 1200) {
        adBox[0].src = AdMobile();
        adBox[1].src = AdMobile();
    }
});

let delay = 300;
let timer = null;

window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
        if (window.innerWidth >= 1200) {
            adBox[0].src = AdPC();
            adBox[1].src = AdPC();
        } else if (window.innerWidth < 1200) {
            adBox[0].src = AdMobile();
            adBox[1].src = AdMobile();
        }
    }, delay);
});

document.addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
    };
  }, true);
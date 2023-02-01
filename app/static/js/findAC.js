document.querySelector(".findACSubmit").addEventListener("click", () => {
    const tel = document.getElementById("findTel");
    const name = document.getElementById("findName");

    if (/^010-[0-9]{4}-[0-9]{4}$/.test(tel.value)) {
        console.log('전화번호 형식 통과');
        if(/^[가-힣]+$/g.test(name.value)) {
            console.log('이름 형식 통과');
            tel.setCustomValidity('');
            name.setCustomValidity('');
        }else {
            name.setCustomValidity("이름 형식이 다릅니다.");
        }
    } else {        
        tel.setCustomValidity("전화번호 형식이 다릅니다.");
    } 
})

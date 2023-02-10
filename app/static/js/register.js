
document.getElementById("overlapCheck").addEventListener("click", () => {
    const innerId = document.getElementById('userId').value;
    if (innerId.length < 6) {
        alert('아이디의 길이는 6자보다 커야합니다.')
    } else {
        location.href = `/overlapCheck?innerId=${innerId}`;
    }
})

function Input(e) {
    e.value = e.value.replace(/[^a-zA-Z0-9]/ig, '')
}

const autoHyphen = (target) => {
    target.value = target.value.replace(/[^0-9]/g, '').replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3").replace(/(\-{1,2})$/g, "");
}

document.querySelector(".regSubmit").addEventListener("click", () => {
    const pw = document.querySelector("#password");
    const pwCheck = document.querySelector("#passwordCheck");
    const name = document.getElementById("userName");
    const tel = document.getElementById("tel");
    let essential = document.querySelector('input[name="individualInfo"]:checked');
    let NoEssential = document.getElementById("noEssential");
    if(pw.value == pwCheck.value){
        pwCheck.setCustomValidity('');
        if(/^[가-힣]+$/g.test(name.value)){
            name.setCustomValidity('');
            if(essential.value == 1){
                NoEssential.setCustomValidity('');
                if(/^[0-9]{3}-[0-9]{4}-[0-9]{4}/.test(tel.value)){
                    tel.setCustomValidity('');
                }else {
                    tel.setCustomValidity('전화번호 형식이 잘못되었습니다.');
                }
            } else {
                NoEssential.setCustomValidity("필수동의사항입니다.");
            }
        } else {
            name.setCustomValidity("이름 형식이 잘못됬습니다.");
        }
    } else {
        pwCheck.setCustomValidity("비밀번호가 불일치합니다.");
    }

})
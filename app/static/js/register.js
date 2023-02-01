
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

document.querySelector(".regSubmit").addEventListener("click", () => {
    const pw = document.querySelector("#password");
    const pwCheck = document.querySelector("#passwordCheck");
    const tel = document.getElementById("tel");
    const name = document.getElementById("userName");
    let essential = document.querySelector('input[name="individualInfo"]:checked');
    let NoEssential = document.getElementById("noEssential");

    if (essential.value == '1') {
        console.log('필수항목 통과');
        if (pw.value === pwCheck.value) {
            console.log('비밀번호 재확인 통과');
            if (/^010-[0-9]{4}-[0-9]{4}$/.test(tel.value)) {
                console.log('전화번호 형식 통과');
                if(/^[가-힣]+$/g.test(name.value)) {
                    console.log('이름 형식 통과');
                    name.setCustomValidity('');
                    tel.setCustomValidity('');
                    pwCheck.setCustomValidity('');
                    NoEssential.setCustomValidity('');
                }else {
                    name.setCustomValidity("이름 형식이 다릅니다.");
                }
            } else {
                tel.setCustomValidity("전화번호 형식이 다릅니다.");
            }
        } else {
            pwCheck.setCustomValidity("비밀번호가 다릅니다.");
        }
    } else{
        essential.setCustomValidity('필수 동의 사항입니다.');
    }

})
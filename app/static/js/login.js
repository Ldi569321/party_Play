if (document.getElementById("overlapCheck") != undefined) {
    document.getElementById("overlapCheck").addEventListener("click", () => {
        const innerId = document.getElementById('userId').value;
        if (innerId.length < 6) {
            alert('아이디의 길이는 6자보다 커야합니다.')
        } else {
            location.href = `/overlapCheck?innerId=${innerId}`;
        }
    })
}


function Input(e) {
    e.value = e.value.replace(/[^a-zA-Z0-9]/ig, '')
}

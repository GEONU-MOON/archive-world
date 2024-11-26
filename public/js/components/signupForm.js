function signupForm() {
  // 이미 스타일시트가 로드되어 있는지 확인
  if (!document.querySelector("link[href='/css/signup.css']")) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/signup.css";
    document.head.appendChild(link);
  }

  const content = `
    <form id="signupForm">
        <div class="header">
            <img src="/resource/images/pretzel.svg" alt="Pretzel Logo">
            <h2>회원가입</h2>
        </div>
        <label for="signupUserId">아이디</label>
        <input type="text" id="signupUserId" name="signupUserId" placeholder="아이디를 입력해주세요." required />
        <label for="signupPassword">비밀번호</label>
        <input type="password" id="signupPassword" name="signupPassword" placeholder="비밀번호를 입력해주세요." required />
        <label for="signupPasswordConfirm">비밀번호 확인</label>
        <input type="password" id="signupPasswordConfirm" name="signupPasswordConfirm" placeholder="비밀번호를 다시 입력해주세요." required />
        <div class="button-group">
            <button type="submit">회원가입 완료</button>
            <button type="button" onclick="window.location.href='/login'">돌아가기</button>
        </div>
    </form>
  `;

  setTimeout(() => {
    const form = document.getElementById("signupForm");
    form.addEventListener("submit", handleSignup);
  }, 0);

  return content;
}

function handleSignup(event) {
  event.preventDefault();

  const userId = document.getElementById("signupUserId").value;
  const password = document.getElementById("signupPassword").value;
  const passwordConfirm = document.getElementById("signupPasswordConfirm").value;

  if (password !== passwordConfirm) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  const newUser = {
    user_id: userId,
    user_pw: password,
  };

  fetch("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  })
    .then(response => {
      if (response.ok) {
        alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
        window.location.href = "/login";
      } else {
        return response.json().then(data => {
          throw new Error(data.error || "회원가입 중 오류가 발생했습니다.");
        });
      }
    })
    .catch(error => {
      console.error("Error:", error);
      alert(error.message);
    });
}

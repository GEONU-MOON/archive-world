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

  return content;
}

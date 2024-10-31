function getAccessToken() {
  return sessionStorage.getItem("accessToken");
}

// Base64Url 디코딩 함수
function base64UrlDecode(base64Url) {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  let padding = base64.length % 4;
  if (padding > 0) {
    base64 += "=".repeat(4 - padding);
  }
  let binaryString = atob(base64);
  let bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  let decoder = new TextDecoder("utf-8");
  return decoder.decode(bytes);
}

// JWT 디코딩 함수
function decodeJwt(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT token");
  }
  const payload = parts[1];
  const decodedPayload = base64UrlDecode(payload);
  return JSON.parse(decodedPayload);
}

function handleLogout() {
  // 서버에 로그아웃 요청 전송
  fetch("/auth/logout", {
    method: "POST",
    credentials: "include", // 쿠키 전송
  })
    .then(response => {
      if (response.ok) {
        sessionStorage.removeItem("accessToken");
        window.location.assign("/");
      } else {
        alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
      }
    })
    .catch(error => {
      alert("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
    });
}

function changeLoginButton() {
  const loginWrapper = document.querySelector(".login-wrapper");
  const loginBtn = loginWrapper.querySelector("button");
  const token = getAccessToken();
  if (token) {
    const currentUserSpan = document.createElement("span");
    currentUserSpan.textContent = `${decodeJwt(token).userId}님`;
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "로그아웃";
    logoutBtn.addEventListener("click", handleLogout);
    loginWrapper.insertBefore(currentUserSpan, loginBtn);
    loginWrapper.replaceChild(logoutBtn, loginBtn);
  }
}
changeLoginButton();

function preventLoginAccess(url) {
  if (url === "/login" && getAccessToken() != null) {
    window.location.assign("/");
    return false;
  }
  return true;
}
preventLoginAccess(window.location.pathname);

// 서버에 api요청을 보낼 때 액세스 토큰을 헤더에 포함시키는 함수 -> 추후 사용시 수정
async function fetchWithToken(url, options = {}) {
  const token = getAccessToken();
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, fetchOptions);
    return response;
  } catch (error) {
    throw error;
  }
}

// 토큰 갱신 함수
async function requestNewAccessToken() {
  try {
    const response = await fetch("/auth/token", {
      method: "POST",
      credentials: "include", // 쿠키를 전송하기 위해 사용
    });

    if (response.ok) {
      const data = await response.json();
      sessionStorage.setItem("accessToken", data.accessToken); // 새로운 액세스 토큰 저장
    } else {
      handleLogout();
    }
  } catch (error) {
    handleLogout();
  }
}

// 토큰 만료 확인 및 갱신 함수
function validateTokenAndRefreshIfExpired() {
  const token = getAccessToken();
  if (token) {
    const decodedToken = decodeJwt(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (decodedToken.exp && decodedToken.exp < currentTime) {
      requestNewAccessToken();
    }
  }
}

const TOKEN_REFRESH_INTERVAL_MINUTES = 30;
const TOKEN_REFRESH_INTERVAL_MS = TOKEN_REFRESH_INTERVAL_MINUTES * 60 * 1000;

setInterval(validateTokenAndRefreshIfExpired, TOKEN_REFRESH_INTERVAL_MS);

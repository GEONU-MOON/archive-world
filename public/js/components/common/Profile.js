function handleUploadButtonState() {
  const uploadButton = document.getElementById("btn-photo-upload");
  const token = sessionStorage.getItem("accessToken");

  if (!token) {
    // 토큰이 없을 경우 버튼을 비활성화하고 텍스트 변경
    uploadButton.disabled = true;
    uploadButton.innerText = "환영합니다!";
  }
}

async function setUserAvatarSrc() {
  const profileImage = document.querySelector(".profile-photo img");
  if (!profileImage) {
    return; // profile-photo img 요소가 없으면 함수 실행 중단
  }
  handleUploadButtonState();

  try {
    // 세션 스토리지에서 토큰 확인
    const token = sessionStorage.getItem("accessToken");

    if (token) {
      // 토큰이 있을 경우에만 서버에서 user_avatar 가져오기
      const userResponse = await fetchWithToken("/get-user-info"); // user 정보를 가져오는 API
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userAvatar = userData.user_avatar;

        // user_avatar를 img src로 설정
        const profileImage = document.querySelector(".profile-photo img");
        if (userAvatar) {
          profileImage.src = userAvatar;
        } else {
          profileImage.src = "/resource/images/profile.png"; // 기본 이미지 설정
        }
      } else {
        alert("사용자 정보를 가져오지 못했습니다.");
      }
    } else {
      // 토큰이 없을 경우 기본 이미지를 설정
      profileImage.src = "/resource/images/profile.png";
    }
  } catch (error) {
    // console.error("사용자 정보 가져오기 중 오류 발생:", error);
    alert("사용자 정보를 가져오는 중 오류가 발생했습니다.");
  }
}

function handleUploadProfile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async function () {
    const file = input.files[0];
    if (file) {
      console.log("Selected file:", file);
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetchWithToken("/upload-profile?directory=profile", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          alert("프로필 사진이 성공적으로 업로드되었습니다.");
          const newAvatarUrl = data.imageURL;

          if (newAvatarUrl) {
            document.querySelector(".profile-photo img").src = `${newAvatarUrl}?t=${new Date().getTime()}`;
          }
        } else {
          console.warn("Upload failed, response status:", response.status);
          alert("프로필 사진 업로드에 실패했습니다.");
        }
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        alert("프로필 사진 업로드 중 오류가 발생했습니다.");
      }
    }
  };

  input.click();
}

function Profile() {
  if (!document.querySelector("link[href='/css/profile.css']")) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/profile.css";
    document.head.appendChild(link);
  }

  let audio;

  window.onload = async function () {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
      audio = new Audio("/resource/sound/warr.mp3");
      audio.loop = true;

      document.getElementById("btn-music-start").addEventListener("click", function () {
        audio.play();
        this.style.display = "none";
        document.getElementById("btn-music-stop").style.display = "inline";
        document.getElementById("music-animation").classList.add("running");
      });

      document.getElementById("btn-music-stop").addEventListener("click", function () {
        audio.pause();
        this.style.display = "none";
        document.getElementById("btn-music-start").style.display = "inline";
        document.getElementById("music-animation").classList.remove("running");
      });

      audio.play();
      document.getElementById("btn-music-start").style.display = "none";
      document.getElementById("btn-music-stop").style.display = "inline";
      document.getElementById("music-animation").classList.add("running");
    });

    setUserAvatarSrc();

    // 프로필 사진 업로드 버튼 클릭 시 파일 선택 및 업로드 처리
    document.getElementById("btn-photo-upload").addEventListener("click", handleUploadProfile);
  };

  const text = "🔥 취준";
  const textIntro = "웰컴...<br/>To..프ㄹㅔ첼..<br/>월드 S2";
  const music = "와르르 - 콜드(Colde)";
  const content = `
    <div class="profile-photo">
        <img src="/resource/images/profile.png" alt="Profile Photo" class="profile-image"/>
      <button id="btn-photo-upload">📷 Photo Upload</button>
    </div>
    <div class="intro-wrapper">
      <div id="intro-state"><span>Today is ...</span>&nbsp${text}</div>
      <div id="intro-text">${textIntro}</div>
    </div>
    <div class="music-display">
      <span>🎧
        <div id="music-container">
          <div id="music-animation">${music}</div>
        </div>
      </span>
      <div class="music-btn-wrapper">
        <button class="music-btn" id="btn-music-start">▶️</button>
        <button class="music-btn" id="btn-music-stop">||</button>
      </div>
    </div>
    <div class="history-wrapper">
      <div class="history-title">🔶 HISTORY</div>
      <div class="history-content">
        <span class="history">
        <a href="https://github.com/GEONU-MOON/Pretzel-world">
          <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" width="30" height="30">
          <span>Pretzel World Repository</span>
        </a>
        <a href="https://github.com/GEONU-MOON">
          <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" width="30" height="30">
          <span>GEONU-MOON GitHub</span>
        </a>
        <a href="https://blog.naver.com/soomini88">
          <img src="https://i.namu.wiki/i/QWVJJqQ2U_KE1A1BkDI5WwhFcIeQ4C9uGIgibUWPHr3ev65fv4JW9_Yd-66EVu_0TF8mMXIh9k_dnrv_DlLBCw.svg" alt="GitHub" width="30" height="30">
          <span>soomin Blog</span>
        </a>
      </span>
      </div>
    </div>
  `;
  return content;
}

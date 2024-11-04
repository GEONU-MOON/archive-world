function getRandomAvatar() {
  const bucketName = "pretzelworld-bucket"; // S3 버킷 이름
  const region = "ap-northeast-2"; // S3 리전
  const avatars = [
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/mario.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/crown.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/pengguin.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/nuguri.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/man.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/heart.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/fox.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/duck.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/coala.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/bomb.png`
  ];

  const randomIndex = Math.floor(Math.random() * avatars.length);
  return avatars[randomIndex];
}



async function renderVisitorSays() {
  try {
    console.log("방명록 데이터를 요청합니다...");

    const response = await fetch("/visitors/visitors-read");

    console.log("응답 상태 코드:", response.status);
    if (!response.ok) {
      throw new Error("Failed to fetch visitor data");
    }

    const visitorSays = await response.json();
    console.log("받아온 방명록 데이터:", visitorSays);

    const visitorSaysHTML = visitorSays
      .map(
        item => `
        <div class="visitor-says-item">
          <div class="visitor-info">
            <span>${item.writer}</span>
            <span class="visitor-writeAt">${new Date(item.createdAt).toLocaleString()}</span>
          </div>
          <div class="visitor-says-content">
            <img src="${item.writer_avatar || '/resource/images/default.png'}" width="100" height="100" />
            <p>${item.content}</p>
          </div>
        </div>  
      `
      )
      .join("");

    document.querySelector(".visitor-says-container").innerHTML = visitorSaysHTML;
  } catch (error) {
    console.error("Error loading visitor data:", error);
  }
}

function postVisitorSay(event) {
  event.preventDefault();
  const author = document.getElementById("input-visitor-author").value;
  const password = document.getElementById("input-visitor-password").value;
  const content = document.getElementById("input-visitor-say").value;

  fetch("/add-visitor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      visitor_no: Date.now(),
      writer: author,
      writer_avatar: "/resource/images/visitor01.png",
      content: content,
      password: password,
    }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to post visitor");
      }
      return response.json();
    })
    .then(data => {
      console.log("Visitor added:", data);
      renderVisitorSays(); 
    })
    .catch(error => {
      console.error("Error adding visitor:", error);
    });
}

function VisitorComponent() {
  const component = `
    <div class="visitor-container">
      <p>▶ 방명록을 작성해주세요 :)</p>
      <div class="visitor-wrapper">
        <form id="form-visitor" onsubmit="postVisitorSay(event)">
          <div class="visitor-image-section">
            <img id="visitor-avatar" src="${getRandomAvatar()}" width="125" height="125" />
            <button type="button" id="btn-visitor-change" onclick="changeVisitorImage()">
              <img src="/resource/images/reload.png" alt="새로고침 아이콘" width="16" height="16"/>
              <span>이미지 새로고침</span>
            </button>
          </div>
          <div class="visitor-input-wrapper">
            <div class="visitor-info-form">
              <input type="text" id="input-visitor-author" placeholder="닉네임" required />
              <input type="password" id="input-visitor-password" placeholder="비밀번호" required />
            </div>
            <textarea id="input-visitor-say" placeholder="내용을 입력하세요" required></textarea>
            <div>
              <button type="submit" id="btn-visitor-send">확인</button>
            </div>
          </div>
        </form>
        <div class="visitor-says-container">
          <!-- 방명록 항목이 여기에 렌더링됩니다. -->
        </div>
      </div>
    </div>
  `;

  renderVisitorSays();

  return component; 
}

function changeVisitorImage() {
  document.getElementById("visitor-avatar").src = getRandomAvatar();
}
function renderVisitorSays() {
  // todo: 방명록 댓글 get 요청
  const visitorSays = [
    {
      id: 1,
      content: "안녕",
      author: "행복한 토끼",
      img: "01",
      timestamp: "2024.08.05 14:00",
    },
    {
      id: 2,
      content: "안녕",
      author: "행복한 고양이",
      img: "01",
      timestamp: "2024.08.06 14:00",
    },
    {
      id: 3,
      content: "안녕",
      author: "느긋한 토끼",
      img: "01",
      timestamp: "2024.08.06 22:10",
    },
  ];

  const visitorSaysHTML = visitorSays
    .map(
      item => `
    <div class="visitor-says-item">
      <div class="visitor-info">
        <span>no. ${item.id}</span>
        <span>${item.author}</span>
        <span class="visitor-writeAt">${item.timestamp}</span>
      </div>
      <div class="visitor-says-content">
        <img src="/resource/images/visitor${item.img}.png" width="100" height="100" />
        <p>${item.content}</p>
      </div>
    </div>  
  `
    )
    .join("");

  return visitorSaysHTML;
}

function postVisitorSay(event) {
  event.preventDefault();
  const author = document.getElementById("input-visitor-author").value;
  const password = document.getElementById("input-visitor-password").value;
  const content = document.getElementById("input-visitor-say").value;
  let inputToHTML = content
    .split("\n")
    .map(line => `${line}`)
    .join("<br>");
  
  console.log("작성자:", author);
  console.log("비밀번호:", password);
  console.log("내용:", inputToHTML);
  // 여기에서 서버에 데이터를 POST 요청으로 전송할 수 있습니다.
}

function VisitorComponent() {
  const component = `
    <div class="visitor-container">
  <p>▶ 방명록을 작성해주세요 :)</p>
  <div class="visitor-wrapper">
    <form id="form-visitor" onsubmit="postVisitorSay(event)">
      <div class="visitor-image-section">
        <img src="/resource/images/visitor01.png" width="125" height="125" />
        <button type="button" id="btn-visitor-change">
          <span>⟳</span> 이미지 새로고침
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
      ${renderVisitorSays()}
    </div>
  </div>
</div>

  `;
  return component;
}

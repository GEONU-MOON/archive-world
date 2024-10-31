function randomNickname() {
  const firstNames = ["행복한", "귀찮은", "기분 좋은", "활기찬", "느긋한", "용감한", "신비로운", "총명한", "재빠른", "조용한"];
  const lastNames = ["사자", "호랑이", "토끼", "고양이", "강아지", "늑대", "여우", "곰", "다람쥐", "부엉이"];

  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return randomFirstName + " " + randomLastName;
}

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
  `,
    )
    .join("");

  return visitorSaysHTML;
}

function postVisitorSay(event) {
  event.preventDefault();
  const inputData = document.getElementById("input-visitor-say").value;
  let inputToHTML = inputData
    .split("\n")
    .map(line => `${line}`)
    .join("<br>");
  inputToHTML = `<span>${inputToHTML}</span>`;
  console.log(inputToHTML);
}

function VisitorComponent() {
  const component = `
    <div class="visitor-container">
      <p>▶ 방명록을 작성해주세요 :)</p>
      <div class="visitor-wrapper">
        <form id="form-visitor">
          <div>
            <img src="/resource/images/visitor01.png" width="125" height="125" />
            <button id="btn-visitor-change">
              <span>⟳</span>
              <span>이미지 새로고침</span>
            </button>
          </div>
          <div class="visitor-input-wrapper">
            <textarea id="input-visitor-say" cols="63"></textarea>
            <p>
              <span>작성자 : ${randomNickname()}</span>
              <button type="submit" id="btn-visitor-send" onclick="postVisitorSay(event)">확인</button>
            </p>
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

const setDiaryLinkToToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}${month}${day}`;

  return `/diary/${formattedDate}`;
};

async function MainComponent() {
  const mainLayout = `
    <div class="wrapper">
      <div class="wrapper-line">
        <div class="profile-wrapper">
          <div id="visitor-count">Today <span id="visitor-today">&nbsp${null}&nbsp</span> | Total ${null}</div>
          <div class="profile"></div>
        </div>
        <div class="main-wrapper">
          <div class="header-box">
            <div class="intro">열심히 개발ㅎrㅈr...S2</div>
            <div class="outro">Hello, Pretzel World!</div>
          </div>
          <div class="content-area"> 
            <div class="white-box"></div>
            <div class="tab-container">
              <div class="active-tab-item">
                <a href="/" data-link>홈</a>
              </div>
              <div class="tab-item">
                <a href="${setDiaryLinkToToday()}" data-link id="diary-link">다이어리</a>
              </div>
              <div class="tab-item">
                <a href="/photo/board" data-link>포토</a>
              </div>
              <div class="tab-item">
                <a href="/visitor" data-link>방명록</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelector("#app").innerHTML = mainLayout;

  await loadComponent("/js/components/common/Profile.js");
  const profileContent = document.querySelector(".profile");
  profileContent.innerHTML = Profile();

  // 다이어리 탭 클릭 시 DiaryDate 호출
  document.querySelector("#diary-link").addEventListener("click", async event => {
    event.preventDefault(); // 기본 링크 이동 방지
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}${month}${day}`;

    // DiaryDate 호출하여 다이어리 데이터 렌더링
    document.querySelector("#app").innerHTML = await DiaryDate(formattedDate);
  });
}

MainComponent();

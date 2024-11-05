// 오늘 날짜의 다이어리 링크를 설정하는 함수
const setDiaryLinkToToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}${month}${day}`;

  return `/diary/${formattedDate}`;
};

// 방문자 카운트를 가져와 화면에 업데이트하는 함수
async function updateVisitorCount() {
  try {
    const response = await fetch("/click/clicks"); // 클릭 카운트 API 호출
    if (!response.ok) throw new Error("Failed to fetch click counts");
    const data = await response.json();
    document.getElementById("visitor-today").textContent = ` ${data.todayCount} `;
    document.getElementById("visitor-total").textContent = `Total ${data.totalCount}`;
  } catch (error) {
    console.error("Error fetching click counts:", error);
  }
}

// 메인 컴포넌트를 설정하는 함수
async function MainComponent() {
  const mainLayout = `
    <div class="wrapper">
      <div class="wrapper-line">
        <div class="profile-wrapper">
          <div id="visitor-count">
            Today&nbsp;<span id="visitor-today">4</span>&nbsp; &nbsp; <span id="visitor-total">4</span>

          </div>
          <div class="profile"></div>
        </div>
        <div class="main-wrapper">
          <div class="header-box">
            <div class="intro">열심히 개발ㅎrㅈr...S2</div>
            <div class="outro">Hello, World!</div>
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

  // 프로필 컴포넌트를 로드하고 렌더링
  await loadComponent("/js/components/common/Profile.js");
  const profileContent = document.querySelector(".profile");
  profileContent.innerHTML = Profile();

  // 방문자 카운트 업데이트 호출
  updateVisitorCount();
}

// 메인 컴포넌트 함수 호출
MainComponent();

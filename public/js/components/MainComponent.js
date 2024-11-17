const setDiaryLinkToToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}${month}${day}`;

  return `/diary/${formattedDate}`;
};

async function fetchVisitorCount() {
  try {
    const response = await fetch("/click/clicks");
    if (!response.ok) throw new Error("Failed to fetch click counts");
    const data = await response.json();
    document.getElementById("visitor-today").textContent = ` ${data.todayCount} `;
    document.getElementById("visitor-total").textContent = `Total ${data.totalCount}`;
  } catch (error) {
    console.error("Error fetching click counts:", error);
  }
}

async function incrementVisitorCount() {
  try {
    const response = await fetch("/click/clicks/increment", {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to increment click count");

    await fetchVisitorCount();
  } catch (error) {
    console.error("Error incrementing click count:", error);
  }
}


function getKSTDate() {
  const now = new Date();
  now.setHours(now.getHours() + 9); // 한국 시간(UTC+9)으로 변환
  return now.toISOString().split("T")[0];
}

async function checkAndIncrementVisitorCount() {
  const today = getKSTDate(); // 한국 시간 기준의 오늘 날짜
  const lastVisitDate = localStorage.getItem("lastVisitDate");

  if (lastVisitDate !== today) {
    await incrementVisitorCount();
    localStorage.setItem("lastVisitDate", today); 
  } else {
    await fetchVisitorCount();
  }
}


async function MainComponent() {
  const mainLayout = `
    <div class="wrapper">
      <div class="wrapper-line">
        <div class="profile-wrapper">
          <div id="visitor-count">
            Today&nbsp;<span id="visitor-today">0</span>&nbsp; | &nbsp;<span id="visitor-total">Total 0</span>
          </div>
          <div class="profile"></div>
        </div>
        <div class="main-wrapper">
          <div class="header-box">
            <div class="intro">S2열심히 살아ㄱrㅈrS2</div>
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

  await loadComponent("/js/components/common/Profile.js");
  const profileContent = document.querySelector(".profile");
  profileContent.innerHTML = Profile();

  await checkAndIncrementVisitorCount();
}

MainComponent();

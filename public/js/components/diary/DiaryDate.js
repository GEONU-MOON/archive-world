// 오늘 날짜 확인 함수
function checkToday(year, month, day) {
  const today = new Date();
  if (year == today.getFullYear() && month == parseInt(today.getMonth()) + 1 && day == today.getDate()) {
    return true;
  }
  return false;
}

// 달력 템플릿 생성 함수
function getDateTemplate(year, month) {
  let lastDates = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // 윤년 계산
  if ((parseInt(year) % 4 == 0 && parseInt(year) % 100 != 0) || parseInt(year) % 400 == 0) {
    lastDates[1] = 29;
  }

  let dateTemplate = `
    <table>
      <tr>
        <td colspan="5" id="month">
          <button id="btn-prev-month" onclick="renderPrevMonth(${year}, ${month})">◀️</button>
          <span>${year}.${month}</span>
          <button id="btn-next-month" onclick="renderNextMonth(${year}, ${month})">▶️</button>
        </td>
  `;

  for (let i = 1; i < 14; i++) {
    if (checkToday(year, month, i)) {
      dateTemplate += `<td id="today" onclick="changeDate(event)">${i}</td>`;
    } else {
      dateTemplate += `<td onclick="changeDate(event)">${i}</td>`;
    }
  }
  dateTemplate += "</tr><tr>";
  for (let i = 14; i <= lastDates[parseInt(month) - 1]; i++) {
    if (checkToday(year, month, i)) {
      dateTemplate += `<td id="today" onclick="changeDate(event)">${i}</td>`;
    } else {
      dateTemplate += `<td onclick="changeDate(event)">${i}</td>`;
    }
  }
  dateTemplate += "</tr></table>";

  return dateTemplate;
}

// 이전 달 렌더링 함수
function renderPrevMonth(year, month) {
  const calendarContainer = document.querySelector(".calendar-container");
  let newMonth = parseInt(month) - 1;
  let newYear = year;
  if (newMonth < 1) {
    newMonth = 12;
    newYear -= 1;
  }
  newMonth = newMonth < 10 ? "0" + parseInt(newMonth).toString() : parseInt(newMonth).toString();
  calendarContainer.innerHTML = getDateTemplate(newYear, newMonth, 1);
}

// 다음 달 렌더링 함수
function renderNextMonth(year, month) {
  const calendarContainer = document.querySelector(".calendar-container");
  let newMonth = parseInt(month) + 1;
  let newYear = year;
  if (newMonth > 12) {
    newMonth = 1;
    newYear += 1;
  }
  newMonth = newMonth < 10 ? "0" + parseInt(newMonth).toString() : parseInt(newMonth).toString();
  calendarContainer.innerHTML = getDateTemplate(newYear, newMonth, 1);
}

// 날짜를 변경할 때 호출되는 함수
async function changeDate(event) {
  const selectedDate = event.target.textContent;
  const year = document.querySelector("#month span").textContent.split(".")[0];
  const month = document.querySelector("#month span").textContent.split(".")[1];
  const formattedDate = `${year}${month.padStart(2, "0")}${selectedDate.padStart(2, "0")}`;

  // 선택한 날짜의 데이터를 가져와서 기존 컴포넌트 내에서 업데이트
  await updateDiaryContent(formattedDate);
}

// 요일 배열
const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// 다이어리 데이터를 업데이트하는 함수
async function updateDiaryContent(today) {
  const date = new Date(today.slice(0, 4), parseInt(today.slice(4, 6)) - 1, today.slice(6, 8));
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDay = day < 10 ? `0${day}` : day;

  let diaryData = null;

  try {
    const diaryResponse = await fetch(`/api/diary/${year}/${formattedMonth}/${formattedDay}`);
    if (diaryResponse.ok) {
      diaryData = await diaryResponse.json();
    }
  } catch (error) {
    console.error("Failed to fetch diary or comments:", error);
  }

  // 다이어리 및 댓글 데이터 설정
  const diaryId = diaryData ? diaryData._id : "No diary for this date";
  const diaryWriter = diaryData ? diaryData.user_id : "Unknown";
  const diaryContent = diaryData
    ? diaryData.content.replace(/\n/g, "<br/>")
    : "<span style='color:gray;'>해당 날짜에 작성된 다이어리가 없습니다.</span>";

  const commentsHTML =
    diaryData && diaryData.comments
      ? diaryData.comments
          .map(
            (comment, index) => `
            <div class="diary-comment-wrapper" id="comment-${index}">
              <div class="diary-comment-info">
                <span>no.${index + 1} ${comment.user_id}</span>
                <span id="diary-comment-writeAt">${new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <div class="diary-comment-content">
                <img src="/resource/images/profile.png" width=100 height=100 />
                <div id="diary-comment-content">${comment.content}</div>
              </div>
            </div>
          `,
          )
          .join("")
      : "No comments for this diary entry";

  // 기존 컴포넌트 내에서 데이터 업데이트
  document.querySelector(".diary-info span:first-child").textContent = `${year}.${formattedMonth}.${formattedDay}`;
  document.querySelector(".diary-info span:last-child").textContent = diaryWriter;
  document.querySelector(".diary-content span").innerHTML = diaryContent;
  document.querySelector(".diary-comment-container").innerHTML = `
    <form class="form-diary-comment">
      <label>댓글</label>
      <input type="text" name="diary-comment" />
      <button type="submit">확인</button>
    </form>
    ${commentsHTML}
  `;
}

// DiaryDate: 초기 렌더링 시 호출하여 컴포넌트를 반환
async function DiaryDate(today) {
  const date = new Date(today.slice(0, 4), parseInt(today.slice(4, 6)) - 1, today.slice(6, 8));
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDay = day < 10 ? `0${day}` : day;

  let diaryData = null;

  try {
    const diaryResponse = await fetch(`/api/diary/${year}/${formattedMonth}/${formattedDay}`);
    if (diaryResponse.ok) {
      diaryData = await diaryResponse.json();
    }
  } catch (error) {
    console.error("Failed to fetch diary or comments:", error);
  }

  const diaryId = diaryData ? diaryData._id : "No diary for this date";
  const diaryWriter = diaryData ? diaryData.user_id : "Unknown";
  const diaryContent = diaryData
    ? diaryData.content.replace(/\n/g, "<br/>")
    : "<span style='color:gray;'>해당 날짜에 작성된 다이어리가 없습니다.</span>";

  const commentsHTML =
    diaryData && diaryData.comments
      ? diaryData.comments
          .map(
            (comment, index) => `
              <div class="diary-comment-wrapper" id="comment-${index}">
                <div class="diary-comment-info">
                  <span>no.${index + 1} ${comment.user_id}</span>
                  <span id="diary-comment-writeAt">${new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <div class="diary-comment-content">
                  <img src="/resource/images/profile.png" width=100 height=100 />
                  <div id="diary-comment-content">${comment.content}</div>
                </div>
              </div>
            `,
          )
          .join("")
      : "No comments for this diary entry";

  // 전체 컴포넌트를 처음 한 번만 반환
  const component = `
    <div class="diary-wrapper">
      <div>
        <div class="calendar">
          <div class="calendar-today">
            <span>${formattedMonth}.${formattedDay}</span>
            <span>${daysOfWeek[date.getDay()]}</span>
          </div>
          <div class="calendar-container">
            ${getDateTemplate(year, formattedMonth)}
          </div>
        </div>
        <hr />
        <div class="diary-post">
          <button id="btn-diary-post" onclick="navigateTo('/diary/post')">글쓰기✏️</button>
        </div>
        <div class="diary-container" id="diary-${diaryId}">
          <div class="diary-info">
            <span>${year}.${formattedMonth}.${formattedDay}</span>
            <span>${diaryWriter}</span>
          </div>
          <div class="diary-content">
            <span>${diaryContent}</span>
            <div class="diary-edit-wrapper">
              <button id="btn-diary-edit">수정</button>
              <button id="btn-diary-remove">삭제</button>
            </div>
          </div>
          <div class="diary-comment-container">
            <form class="form-diary-comment">
              <label>댓글</label>
              <input type="text" name="diary-comment" />
              <button type="submit">확인</button>
            </form>
            ${commentsHTML}
          </div>
        </div>
      </div>
    </div>
  `;

  return component;
}

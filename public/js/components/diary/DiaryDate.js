function checkToday(year, month, day) {
  const today = new Date();
  if (year == today.getFullYear() && month == parseInt(today.getMonth()) + 1 && day == today.getDate()) {
    return true;
  }
  return false;
}



function encodeHTML(html) {
  const div = document.createElement("div");
  div.innerText = html;
  return div.innerHTML;
}


function getDateTemplate(year, month) {
  const lastDates = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

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
      dateTemplate += `<td id="today onclick="changeDate(event)"">${i}</td>`;
    } else {
      dateTemplate += `<td onclick="changeDate(event)">${i}</td>`;
    }
  }
  dateTemplate += "</tr></table>";

  return dateTemplate;
}

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


const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// 날짜 변경 시 요청을 보내는 함수
async function changeDate(event) {
  const selectedDate = event.target.textContent.padStart(2, "0"); // 날짜를 두 자리로 맞춤
  const year = document.querySelector("#month span").textContent.split(".")[0];
  const month = document.querySelector("#month span").textContent.split(".")[1].padStart(2, "0");

  // 포맷된 날짜를 생성 (예: "20241101")
  const formattedDate = `${year}${month}${selectedDate}`;

  // 다이어리 내용을 새로 불러와서 화면에 렌더링
  const diaryContent = await DiaryDate(formattedDate);
  document.querySelector(".white-box").innerHTML = diaryContent;
}


async function deleteDiary(diaryId) {
  const confirmation = confirm("이 다이어리를 삭제하시겠습니까?");
  if (!confirmation) return;

  try {
    const response = await fetch(`/api/diary/${diaryId}/delete`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
    });

    if (response.ok) {
      alert("다이어리가 성공적으로 삭제되었습니다.");
      document.querySelector(`#diary-${diaryId}`).remove();
    } else {
      const errorData = await response.json();
      alert(`다이어리 삭제 실패: ${errorData.error}`);
    }
  } catch (error) {
    // console.error("다이어리 삭제 중 오류가 발생했습니다:", error);
    alert("다이어리 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
}

async function editDiary(diaryId, currentContentElement) {
  const originalContent = encodeURIComponent(currentContentElement.innerHTML); // 안전한 인코딩
  
  // 다이어리 내용을 편집 가능한 입력 폼으로 변경
  currentContentElement.innerHTML = `<textarea id="edit-diary-content">${decodeURIComponent(originalContent).replace(/<br>/g, "\n")}</textarea>`;

  // 수정 완료 및 취소 버튼 추가
  const editWrapper = currentContentElement.nextElementSibling;
  editWrapper.innerHTML = `
    <button id="btn-diary-save" onclick="saveEditedDiary('${diaryId}')">저장</button>
    <button id="btn-diary-cancel" onclick="cancelEditDiary('${diaryId}', '${originalContent}')">취소</button>
  `;
}



async function saveEditedDiary(diaryId) {
  const newContent = document.querySelector("#edit-diary-content").value;

  try {
    const response = await fetchWithToken(`/api/diary/${diaryId}/edit`, {
      method: "PUT",
      body: JSON.stringify({ content: newContent }),
    });

    if (response.ok) {
      alert("다이어리가 성공적으로 수정되었습니다.");
      document.querySelector(`#diary-${diaryId} .diary-content span`).innerHTML = newContent.replace(/\n/g, "<br>");
    } else {
      const errorData = await response.json();
      alert(`수정 실패: ${errorData.error}`);
    }
  } catch (error) {
    // console.error("수정 중 오류가 발생했습니다:", error);
    alert("수정 중 오류가 발생했습니다. 다시 시도해주세요.");
  }

  // 수정 완료 후 버튼을 원래대로 변경
  const editWrapper = document.querySelector(`#diary-${diaryId} .diary-edit-wrapper`);
  editWrapper.innerHTML = `
    <button id="btn-diary-edit" onclick="editDiary('${diaryId}', document.querySelector('#diary-${diaryId} .diary-content span'))">수정</button>
    <button id="btn-diary-remove" onclick="deleteDiary('${diaryId}')">삭제</button>
  `;
}

function cancelEditDiary(diaryId, encodedOriginalContent) {
  const originalContent = decodeURIComponent(encodedOriginalContent); // 안전한 복원

  // 수정 취소 시 원래 내용으로 복구
  const contentElement = document.querySelector(`#diary-${diaryId} .diary-content span`);
  contentElement.innerHTML = originalContent;

  // 버튼을 원래 상태로 
  const editWrapper = contentElement.nextElementSibling;
  editWrapper.innerHTML = `
    <button id="btn-diary-edit" onclick="editDiary('${diaryId}', document.querySelector('#diary-${diaryId} .diary-content span'))">수정</button>
    <button id="btn-diary-remove" onclick="deleteDiary('${diaryId}')">삭제</button>
  `;
}

// 로그인 상태를 확인하는 함수 (예제이므로 실제 구현에 맞게 수정 필요)
function isLoggedIn() {
  return !!sessionStorage.getItem("accessToken");
}

async function addComment(diaryId, formattedDate) {
  const commentInput = document.querySelector(`#diary-${diaryId} .form-diary-comment input[name="diary-comment"]`);
  const commentContent = commentInput.value.trim();

  let userId = null;
  let password = null;

  if (!isLoggedIn()) {
    userId = document.querySelector(`#diary-${diaryId} .form-diary-comment input[name="user-id"]`).value.trim();
    password = document.querySelector(`#diary-${diaryId} .form-diary-comment input[name="user-password"]`).value.trim();

    console.log("User ID:", userId);
    console.log("Password:", password);

    if (!userId || !password) {
      alert("아이디와 비밀번호를 입력해 주세요.");
      return;
    }
  }

  console.log("Comment Content:", commentContent);

  if (!commentContent) {
    alert("댓글을 입력해 주세요.");
    return;
  }

  try {
    const response = await fetch(`/api/diary/${diaryId}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(isLoggedIn() && { Authorization: `Bearer ${sessionStorage.getItem("accessToken")}` }),
      },
      body: JSON.stringify({ content: commentContent, user_id: userId, password: password }),
    });

    console.log("Request Headers:", {
      "Content-Type": "application/json",
      ...(isLoggedIn() && { Authorization: `Bearer ${sessionStorage.getItem("accessToken")}` })
    });
    console.log("Request Body:", { content: commentContent, user_id: userId, password: password });
    console.log("Response Status:", response.status);

    if (response.ok) {
      commentInput.value = ""; // 입력 필드 초기화
      if (!isLoggedIn()) {
        document.querySelector(`#diary-${diaryId} .form-diary-comment input[name="user-id"]`).value = "";
        document.querySelector(`#diary-${diaryId} .form-diary-comment input[name="user-password"]`).value = "";
      }
      const updatedContent = await DiaryDate(formattedDate); // 최신 컴포넌트 가져오기
      document.querySelector(".white-box").innerHTML = updatedContent; // 컴포넌트 업데이트
    } else {
      const errorData = await response.json();
      console.log("Error Data:", errorData);
      alert(`댓글 작성 실패: ${errorData.error}`);
    }
  } catch (error) {
    console.error("댓글 작성 중 오류가 발생했습니다:", error);
    alert("댓글 작성 중 오류가 발생했습니다. 다시 시도해 주세요.");
  }
}





async function saveEditedComment(diaryId, commentIndex) {
  const newContent = document.querySelector("#edit-comment-content").value;
  const password = document.querySelector("#comment-password")?.value || null;

  try {
    const response = await fetch(`/api/diary/${diaryId}/comment/${commentIndex}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(isLoggedIn() && { Authorization: `Bearer ${sessionStorage.getItem("accessToken")}` }),
      },
      body: JSON.stringify({ content: newContent, password }),
    });

    if (response.ok) {
      // 댓글 수정 성공 시 화면에 변경사항 반영
      document.querySelector(`#comment-${diaryId}-${commentIndex} .diary-comment-content div`).innerHTML = newContent.replace(/\n/g, "<br>");
      
      // 버튼을 원래 상태로 복구
      const editWrapper = document.querySelector(`#comment-${diaryId}-${commentIndex} .diary-comment-edit-wrapper`);
      editWrapper.innerHTML = `
        <button id="btn-comment-edit" onclick="editComment('${diaryId}', ${commentIndex}, document.querySelector('#comment-${diaryId}-${commentIndex} .diary-comment-content div'))">수정</button>
        <button id="btn-comment-remove" onclick="deleteComment('${diaryId}', ${commentIndex})">삭제</button>
      `;

      alert("댓글이 성공적으로 수정되었습니다.");
    } else {
      const errorData = await response.json();
      alert(`댓글 수정 실패: ${errorData.error}`);
    }
  } catch (error) {
    alert("댓글 수정 중 오류가 발생했습니다.");
  }
}




// 댓글 수정 취소 함수
function cancelEditComment(diaryId, commentIndex, originalContent) {
  // console.log("cancelEditComment called", diaryId, commentIndex, originalContent);

  // 댓글의 원래 내용을 복원할 요소 선택
  const contentElement = document.querySelector(`#diary-${diaryId} #comment-${diaryId}-${commentIndex} .diary-comment-content div`);
  // console.log("Selected contentElement:", contentElement);

  if (contentElement) {
    // 수정 폼 제거하고 원래 내용 복원
    contentElement.innerHTML = originalContent; 
    // console.log("Original content restored");

    // 버튼 UI 복원
    const editWrapper = contentElement.nextElementSibling;
    // console.log("Selected editWrapper:", editWrapper);
    
    if (editWrapper) {
      editWrapper.innerHTML = `
        <button id="btn-comment-edit" onclick="editComment('${diaryId}', ${commentIndex}, document.querySelector('#diary-${diaryId} #comment-${diaryId}-${commentIndex} .diary-comment-content div'))">수정</button>
        <button id="btn-comment-remove" onclick="deleteComment('${diaryId}', ${commentIndex})">삭제</button>
      `;
      // console.log("Buttons restored");
    } else {
      // console.log("editWrapper not found");
    }
  } else {
    // console.log("contentElement not found");
  }
}

// 댓글 수정 함수
async function editComment(diaryId, commentIndex, originalContentElement) {
  if (!originalContentElement) {
    // console.error("Error: Comment element not found.");
    return; // 요소가 없으면 함수 종료
  }

  const originalContent = originalContentElement.innerHTML;

  // 댓글을 수정 가능한 입력 폼으로 변경
  originalContentElement.innerHTML = `<textarea id="edit-comment-content">${originalContent.replace(/<br>/g, "\n")}</textarea>`;

  // 저장 및 취소 버튼 추가
  const editWrapper = originalContentElement.nextElementSibling;
  if (editWrapper) {
    editWrapper.innerHTML = `
      <button id="btn-diary-save" onclick="saveEditedComment('${diaryId}', ${commentIndex})">저장</button>
      <button id="btn-diary-cancel" onclick="cancelEditComment('${diaryId}', ${commentIndex}, \`${originalContent.replace(/`/g, "\\`")}\`)">취소</button>
      ${!isLoggedIn() ? `<input type="password" id="comment-password" placeholder="비밀번호">` : ""}
    `;
  } else {
    // console.error("Error: Edit wrapper element not found.");
  }
}



// 댓글 삭제 요청
async function deleteComment(diaryId, commentIndex) {
  const password = !isLoggedIn() ? prompt("비밀번호를 입력하세요:") : null;

  if (!confirm("이 댓글을 삭제하시겠습니까?")) return;

  try {
    const response = await fetch(`/api/diary/${diaryId}/comment/${commentIndex}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(isLoggedIn() && { Authorization: `Bearer ${sessionStorage.getItem("accessToken")}` }),
      },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      // 삭제 성공 시 DOM에서 해당 댓글을 즉시 제거
      document.querySelector(`#comment-${diaryId}-${commentIndex}`).remove();
      alert("댓글이 성공적으로 삭제되었습니다.");
    } else {
      // 서버에서 실패 시 반환한 오류 메시지를 표시
      const errorData = await response.json();
      alert(`댓글 삭제 실패: ${errorData.error}`);
    }
  } catch (error) {
    alert("댓글 삭제 중 오류가 발생했습니다.");
  }
}




async function DiaryDate(today) {
  const date = new Date(today.slice(0, 4), parseInt(today.slice(4, 6)) - 1, today.slice(6, 8));
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  let diaryEntries = [];

  try {
    const diaryResponse = await fetch(`/api/diary/${year}/${month}/${day}`);
    if (diaryResponse.ok) {
      diaryEntries = await diaryResponse.json();
    }
  } catch (error) {
    // console.error("Failed to fetch diary data:", error);
  }

  if (diaryEntries.length === 0) {
    return `
      <div class="diary-wrapper">
        <div>
          <div class="calendar">
            <div class="calendar-today">
              <span>${month}.${day}</span>
              <span>${daysOfWeek[date.getDay()]}</span>
            </div>
            <div class="calendar-container">
              ${getDateTemplate(year, parseInt(month))}
            </div>
          </div>
          <hr />
          <div class="diary-post">
            <button id="btn-diary-post" onclick="navigateTo('/diary/post')">글쓰기✏️</button>
          </div>
          <div class="diary-content-area">
            <span style="color: gray;">해당 날짜에 작성된 다이어리가 없습니다.</span>
          </div>
        </div>
      </div>
    `;
  }

  const diaryEntriesHTML = diaryEntries.map((entry, entryIdx) => {
    const diaryId = entry._id;
    const diaryWriter = entry.user_id || "Unknown";
    const diaryContent = entry.content.replace(/\n/g, "<br/>");
  
    const commentsHTML = entry.comments && entry.comments.length > 0
      ? entry.comments.map((comment, idx) => `
          <div class="diary-comment-wrapper" id="comment-${diaryId}-${idx}">
            <div class="diary-comment-info">
              <span>no.${idx + 1} ${comment.user_id}</span>
              <span id="diary-comment-writeAt">${new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            <div class="diary-comment-content">
              <img src="${comment.user_avatar}" class="comment-avatar" width="100" height="100" alt="User Avatar" />
              <div>${comment.content}</div>
              <div class="diary-comment-edit-wrapper">
                <button id="btn-comment-edit" onclick="editComment('${diaryId}', ${idx}, document.querySelector('#comment-${diaryId}-${idx} .diary-comment-content div'))">수정</button>
                <button id="btn-comment-remove" onclick="deleteComment('${diaryId}', ${idx})">삭제</button>
              </div>
            </div>
          </div>`
        ).join("")
      : "";
  
    return `
      <div class="diary-container" id="diary-${diaryId}">
        <div class="diary-info">
          <span>${year}.${month}.${day}</span>
          <span>${diaryWriter}</span>
        </div>
        <div class="diary-content">
          <span>${diaryContent}</span>
          <div class="diary-edit-wrapper">
            <button id="btn-diary-edit" onclick="editDiary('${diaryId}', document.querySelector('#diary-${diaryId} .diary-content span'))">수정</button>
            <button id="btn-diary-remove" onclick="deleteDiary('${diaryId}')">삭제</button>
          </div>
        </div>
        <div class="diary-comment-container">
          <form class="form-diary-comment" onsubmit="event.preventDefault(); addComment('${diaryId}', '${today}');">
            <label>댓글</label>
            <input type="text" name="diary-comment" placeholder="댓글 입력" />
  
            ${!isLoggedIn() ? `
              <input type="text" name="user-id" placeholder="아이디" style="width: 20%;" />
              <input type="password" name="user-password" placeholder="비밀번호" style="width: 20%;" />
            ` : ""}
  
            <button type="submit">확인</button>
          </form>
          ${commentsHTML}
        </div>
      </div>
    `;
  }).join("");
  

  const component = `
    <div class="diary-wrapper">
      <div>
        <div class="calendar">
          <div class="calendar-today">
            <span>${month}.${day}</span>
            <span>${daysOfWeek[date.getDay()]}</span>
          </div>
          <div class="calendar-container">
            ${getDateTemplate(year, parseInt(month))}
          </div>
        </div>
        <hr />
        <div class="diary-post">
          <button id="btn-diary-post" onclick="navigateTo('/diary/post')">글쓰기✏️</button>
        </div>
        <div class="diary-content-area">
          ${diaryEntriesHTML}
        </div>
      </div>
    </div>
  `;

  return component;
}
let photoDataList = [];

// 사진 목록을 불러오는 함수
async function photoBoardContent() {
  try {
    const response = await fetch(`/photos/all`);
    if (!response.ok) {
      throw new Error(`Failed to fetch photo data: ${response.status} ${response.statusText}`);
    }
    photoDataList = await response.json();
  } catch (error) {
    return `<div class="error">사진 데이터를 불러오는 데 실패했습니다.</div>`;
  }

  return photoDataList
    .map(photoData => {
      const commentsHtml = (photoData.comments || [])
  .map((comment, idx) => `
    <div class="photo-comment-wrapper" id="comment-${photoData.id}-${comment.id}">
      <div class="photo-comment-info">
        <span>no.${comment.commentIndex} ${comment.author_name}</span>
        <span id="photo-comment-writeAt">${new Date(comment.createdAt).toLocaleString()}</span>
      </div>
      <div class="photo-comment-content">
        <img src="${comment.user_avatar}" class="comment-avatar" width="100" height="100" />
        <div>${comment.content}</div>
        <div class="photo-comment-edit-wrapper">
          <button id="btn-photo-comment-edit" onclick="editComment('${photoData.id}', ${comment.id})">수정</button>
          <button id="btn-photo-comment-remove" onclick="deleteComment('${photoData.id}', ${comment.id})">삭제</button>
        </div>
      </div>
    </div>`
  ).join("");


      return `
        <div class="photo-content-area" id="photo-${photoData.id}">
          <div class="photo-title">${photoData.title}</div>
          <div class="photo-info">
            <div class="photo-write-info">
              <div class="writer">${photoData.author_name}</div>
              <div class="date">${new Date(photoData.uploadedAt).toLocaleDateString()}</div>
            </div>
            <div class="photo-edit-wrapper">
              <button id="btn-photo-edit" onclick="editPhoto('${photoData.id}')">수정</button>
              <button id="btn-photo-remove" onclick="deletePhoto('${photoData.id}')">삭제</button>
            </div>
          </div>
          <div class="photo-gallery">
            <img src="${photoData.imageUrl}" class="photo-image">
            <div class="photo-content">
              <p>${photoData.description}</p>
            </div>
          </div>
          <div class="photo-comment-container">
            <form class="form-photo-comment ${!isLoggedIn() ? 'logged-out' : ''}" onsubmit="submitComment(event, '${photoData.id}')">
              <label>댓글</label>
              <input type="text" name="photo-comment" class="comment-input" placeholder="댓글 입력" required />
              ${!isLoggedIn() ? `
                <input type="text" name="user-id" class="comment-user-id" placeholder="아이디" required />
                <input type="password" name="user-password" class="comment-user-password" placeholder="비밀번호" required />
              ` : ""}
              <button type="submit" class="comment-submit-button">확인</button>
            </form>
            ${commentsHtml}
          </div>
        </div>
      `;
    })
    .join("");
}


// 전체 사진 보드
async function photoBoard() {
  const photosHtml = await photoBoardContent();
  return `
    <div class="photo-board-container">
      <div class="photo-post"> 
        <button class="btn-photo-post" onclick="navigateTo('/photo/post')">사진 올리기</button>
      </div>
      <div class="photo-board-content-wrapper">
        ${photosHtml}
      </div>
    </div>
  `;
}

// 사진 수정 함수
function editPhoto(photoId) {
  console.log(`[editPhoto] Called with photoId: ${photoId}`);

  const photoElement = document.querySelector(`#photo-${photoId}`);
  if (!photoElement) return;

  const titleElement = photoElement.querySelector(".photo-title");
  const descriptionElement = photoElement.querySelector(".photo-content p");

  if (!titleElement || !descriptionElement) return;

  // 원래 제목과 설명을 data 속성에 저장
  photoElement.dataset.originalTitle = titleElement.textContent;
  photoElement.dataset.originalDescription = descriptionElement.textContent;

  // 수정 가능한 입력 폼으로 변경
  titleElement.innerHTML = `<input type="text" id="edit-photo-title" value="${titleElement.textContent}">`;
  descriptionElement.innerHTML = `<textarea id="edit-photo-description">${descriptionElement.textContent}</textarea>`;

  const editWrapper = photoElement.querySelector(".photo-edit-wrapper");
  editWrapper.innerHTML = `
    <button id="btn-photo-save" onclick="saveEditedPhoto('${photoId}')">저장</button>
    <button id="btn-photo-cancel" onclick="cancelEditPhoto('${photoId}')">취소</button>
  `;
}


function editComment(photoId, commentId) {
  console.log(`[editComment] Called with photoId: ${photoId}, commentId: ${commentId}`);

  const commentElement = document.querySelector(`#comment-${photoId}-${commentId} .photo-comment-content div`);
  if (!commentElement) return;

  const originalContent = commentElement.textContent;
  commentElement.dataset.originalContent = originalContent;

  commentElement.innerHTML = `<textarea id="edit-comment-content">${originalContent}</textarea>`;

  const editWrapper = commentElement.nextElementSibling;
  editWrapper.innerHTML = `
    <button id="btn-comment-save" onclick="saveEditedComment('${photoId}', '${commentId}')">저장</button>
    <button id="btn-comment-cancel" onclick="cancelEditComment('${photoId}', '${commentId}')">취소</button>
    ${!isLoggedIn() ? `<input type="password" id="comment-password" placeholder="비밀번호">` : ""}
  `;
}




// photoDataList에서 ID로 데이터를 가져오는 헬퍼 함수
function getPhotoDataById(photoId) {
  return photoDataList.find(photo => photo.id === photoId); // 수정: MySQL의 id 필드 사용
}

// 사진 수정 내용 저장 함수
async function saveEditedPhoto(photoId) {
  const newTitle = document.querySelector("#edit-photo-title").value;
  const newDescription = document.querySelector("#edit-photo-description").value;

  const formData = new FormData();
  formData.append("title", newTitle);
  formData.append("description", newDescription);

  try {
    const response = await fetch(`/photos/${photoId}/edit`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`, // Content-Type 헤더 제거
      },
      body: formData
    });

    if (response.ok) {
      alert("사진이 성공적으로 수정되었습니다!");

      // 제목과 설명을 업데이트하고 버튼을 원래대로 복원
      const photoElement = document.querySelector(`#photo-${photoId}`);
      photoElement.querySelector(".photo-title").innerHTML = newTitle;
      photoElement.querySelector(".photo-content p").innerHTML = newDescription.replace(/\n/g, "<br>");

      const editWrapper = photoElement.querySelector(".photo-edit-wrapper");
      editWrapper.innerHTML = `
        <button id="btn-photo-edit" onclick="editPhoto('${photoId}')">수정</button>
        <button id="btn-photo-remove" onclick="deletePhoto('${photoId}')">삭제</button>
      `;
    } else {
      const errorData = await response.json();
      alert(`사진 수정 실패: ${errorData.error}`);
    }
  } catch (error) {
    alert("사진 수정 중 오류가 발생했습니다.");
  }
}

// 사진 수정 내용 저장 함수
async function saveEditedComment(photoId, commentId) {
  const newContent = document.querySelector("#edit-comment-content").value;
  const password = document.querySelector("#comment-password")?.value || null;

  try {
    const response = await fetch(`/photos/${photoId}/comment/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(isLoggedIn() && { Authorization: `Bearer ${sessionStorage.getItem("accessToken")}` }),
      },
      body: JSON.stringify({ content: newContent, password }),
    });

    if (response.ok) {
      alert("댓글이 성공적으로 수정되었습니다.");
      document.querySelector(".photo-board-content-wrapper").innerHTML = await photoBoardContent();
    } else {
      const errorData = await response.json();
      alert(`댓글 수정 실패: ${errorData.error}`);
    }
  } catch {
    alert("댓글 수정 중 오류가 발생했습니다.");
  }
}



// 사진 수정 취소 함수
function cancelEditPhoto(photoId) {
  const photoElement = document.querySelector(`#photo-${photoId}`);
  if (!photoElement) return;

  const originalTitle = photoElement.dataset.originalTitle;
  const originalDescription = photoElement.dataset.originalDescription;

  // 제목과 설명을 원래 값으로 복원
  const titleElement = photoElement.querySelector(".photo-title");
  const descriptionElement = photoElement.querySelector(".photo-content p");

  titleElement.textContent = originalTitle;
  descriptionElement.textContent = originalDescription;

  // 버튼을 원래대로 복원
  const editWrapper = photoElement.querySelector(".photo-edit-wrapper");
  editWrapper.innerHTML = `
    <button id="btn-photo-edit" onclick="editPhoto('${photoId}')">수정</button>
    <button id="btn-photo-remove" onclick="deletePhoto('${photoId}')">삭제</button>
  `;

  console.log("[cancelEditPhoto] Form canceled and restored to original content.");
}



// 사진 삭제 함수
async function deletePhoto(photoId) {
  try {
    const response = await fetch(`/photos/${photoId}/delete`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
    });

    if (response.ok) {
      alert("사진이 성공적으로 삭제되었습니다!");
      const photoBoardContainer = document.querySelector(".photo-board-content-wrapper");
      photoBoardContainer.innerHTML = await photoBoardContent();
    } else {
      const errorData = await response.json();
      alert(`사진 삭제에 실패했습니다: ${errorData.error}`);
    }
  } catch {
    alert("사진 삭제에 실패했습니다.");
  }
}

// 댓글 추가 함수
async function submitComment(event, photoId) {
  event.preventDefault();
  const commentInput = event.target.querySelector("input[name='photo-comment']");
  const content = commentInput.value.trim();

  let userId = null;
  let password = null;

  if (!isLoggedIn()) {
    userId = event.target.querySelector("input[name='user-id']").value.trim();
    password = event.target.querySelector("input[name='user-password']").value.trim();

    if (!userId || !password) {
      alert("아이디와 비밀번호를 입력해 주세요.");
      return;
    }
  }

  if (!content) {
    alert("댓글을 입력해 주세요.");
    return;
  }

  try {
    const response = await fetch(`/photos/${photoId}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(isLoggedIn() && { Authorization: `Bearer ${sessionStorage.getItem("accessToken")}` }),
      },
      body: JSON.stringify({ content, user_id: userId, password }),
    });

    if (response.ok) {
      alert("댓글이 성공적으로 추가되었습니다.");
      document.querySelector(".photo-board-content-wrapper").innerHTML = await photoBoardContent();
    } else {
      const errorData = await response.json();
      alert(`댓글 작성 실패: ${errorData.error}`);
    }
  } catch {
    alert("댓글 작성 중 오류가 발생했습니다.");
  }
}

// 댓글 삭제 함수

async function deleteComment(photoId, commentId) {
  const password = !isLoggedIn() ? prompt("비밀번호를 입력하세요:") : null;

  if (!confirm("이 댓글을 삭제하시겠습니까?")) return;

  try {
    const response = await fetch(`/photos/${photoId}/comment/${commentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(isLoggedIn() && { Authorization: `Bearer ${sessionStorage.getItem("accessToken")}` }),
      },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      alert("댓글이 성공적으로 삭제되었습니다.");
      // 백엔드 응답을 받은 후에만 다시 렌더링
      document.querySelector(".photo-board-content-wrapper").innerHTML = await photoBoardContent();
    } else {
      const errorData = await response.json();
      console.error("Delete comment error:", errorData);
      alert(`댓글 삭제 실패: ${errorData.error}`);
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    alert("댓글 삭제 중 오류가 발생했습니다.");
  }
}

function cancelEditComment(photoId, commentId) {
  const commentElement = document.querySelector(`#comment-${photoId}-${commentId} .photo-comment-content div`);
  if (!commentElement) return;

  const originalContent = commentElement.dataset.originalContent;

  // 원래 내용으로 복원
  commentElement.textContent = originalContent;

  const editWrapper = commentElement.nextElementSibling;
  editWrapper.innerHTML = `
    <button id="btn-photo-comment-edit" onclick="editComment('${photoId}', ${commentId})">수정</button>
    <button id="btn-photo-comment-remove" onclick="deleteComment('${photoId}', ${commentId})">삭제</button>
  `;

  console.log("[cancelEditComment] Form canceled and restored to original content.");
}



// 로그인 상태를 확인하는 함수
function isLoggedIn() {
  return !!sessionStorage.getItem("accessToken");
}

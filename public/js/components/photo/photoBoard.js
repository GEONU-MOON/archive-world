// 사진 목록을 불러오는 함수 (목록 부분만 반환)
async function photoBoardContent() {
  let photoDataList = [];

  try {
    const response = await fetch(`/photos/all`);
    if (!response.ok) {
      throw new Error(`Failed to fetch photo data: ${response.status} ${response.statusText}`);
    }
    photoDataList = await response.json();
  } catch (error) {
    // console.error("Error fetching photo data:", error);
    return `<div class="error">사진 데이터를 불러오는 데 실패했습니다.</div>`;
  }

  return photoDataList
    .map(photoData => {
      const commentsHtml = (photoData.comments || [])
        .map(
          comment => `
          <div class="photo-comment-wrapper">
            <div class="photo-comment-info">
              <span>no.${comment.no}</span>
              <span>${comment.writer}</span>
              <span id="photo-comment-writeAt">${new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            <div class="photo-comment-content">
              <img src="${comment.profileImageUrl || '/resource/images/default-avatar.png'}" width="100" height="100" />
              <div id="photo-comment-content">${comment.content}</div>
            </div>
          </div>
        `
        )
        .join("");

      return `
        <div class="photo-content-area">
          <div class="photo-title">${photoData.title}</div>
          <div class="photo-info">
            <div class="photo-write-info">
              <div class="writer">${photoData.user_id}</div>
              <div class="date">${new Date(photoData.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="photo-edit-wrapper">
              <button id="btn-photo-edit" onclick="editPhoto('${photoData._id}')">수정</button>
              <button id="btn-photo-remove" onclick="deletePhoto('${photoData._id}')">삭제</button>
            </div>
          </div>
          <div class="photo-gallery">
            <img src="${photoData.imageUrl}" class="photo-image">
            <div class="photo-content">
              <p>${photoData.description}</p>
            </div>
          </div>
          <div class="photo-comment-container">
            <form class="form-photo-comment" onsubmit="submitComment(event, '${photoData._id}')">
              <label>댓글</label>
              <input type="text" name="photo-comment" required />
              <button type="submit">확인</button>
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
  } catch (error) {
    // console.error("사진 삭제 중 오류가 발생했습니다:", error);
    alert("사진 삭제에 실패했습니다.");
  }
}

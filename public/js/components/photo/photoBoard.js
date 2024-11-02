function photoBoard() {
  const photoData = {
    title: "곰돌이 푸",
    writer: "푸",
    date: "2024-08-06",
    description: "곰돌이 푸?",
    imageUrl: "/resource/images/profile.png",
    comments: [
      {
        no: 1,
        writer: "댓글작성자1",
        content: "댓글내용1",
        profileImageUrl: "/resource/images/profile.png",
        commentWriteAt: "2024.08.04 22:12",
      },
      {
        no: 2,
        writer: "댓글작성자2",
        content: "댓글내용2",
        profileImageUrl: "/resource/images/profile.png",
        commentWriteAt: "2024.08.04 22:12",
      },
    ],
  };

  const commentsHtml = photoData.comments
    .map(
      comment => `
    <div class="photo-comment-wrapper">
      <div class="photo-comment-info">
        <span>no.${comment.no}</span>
        <span>${comment.writer}</span>
        <span id="photo-comment-writeAt">${comment.commentWriteAt}<span>
      </div>
      <div class="photo-comment-content">
        <img src="${comment.profileImageUrl}" width="100" height="100" />
        <div id="photo-comment-content">${comment.content}</div>
      </div>
    </div>
  `,
    )
    .join("");

  return `
    <div class="photo-board-container">
      <div class="photo-post"> 
        <button class="btn-photo-post" onclick="navigateTo('/photo/post')">사진 올리기</button>
      </div>
      <div class="photo-content-area">
        <div class="photo-title">${photoData.title}</div>
        <div class="photo-info">
          <div class="photo-write-info">
            <div class="writer">${photoData.writer}</div>
            <div class="date">${photoData.date}</div>
          </div>
          <div class="photo-edit-wrapper">
            <button id="btn-photo-edit">수정</button>
            <button id="btn-photo-remove">삭제</button>
          </div>
        </div>
        <div class="photo-gallery">
          <img src="${photoData.imageUrl}" class="photo-image">
          <div class="photo-content">
            <p>${photoData.description}</p>
          </div>
        </div>
        <div class="photo-comment-container">
            <form class="form-photo-comment">
              <label>댓글</label>
              <input type="text" name="photo-comment" />
              <button type="submit">확인</button>
            </form>
            ${commentsHtml}
          </div>
        </div>  
    </div>
  `;
}

async function HomeComponent() {
  let diaryContents = [];
  try {
    // 백엔드에서 모든 다이어리 항목 가져오기
    const response = await fetch("/api/diary/all");
    if (response.ok) {
      diaryContents = await response.json();
    }
  } catch (error) {
  }

  const photos = [
    "/resource/images/elephant.jpeg",
    "/resource/images/cute.jpeg",
    "/resource/images/soom.jpeg",
    "/resource/images/elephant.jpeg",
  ];

  const miniroomImage = "/resource/images/mini.png";

  const visitorComments = [
    { comment: "방명록 내용 1", timestamp: "2024-08-05 14:00" },
    { comment: "방명록 내용 2", timestamp: "2024-08-06 15:30" },
    { comment: "방명록 내용 3", timestamp: "2024-08-07 12:20" },
    { comment: "방명록 내용 4", timestamp: "2024-08-08 18:45" },
  ];

  // 내용을 100자 정도로 자르기
  const truncateContent = (content, length = 17) => 
    content.length > length ? content.slice(0, length) + "..." : content;

  const diaryHtml = diaryContents
  .sort((a, b) => new Date(b.date) - new Date(a.date)) 
  .slice(0,3) 
  .map(
    item => `
    <div class="diary-item">
      ${truncateContent(item.content)}
      <div class="diary-author">${item.user_id}</div>
    </div>
  `
  )
  .join("");


  const photosHtml = photos
    .slice(0, 3)
    .map(photo => `<img src="${photo}">`)
    .join("");

  const visitorsHtml = visitorComments
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // 내림차순 정렬
    .slice(0, 2)
    .map(
      item => `
      <div class="visitor-comment-item">
        <div class="comment-content">${item.comment}</div>
        <div class="comment-timestamp">${item.timestamp}</div>
      </div>
    `,
    )
    .join("");

  return ` 
    <div class="home-container">
     <div class="top-section">
        <div class="Diary-section">
          <div class="Diary-title">
            Diary
          </div>
          <div class="Diary-show"> 
            ${diaryHtml}
          </div>
        </div>
        <div class="home-photo-section">
          <div class="home-photo-title">
            Photo
          </div>
          <div class="home-photo-gallery">
            ${photosHtml}
          </div>
        </div>
      </div>
      <div class="miniroom-section">
        <div class="miniroom-title">
          Mini Room
        </div>
        <div class="miniroom-image">
          <img src="${miniroomImage}" alt="Mini Room">
        </div>
      </div>
      <div class="visitor-section">
        <div class="visitor-title">
          What Visitors Say
        </div> 
        <div class="visitor-comment">
          ${visitorsHtml}
        </div>
      </div>
    </div>
  `;
}

async function HomeComponent() {
  let diaryContents = [];
  let visitorComments = [];
  let photos = [];

  try {
    const diaryResponse = await fetch("/api/diary/all");
    if (diaryResponse.ok) {
      diaryContents = await diaryResponse.json();
    }

    const visitorResponse = await fetch("/visitors/visitors-read");
    if (visitorResponse.ok) {
      visitorComments = await visitorResponse.json();
    }

    const photoResponse = await fetch("/photos/all"); // 사진 데이터 호출
    if (photoResponse.ok) {
      photos = await photoResponse.json();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  const miniroomImage = "/resource/images/mini.jpg";

  const truncateContent = (content, length = 15) => {
    const plainText = content.replace(/<[^>]*>/g, ""); // HTML 태그 제거
    return plainText.length > length ? plainText.slice(0, length) + "..." : plainText;
  };
  
  const setDiaryLinkToToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}${month}${day}`;

    return `/diary/${formattedDate}`;
  };

  const diaryHtml = diaryContents
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)
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
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .slice(0, 3)
    .map(photo => `<img src="${photo.imageUrl}" alt="${photo.title}">`)
    .join("");

  const visitorsHtml = visitorComments
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 2)
    .map(
      item => `
      <div class="visitor-comment-item">
        <div class="comment-content">${item.content}</div>
        <div class="comment-timestamp">${new Date(item.createdAt).toLocaleString()}</div>
      </div>
    `,
    )
    .join("");

  return ` 
    <div class="home-container">
      <div class="top-section">
        <div class="Diary-section">
          <div class="Diary-title">
            <a href="${setDiaryLinkToToday()}" data-link>Diary</a>
          </div>
          <div class="Diary-show"> 
            ${diaryHtml}
          </div>
        </div>
        <div class="home-photo-section">
          <div class="home-photo-title">
            <a href="/photo/board" data-link>Photo</a>
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
          <a href="/visitor" data-link>What Visitors Say</a>
        </div> 
        <div class="visitor-comment">
          ${visitorsHtml}
        </div>
      </div>
    </div>
  `;
}


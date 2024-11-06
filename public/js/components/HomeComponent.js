async function HomeComponent() {
  let diaryContents = [];
  let visitorComments = [];
  let photos = [];

  try {
    const [diaryResponse, visitorResponse, photoResponse] = await Promise.all([
      fetch("/api/diary/all"),
      fetch("/visitors/visitors-read"),
      fetch("/photos/all"),
    ]);

    if (diaryResponse.ok) {
      diaryContents = await diaryResponse.json();
    }

    if (visitorResponse.ok) {
      visitorComments = await visitorResponse.json();
    }

    if (photoResponse.ok) {
      photos = await photoResponse.json();
    }
  } catch (error) {
    console.error("데이터를 가져오는 중 오류 발생:", error);
  }

  const miniroomImage = "/resource/images/mini.jpg";

  const truncateContent = (content, length = 15) => {
    const plainText = content.replace(/<[^>]*>/g, ""); // HTML 태그 제거
    return plainText.length > length ? plainText.slice(0, length) + "..." : plainText;
  };

  // const setDiaryLinkToToday = (() => {
  //   const today = new Date();
  //   const year = today.getFullYear();
  //   const month = String(today.getMonth() + 1).padStart(2, "0");
  //   const day = String(today.getDate()).padStart(2, "0");
  //   return `/diary/${year}${month}${day}`;
  // })();

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
    .map(photo => `<img src="${photo.imageUrl}" alt="${photo.title}" loading="lazy">`)
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
          <img src="${miniroomImage}" alt="Mini Room" loading="lazy">
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

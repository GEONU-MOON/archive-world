async function HomeComponent() {
  let diaryContents = [];
  let visitorComments = [];

  try {
    const diaryResponse = await fetch("/api/diary/all");
    if (diaryResponse.ok) {
      diaryContents = await diaryResponse.json();
    }

    const visitorResponse = await fetch("/visitors/visitors-read");
    if (visitorResponse.ok) {
      visitorComments = await visitorResponse.json();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  const photos = [
    "/resource/images/elephant.jpeg",
    "/resource/images/cute.jpeg",
    "/resource/images/soom.jpeg",
    "/resource/images/elephant.jpeg",
  ];

  const miniroomImage = "/resource/images/mini.png";

  const truncateContent = (content, length = 15) =>
    content.replace(/<[^>]*>/g, "").slice(0, length);

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
    .slice(0, 3)
    .map(photo => `<img src="${photo}">`)
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

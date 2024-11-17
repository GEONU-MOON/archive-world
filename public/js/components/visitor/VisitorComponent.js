let selectedAvatarUrl = getRandomAvatar();

function getRandomAvatar() {
  const bucketName = "pretzelworld-bucket";
  const region = "ap-northeast-2";
  const avatars = [
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/mario.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/crown.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/pengguin.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/nuguri.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/man.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/heart.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/fox.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/duck.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/coala.png`,
    `https://${bucketName}.s3.${region}.amazonaws.com/avatars/bomb.png`
  ];

  const randomIndex = Math.floor(Math.random() * avatars.length);
  return avatars[randomIndex];
}

async function renderVisitorSays() {
  try {
    const response = await fetch("/visitors/visitors-read");

    if (!response.ok) {
      throw new Error("Failed to fetch visitor data");
    }

    const visitorSays = await response.json();

    const visitorSaysHTML = visitorSays
      .map(
        (item) => `
        <div class="visitor-says-item" id="visitor-item-${item.id}">
          <div class="visitor-info">
            <span>${item.writer}</span>
            <span class="visitor-writeAt">${new Date(item.createdAt).toLocaleString()}</span>
          </div>
          <div class="visitor-says-content">
            <img src="${item.writer_avatar}" width="100" height="100" alt="Visitor Avatar" />
            <p id="visitor-content-${item.id}" 
              data-writer="${item.writer}" 
              data-writer-avatar="${item.writer_avatar}" 
              style="white-space: pre-wrap;">${item.content}</p>
          </div>
          <div class="visitor-actions">
            <button onclick="showEditForm('${item.id}')">수정</button>
            <button onclick="showDeleteForm('${item.id}')">삭제</button>
          </div>
          <div class="edit-password-form" id="edit-form-${item.id}" style="display: none;">
            <textarea id="edit-content-${item.id}"></textarea>
            <input type="password" id="edit-password-${item.id}" placeholder="비밀번호 입력" required />
            <button onclick="saveEditVisitorSay('${item.id}')">저장</button>
            <button onclick="cancelEdit('${item.id}')">취소</button>
          </div>
          <div class="delete-password-form" id="delete-form-${item.id}" style="display: none;">
            <input type="password" id="delete-password-${item.id}" placeholder="비밀번호 입력" required />
            <button onclick="deleteVisitorSay('${item.id}')">삭제 확인</button>
            <button onclick="cancelDelete('${item.id}')">취소</button>
          </div>
        </div>  
      `
      )
      .join("");

    document.querySelector(".visitor-says-container").innerHTML = visitorSaysHTML;
  } catch (error) {
    // console.error("Error loading visitor data:", error);
  }
}

function showEditForm(id) {
  const content = document.getElementById(`visitor-content-${id}`).textContent;
  document.getElementById(`edit-content-${id}`).value = content;
  document.getElementById(`edit-form-${id}`).style.display = "block";
}


function showDeleteForm(id) {
  document.getElementById(`delete-form-${id}`).style.display = "block";
}

function cancelEdit(id) {
  document.getElementById(`edit-form-${id}`).style.display = "none";
}

function cancelDelete(id) {
  document.getElementById(`delete-form-${id}`).style.display = "none";
}

function saveEditVisitorSay(id) {
  const newContent = document.getElementById(`edit-content-${id}`).value;
  const password = document.getElementById(`edit-password-${id}`).value;

  const writer = document.getElementById(`visitor-content-${id}`).dataset.writer;
  const writerAvatar = document.getElementById(`visitor-content-${id}`).dataset.writerAvatar;

  // console.log(`Sending update request with writer: ${writer}, avatar: ${writerAvatar}, content: ${newContent}`);

  fetch(`/visitors/visitor-update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      writer: writer,
      writer_avatar: writerAvatar,
      content: newContent,
      currentPassword: password,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update visitor");
      }
      return response.json();
    })
    .then(() => {
      renderVisitorSays(); // 변경 후 전체 리스트 다시 렌더링
    })
    .catch((error) => {
      // console.error("Error updating visitor:", error);
      alert("비밀번호가 올바르지 않습니다.");
    });
}

function deleteVisitorSay(id) {
  const password = document.getElementById(`delete-password-${id}`).value;

  // console.log(`Sending password for delete: ${password}`);

  if (!confirm("정말 삭제하시겠습니까?")) return;

  fetch(`/visitors/visitor-delete/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentPassword: password }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to delete visitor");
      }
      return response.json();
    })
    .then(data => {
      document.getElementById(`visitor-item-${id}`).remove(); // 삭제된 항목만 제거
    })
    .catch(error => {
      // console.error("Error deleting visitor:", error);
      alert("비밀번호가 올바르지 않습니다.");
    });
}

function postVisitorSay(event) {
  event.preventDefault();
  const author = document.getElementById("input-visitor-author").value;
  const password = document.getElementById("input-visitor-password").value;
  const content = document.getElementById("input-visitor-say").value;

  fetch("/visitors/add-visitor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      visitor_no: Date.now(),
      writer: author,
      writer_avatar: selectedAvatarUrl,
      content: content,
      password: password,
    }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to post visitor");
      }
      return response.json();
    })
    .then(data => {
      renderVisitorSays();
      showSuccessMessage("방명록이 성공적으로 등록되었습니다!");

      // 폼 초기화
      document.getElementById("input-visitor-author").value = "";
      document.getElementById("input-visitor-password").value = "";
      document.getElementById("input-visitor-say").value = "";
    })
    .catch(error => {
      // console.error("Error adding visitor:", error);
    });
}

function showSuccessMessage(message) {
  const successMessage = document.getElementById("visitor-success-message");
  successMessage.textContent = message;
  successMessage.style.display = "block";

  setTimeout(() => {
    successMessage.style.display = "none";
  }, 3000);
}

function VisitorComponent() {
  const component = `
    <div class="visitor-container">
      <p>▶ 방명록을 작성해주세요 :)</p>
      <div class="visitor-wrapper">
        <form id="form-visitor" onsubmit="postVisitorSay(event)">
          <div class="visitor-image-section">
            <img id="visitor-avatar" src="${selectedAvatarUrl}" width="125" height="125" />
            <button type="button" id="btn-visitor-change" onclick="changeVisitorImage()">
              <img src="/resource/images/reload.png" alt="새로고침 아이콘" width="16" height="16"/>
              <span>이미지 새로고침</span>
            </button>
          </div>
          <div class="visitor-input-wrapper">
            <div class="visitor-info-form">
              <input type="text" id="input-visitor-author" placeholder="닉네임" required />
              <input type="password" id="input-visitor-password" placeholder="비밀번호" required />
            </div>
            <textarea id="input-visitor-say" placeholder="내용을 입력하세요" required></textarea>
            <div>
              <button type="submit" id="btn-visitor-send">확인</button>
            </div>
          </div>
        </form>
        <div id="visitor-success-message" style="display: none; color: green; margin-top: 10px;"></div>
        <div class="visitor-says-container">
          <!-- 방명록 항목이 여기에 렌더링됩니다. -->
        </div>
      </div>
    </div>
  `;

  renderVisitorSays();

  return component;
}

function changeVisitorImage() {
  selectedAvatarUrl = getRandomAvatar();
  document.getElementById("visitor-avatar").src = selectedAvatarUrl;
}

function photoForm() {
  return `
    <div class="photo-form-container">
      <div class="photo-board"> 
        <button class="btn-photo-board" onclick="navigateTo('/photo/board')">사진 보러가기</button>
      </div>
      <form id="photo-upload-form" onsubmit="submitPhotoForm(event)">
        <div class="photo-form-group">
          <input type="text" id="photo-title" name="title" required placeholder="제목을 입력해주세요">
        </div>
        <div class="photo-form-group">
         <input type="file" id="photo-image" name="photo" required>
        </div>
        <div id="toolbar">
          <div class="tool">
            <label for="color-select">글꼴 색상</label>
            <select id="color-select" onchange="event.preventDefault(); changeFontColor()">
                <option value="black" style="color: black;">■</option>
                <option value="red" style="color: red;">■</option>
                <option value="blue" style="color: blue;">■</option>
                <option value="green" style="color: green;">■</option>
                <option value="orange" style="color: orange;">■</option>
                <option value="purple" style="color: purple;">■</option>
                <option value="pink" style="color: pink;">■</option>
            </select>
            <button onclick="event.preventDefault(); document.execCommand('hiliteColor', false, 'yellow')">형광펜</button>
            <button onclick="event.preventDefault(); document.execCommand('bold', false, '')">굵게</button>
            <button onclick="event.preventDefault(); document.execCommand('italic', false, '')">기울이기</button>
            <button onclick="event.preventDefault(); document.execCommand('underline', false, '')">밑줄</button>
            <button onclick="event.preventDefault(); document.execCommand('justifyLeft', false, '')">왼쪽 정렬</button>
            <button onclick="event.preventDefault(); document.execCommand('justifyCenter', false, '')">가운데 정렬</button>
            <button onclick="event.preventDefault(); document.execCommand('justifyRight', false, '')">오른쪽 정렬</button>
          </div>
        </div>
        <div id="photo-editor" contenteditable="true"></div>
        <div class="submit-btn">
          <button type="submit" class="btn-photo-submit">저장</button>
        </div>
      </form>
    </div>
  `;
}

// 사진 업로드 폼 제출 함수
async function submitPhotoForm(event) {
  event.preventDefault();
  
  const form = document.getElementById("photo-upload-form");
  const formData = new FormData(form);
  const description = document.getElementById("photo-editor").innerHTML;
  formData.append("description", description);

  try {
    const response = await fetchWithToken("/photos/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload photo");
    }

    const data = await response.json();
    alert("사진이 성공적으로 업로드되었습니다!");
    navigateTo("/photo/board"); 
  } catch (error) {
    // console.error("Error uploading photo:", error);
    alert("사진 업로드에 실패했습니다.");
  }
}


function changeFontColor() {
  const color = document.getElementById("color-select").value;
  document.execCommand("foreColor", false, color);
}

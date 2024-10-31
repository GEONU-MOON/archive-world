function photoForm() {
  return `
  <div class="photo-form-container">
      <div class="photo-board"> 
          <button class="btn-photo-board" onclick="navigateTo('/photo/board')">사진 보러가기</button>
      </div>
      <form id="photo-upload-form" action="/upload/photo" method="post" enctype="multipart/form-data">
          <div class="photo-form-group">
              <input type="text" id="photo-title" name="title" required placeholder="제목을 입력해주세요">
          </div>
          <div class="photo-form-group">
              <input type="file" id="photo-image" name="image" required>
          </div>
          <div id="toolbar">
            <div class="tool">
              <label for="color-select">글꼴 색상</label>
              <select id="color-select" onchange="changeFontColor()">
                  <option value="black" style="color: black;">■</option>
                  <option value="red" style="color: red;">■</option>
                  <option value="blue" style="color: blue;">■</option>
                  <option value="green" style="color: green;">■</option>
                  <option value="orange" style="color: orange;">■</option>
                  <option value="purple" style="color: purple;">■</option>
                  <option value="pink" style="color: pink;">■</option>
              </select>
              <button onclick="document.execCommand('hiliteColor', false, 'yellow')">형광펜</button>
              <button onclick="document.execCommand('bold', false, '');">굵게</button>
              <button onclick="document.execCommand('italic', false, '');">기울이기</button>
              <button onclick="document.execCommand('underline', false, '');">밑줄</button>
              <button onclick="document.execCommand('justifyLeft', false, '');">왼쪽 정렬</button>
              <button onclick="document.execCommand('justifyCenter', false, '');">가운데 정렬</button>
              <button onclick="document.execCommand('justifyRight', false, '');">오른쪽 정렬</button>
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

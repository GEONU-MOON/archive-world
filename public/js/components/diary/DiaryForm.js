function postDiary() {
  confirm("다이어리를 등록하시겠습니까?"); // todo: confirm 확인/취소 처리

  let newDiaryData = document.querySelector("#editor").innerHTML;
  newDiaryData = `<div>${newDiaryData}</div>`;
  console.log(newDiaryData);

  // todo: diary post 요청
}

function changeFontColor() {
  var color = document.getElementById("color-select").value;
  document.execCommand("foreColor", false, color);
}

function DiaryForm() {
  const component = `
  <div class="diary-form-container">
    <div class="diary-post">
      <button id="btn-diary-post" onclick="postDiary()">글쓰기✏️</button>
    </div>
    <hr />
    <div id="toolbar">
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
      <button onclick="document.execCommand('insertUnorderedList', false, '');">토글 리스트</button>
    </div>
    <div id="editor" contenteditable="true"></div>
  </div>
  `;
  return component;
}

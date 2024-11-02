function getTodayFormatted() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

async function postDiary() {
  if (!confirm("다이어리를 등록하시겠습니까?")) {
    return;
  }

  let newDiaryData = document.querySelector("#editor").innerHTML;
  newDiaryData = `<div>${newDiaryData}</div>`;

  try {
    const response = await fetchWithToken("/api/diary/write", {
      method: "POST",
      body: JSON.stringify({ content: newDiaryData }),
    });

    if (response.ok) {
      alert("다이어리가 성공적으로 등록되었습니다.");
      window.location.assign(`/diary/${getTodayFormatted()}`);
    } else {
      const errorData = await response.json();
      alert(`다이어리 등록 실패: ${errorData.error}`);
    }
  } catch (error) {
    console.error("다이어리 등록 중 오류가 발생했습니다:", error);
    alert("다이어리 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
}


function changeFontColor() {
  var color = document.getElementById("color-select").value;
  document.execCommand("foreColor", false, color);
}

function DiaryForm() {
  const component = `
  <div class="diary-form-container">
    <div class="diary-post">
      <button id="btn-diary-post" onclick="postDiary()">저장하기✏️</button>
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

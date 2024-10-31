const navigateTo = url => {
  history.pushState(null, null, url);
  router();
};

const loadComponent = scriptSrc => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${scriptSrc}"]`)) {
      // <script> 태그가 이미 존재하는 경우 Promise를 resolve
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${scriptSrc}`));
    document.head.appendChild(script);
  });
};

// const loadCSS = href => {
//   return new Promise((resolve, reject) => {
//     // 모든 CSS 링크를 찾아 제거
//     document.querySelectorAll("link[type='text/css']").forEach(link => link.remove());

//     const link = document.createElement("link");
//     link.href = href;
//     link.type = "text/css";
//     link.rel = "stylesheet";

//     // CSS 로드가 완료되면 resolve
//     link.onload = () => resolve();
//     link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));

//     document.head.appendChild(link);
//   });
// };

const routes = [
  {
    path: "/",
    view: async () => {
      await loadComponent("/js/components/HomeComponent.js");
      // await loadCSS("/css/HomeComponent.css");
      return HomeComponent();
    },
  },
  {
    path: "/login",
    view: async () => {
      await loadComponent("/js/components/loginForm.js");
      return loginForm();
    },
  },
  {
    path: "/diary/post",
    view: async () => {
      await loadComponent("/js/components/diary/DiaryForm.js");
      // await loadCSS("/css/diaryForm.css");
      return DiaryForm();
    },
  },
  {
    path: "/diary/:date",
    view: async params => {
      await loadComponent("/js/components/diary/DiaryDate.js");
      // await loadCSS("/css/diaryDate.css");
      return DiaryDate(params.date);
    },
  },
  {
    path: "/photo/board",
    view: async () => {
      await loadComponent("/js/components/photo/photoBoard.js");
      // await loadCSS("/css/photoBoard.css");
      return photoBoard();
    },
  },
  {
    path: "/photo/post",
    view: async () => {
      await loadComponent("/js/components/photo/photoForm.js");
      // await loadCSS("/css/photoForm.css");
      return photoForm();
    },
  },
  {
    path: "/visitor",
    view: async () => {
      // await loadCSS("/css/visitor.css");
      await loadComponent("/js/components/visitor/VisitorComponent.js");
      return VisitorComponent();
    },
  },
];

const router = async () => {
  const potentialMatches = routes.map(route => {
    return {
      route: route,
      result: location.pathname.match(pathToRegex(route.path)),
    };
  });

  let matchRoute = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

  if (!matchRoute) {
    document.querySelector("#app").innerHTML = "<h1>404 not found</h1>";
    return;
  }

  const params = getParams(matchRoute);
  const view = await matchRoute.route.view(params);

  const contentContainer = matchRoute.route.path === "/login" ? document.querySelector("#app") : document.querySelector(".white-box");
  contentContainer.innerHTML = view;
};

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = matchRoute => {
  const values = matchRoute.result.slice(1); // 실제 url 에서 date 영역 가져오기
  const keys = Array.from(matchRoute.route.path.matchAll(/:(\w+)/g)).map(result => result[1]); // 동적 라우팅 ":date" 에서 "date" 가져오기
  return Object.fromEntries(keys.map((key, i) => [key, values[i]])); // result ex: { date: "20240729" }
};

// 현재 경로에 따라 탭 스타일을 업데이트하는 함수
function updateTabStyles(currentPath) {
  const tabs = document.querySelectorAll("[data-link]");
  tabs.forEach(tab => {
    const parentDiv = tab.parentElement;
    const href = tab.getAttribute("href");

    if (
      currentPath === href ||
      (currentPath.startsWith("/diary") && href.startsWith("/diary")) ||
      (currentPath.startsWith("/photo") && href.startsWith("/photo"))
    ) {
      parentDiv.classList.add("active-tab-item");
      parentDiv.classList.remove("tab-item");
    } else {
      parentDiv.classList.remove("active-tab-item");
      parentDiv.classList.add("tab-item");
    }
  });
}

window.addEventListener("popstate", () => {
  router();
  updateTabStyles(window.location.pathname);
}); // 뒤로 가기 or 앞으로 가기

document.addEventListener("DOMContentLoaded", () => {
  router();
  updateTabStyles(window.location.pathname);

  document.body.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault(); // 새로고침 막기
      const url = e.target.getAttribute("href"); // href 속성을 가져와서 navigateTo 호출
      navigateTo(url);

      // 모든 탭의 "active-tab-item" 클래스를 제거
      document.querySelectorAll(".tab-item, .active-tab-item").forEach(tab => {
        tab.classList.remove("active-tab-item");
        tab.classList.add("tab-item");
      });

      // 클릭된 탭에 "active-tab-item" 클래스 추가
      e.target.closest("div").classList.add("active-tab-item");
    }
  });
});

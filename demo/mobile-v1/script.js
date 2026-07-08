const pageTitles = {
  chat: "今天想规划什么行程？",
  knowledge: "整理你的游学知识库",
  compare: "对比复杂行程方案",
  planb: "准备途中 Plan B",
};

const toast = document.querySelector("#toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.toggle("is-active", content.dataset.page === tabName);
  });

  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tabName);
  });

  document.querySelector("#pageTitle").textContent = pageTitles[tabName];
  document.querySelector("#appScreen").scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelector("#departBtn").addEventListener("click", () => {
  document.querySelector("#splashScreen").classList.remove("is-active");
  document.querySelector("#appScreen").classList.add("is-active");
  showToast("欢迎来到 TripMind AI，先从一个旅行问题开始。");
});

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

document.querySelector("#askBtn").addEventListener("click", () => {
  showToast("已识别你的问题：需要进入行程对比，并结合知识库记忆分析。");
  setTimeout(() => switchTab("compare"), 450);
});

document.querySelector("#uploadBtn").addEventListener("click", () => {
  showToast("Demo 中使用示例文件模拟上传与解析。");
});

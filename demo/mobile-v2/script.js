const pageTitles = {
  chat: "TripMind AI",
  knowledge: "知识库",
};

const toast = document.querySelector("#toast");
const drawer = document.querySelector("#sideDrawer");
const drawerBackdrop = document.querySelector("#drawerBackdrop");
const chatDock = document.querySelector(".chat-dock");
const questionInput = document.querySelector("#questionInput");
const composer = document.querySelector(".composer");
const attachPanel = document.querySelector("#attachPanel");
const modeButtons = document.querySelectorAll("[data-mode]");
const askBtn = document.querySelector("#askBtn");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function setDrawer(isOpen) {
  drawer.classList.toggle("is-open", isOpen);
  drawer.setAttribute("aria-hidden", String(!isOpen));
  drawerBackdrop.hidden = !isOpen;
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.toggle("is-active", content.dataset.page === tabName);
  });

  document.querySelectorAll(".drawer-item").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tabName);
  });

  document.querySelector("#pageTitle").textContent = pageTitles[tabName];
  chatDock.classList.toggle("is-hidden", tabName !== "chat");
  document.querySelector(".app-body").scrollTo({ top: 0, behavior: "smooth" });
  setDrawer(false);
}

function setAttachPanel(isOpen) {
  attachPanel.hidden = !isOpen;
}

function setVoiceMode(isVoice) {
  composer.classList.toggle("is-voice", isVoice);
  setAttachPanel(false);
  if (!isVoice) questionInput.focus();
}

function setMode(modeName) {
  const activeButton = [...modeButtons].find((button) => button.classList.contains("is-active"));
  const shouldClear = activeButton?.dataset.mode === modeName;
  modeButtons.forEach((button) => {
    button.classList.toggle("is-active", !shouldClear && button.dataset.mode === modeName);
  });
}

function autoDetectMode(value) {
  const modeRules = [
    ["行程规划", ["行程", "路线", "规划", "游学"]],
    ["Plan B", ["plan b", "备选", "天气", "突发", "改签", "退票"]],
    ["知识库检索", ["知识库", "攻略", "资料", "文件", "笔记"]],
  ];
  const normalizedValue = value.toLowerCase();
  const matched = modeRules.find(([, keywords]) =>
    keywords.some((keyword) => normalizedValue.includes(keyword.toLowerCase())),
  );
  if (matched && !document.querySelector(".mode-strip button.is-active")) setMode(matched[0]);
}

document.querySelector("#departBtn").addEventListener("click", () => {
  document.querySelector("#splashScreen").classList.remove("is-active");
  document.querySelector("#appScreen").classList.add("is-active");
  showToast("欢迎来到 TripMind AI，先从一个旅行问题开始。");
});

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

document.querySelector("#menuBtn").addEventListener("click", () => setDrawer(true));
document.querySelector("#closeDrawerBtn").addEventListener("click", () => setDrawer(false));
drawerBackdrop.addEventListener("click", () => setDrawer(false));

document.querySelectorAll(".suggestion-list button").forEach((button) => {
  button.addEventListener("click", () => {
    questionInput.value = button.textContent;
    resizeQuestionInput();
    syncSendButton();
    autoDetectMode(questionInput.value);
    questionInput.focus();
  });
});

function resizeQuestionInput() {
  questionInput.style.height = "30px";
  questionInput.style.height = `${Math.min(questionInput.scrollHeight, 92)}px`;
}

function syncSendButton() {
  askBtn.disabled = questionInput.value.trim().length === 0;
}

questionInput.addEventListener("input", () => {
  resizeQuestionInput();
  syncSendButton();
  autoDetectMode(questionInput.value);
});
resizeQuestionInput();
syncSendButton();

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

document.querySelector(".voice-btn").addEventListener("click", () => setVoiceMode(true));
document.querySelector(".keyboard-btn").addEventListener("click", () => setVoiceMode(false));
document.querySelector(".voice-close-btn").addEventListener("click", () => setVoiceMode(false));

document.querySelector(".attach-btn").addEventListener("click", () => {
  setVoiceMode(false);
  setAttachPanel(attachPanel.hidden);
});

attachPanel.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    showToast(`Demo 中模拟选择：${button.innerText.trim()}`);
    setAttachPanel(false);
  });
});

askBtn.addEventListener("click", () => {
  if (askBtn.disabled) return;
  const activeMode = document.querySelector(".mode-strip button.is-active")?.dataset.mode;
  const modeText = activeMode ? `${activeMode}模式` : "通用问答";
  showToast(`已收到问题，将按${modeText}生成结果。`);
});

document.querySelector("#uploadBtn").addEventListener("click", () => {
  showToast("Demo 中使用示例文件模拟上传与解析。");
});

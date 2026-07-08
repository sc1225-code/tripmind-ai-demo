const defaultPrompt =
  "我在新疆 15 天自驾和云南 15 天游学之间纠结，预算 1.5 万，不吃牛羊肉，容易晕车，希望每天保留 2 小时学习时间，帮我分析哪个更适合。";

const defaultMemories = [
  { key: "预算上限", value: "15000 元", type: "本次行程" },
  { key: "饮食限制", value: "不吃牛羊肉", type: "长期偏好" },
  { key: "体力限制", value: "容易晕车", type: "长期偏好" },
  { key: "学习目标", value: "每天 2 小时", type: "本次行程" },
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const toast = $("#toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function setBadge(id, text, state) {
  const badge = $(id);
  if (!badge) return;
  badge.textContent = text;
  badge.classList.remove("pending", "done", "warning");
  if (state) badge.classList.add(state);
}

function scrollToStep(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateActiveNav() {
  const sections = $$(".step-section");
  let activeId = sections[0]?.id;
  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 145) activeId = section.id;
  }

  $$(".nav-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.target === activeId);
  });
}

function markParsedReady() {
  $("#parsedTask").classList.remove("is-muted");
  $("#parsedTask .mini-header span").textContent = "已识别";
  setBadge("#intakeStatus", "已分析", "done");
}

function simulateAnalyze() {
  setBadge("#intakeStatus", "分析中", "warning");
  showToast("TripMind AI 正在抽取方案、预算和个人约束。");
  setTimeout(() => {
    markParsedReady();
    showToast("已识别两套备选方案和 4 条关键约束。");
    scrollToStep("step-upload");
  }, 700);
}

function simulateUpload(files = []) {
  setBadge("#uploadStatus", "解析中", "warning");
  const list = $("#fileList");

  if (files.length) {
    list.innerHTML = "";
    files.forEach((file) => {
      const row = document.createElement("div");
      row.className = "file-row";
      row.innerHTML = `<span>${file.name}</span><strong>已上传</strong>`;
      list.appendChild(row);
    });
  } else {
    $$("#fileList .file-row strong").forEach((status) => {
      status.textContent = "解析中";
      status.style.color = "#a56216";
    });
  }

  showToast("正在模拟解析攻略、预算和学习计划。");
  setTimeout(() => {
    $("#knowledgeCard").classList.remove("is-muted");
    $("#knowledgeCard .mini-header span").textContent = "已生成 4 条";
    setBadge("#uploadStatus", "已解析", "done");
    $$("#fileList .file-row strong").forEach((status) => {
      status.textContent = "已解析";
      status.style.color = "";
    });
    showToast("资料已转化为可用于决策的知识条目。");
    scrollToStep("step-memory");
  }, 850);
}

function renderMemories(memories) {
  const grid = $("#memoryGrid");
  grid.innerHTML = "";
  memories.forEach((memory) => {
    const article = document.createElement("article");
    article.className = "memory-card";
    article.dataset.key = memory.key;
    article.innerHTML = `
      <div>
        <span>${memory.key}</span>
        <strong contenteditable="true">${memory.value}</strong>
      </div>
      <select aria-label="${memory.key}记忆类型">
        <option ${memory.type === "本次行程" ? "selected" : ""}>本次行程</option>
        <option ${memory.type === "长期偏好" ? "selected" : ""}>长期偏好</option>
      </select>
      <button type="button" class="text-btn remove-memory">删除</button>
    `;
    grid.appendChild(article);
  });
  bindMemoryRemove();
}

function getMemoriesFromCards() {
  return $$(".memory-card").map((card) => {
    const key = card.dataset.key;
    const value = card.querySelector("strong").textContent.trim();
    const type = card.querySelector("select").value;
    return { key, value, type };
  });
}

function updateContextMemory() {
  const memories = getMemoriesFromCards();
  const list = $("#contextMemory");
  list.innerHTML = "";
  memories.forEach((memory) => {
    const li = document.createElement("li");
    li.textContent = `${memory.key.replace("上限", "")} ${memory.value}`;
    list.appendChild(li);
  });
  $("#memoryCount").textContent = `${memories.length} 项`;
}

function bindMemoryRemove() {
  $$(".remove-memory").forEach((button) => {
    button.addEventListener("click", () => {
      button.closest(".memory-card").remove();
      updateContextMemory();
      showToast("已从本次分析中移除该记忆。");
    });
  });
}

function updateTodo(removeText) {
  const items = $$("#todoList li");
  items.forEach((item) => {
    if (item.textContent === removeText) item.remove();
  });
  $("#todoCount").textContent = `${$$("#todoList li").length} 项`;
}

function confirmMemory() {
  updateContextMemory();
  setBadge("#memoryStatus", "已确认", "done");
  updateTodo("记忆卡片待确认");
  showToast("记忆已确认，将用于本次对比分析。");
  scrollToStep("step-compare");
}

function confirmPlan() {
  setBadge("#planStatus", "已确认", "done");
  updateTodo("推荐行程待确认");
  showToast("已确认云南 15 天游学概要方案。");
  scrollToStep("step-planb");
}

function confirmPlanB() {
  updateTodo("Plan B 操作待确认");
  showToast("已生成调整方案。MVP 不会执行真实取消、预订或打车。");
}

function addInlineDetail(button, text) {
  const existing = button.nextElementSibling;
  if (existing?.classList.contains("inline-detail")) {
    existing.remove();
    return;
  }
  const detail = document.createElement("div");
  detail.className = "inline-detail";
  detail.style.padding = "12px";
  detail.style.borderTop = "1px solid var(--line)";
  detail.style.background = "#fbfcfc";
  detail.style.color = "var(--muted)";
  detail.style.lineHeight = "1.7";
  detail.textContent = text;
  button.insertAdjacentElement("afterend", detail);
}

function init() {
  $$(".nav-item").forEach((item) => {
    item.addEventListener("click", () => scrollToStep(item.dataset.target));
  });

  window.addEventListener("scroll", updateActiveNav, { passive: true });

  $("#analyzeBtn").addEventListener("click", simulateAnalyze);
  $("#resetPromptBtn").addEventListener("click", () => {
    $("#tripPrompt").value = defaultPrompt;
    showToast("已恢复示例需求。");
  });

  $("#uploadZone").addEventListener("click", (event) => {
    if (event.target !== $("#fileInput")) $("#fileInput").click();
  });
  $("#fileInput").addEventListener("change", (event) => {
    simulateUpload(Array.from(event.target.files));
  });
  $("#uploadZone").addEventListener("dragover", (event) => {
    event.preventDefault();
    $("#uploadZone").style.borderColor = "var(--green)";
  });
  $("#uploadZone").addEventListener("dragleave", () => {
    $("#uploadZone").style.borderColor = "";
  });
  $("#uploadZone").addEventListener("drop", (event) => {
    event.preventDefault();
    $("#uploadZone").style.borderColor = "";
    simulateUpload(Array.from(event.dataTransfer.files));
  });

  $("#confirmMemoryBtn").addEventListener("click", confirmMemory);
  $("#restoreMemoryBtn").addEventListener("click", () => {
    renderMemories(defaultMemories);
    updateContextMemory();
    showToast("已恢复默认记忆卡片。");
  });

  $("#confirmPlanBtn").addEventListener("click", confirmPlan);
  $("#relaxPlanBtn").addEventListener("click", () => showToast("已模拟将 Day 7-10 的移动节奏降低。"));
  $("#budgetPlanBtn").addEventListener("click", () => showToast("已模拟减少高成本交通和体验项目。"));
  $("#confirmPlanBBtn").addEventListener("click", confirmPlanB);
  $("#weatherAlert").addEventListener("click", () => scrollToStep("step-planb"));

  $$(".knowledge-row").forEach((row) => {
    row.addEventListener("click", () => {
      addInlineDetail(row, "原始资料片段示例：该结论来自用户上传攻略中的交通、预算或天气描述，真实产品中会展示可追溯引用。");
    });
  });

  $$(".compare-row").forEach((row) => {
    row.addEventListener("click", () => {
      addInlineDetail(row, "维度依据示例：结合用户记忆、上传资料和模拟外部工具结果生成。MVP 阶段展示固定维度，后续可支持权重调整。");
    });
  });

  bindMemoryRemove();
  updateContextMemory();
}

document.addEventListener("DOMContentLoaded", init);

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
const resultStream = document.querySelector("#resultStream");
const chatContent = document.querySelector('[data-page="chat"]');
const appBody = document.querySelector(".app-body");
const memoryConfirmCard = document.querySelector("#memoryConfirmCard");
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
  document.querySelector(".attach-btn").setAttribute("aria-expanded", String(isOpen));
}

function blurQuestionInput() {
  if (document.activeElement === questionInput) questionInput.blur();
}

function setVoiceMode(isVoice, shouldFocusInput = false) {
  composer.classList.toggle("is-voice", isVoice);
  setAttachPanel(false);
  if (!isVoice && shouldFocusInput) questionInput.focus();
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
  button.addEventListener("click", (event) => {
    event.preventDefault();
    questionInput.value = button.textContent;
    resizeQuestionInput();
    syncSendButton();
    autoDetectMode(questionInput.value);
    blurQuestionInput();
  });
});

function resizeQuestionInput() {
  questionInput.style.height = "30px";
  questionInput.style.height = `${Math.min(questionInput.scrollHeight, 92)}px`;
}

function syncSendButton() {
  askBtn.disabled = questionInput.value.trim().length === 0;
}

function getActiveMode() {
  return document.querySelector(".mode-strip button.is-active")?.dataset.mode;
}

function scrollResultsToTop() {
  requestAnimationFrame(() => appBody.scrollTo({ top: 0, behavior: "smooth" }));
}

function renderResult(question, mode) {
  chatContent.classList.add("has-results");
  resultStream.innerHTML =
    mode === "Plan B" || /天气|plan b|突发|下雨|改签|退票/i.test(question)
      ? buildPlanBResult(question)
      : buildTripPlanResult(question, mode);
  questionInput.value = "";
  resizeQuestionInput();
  syncSendButton();
  setAttachPanel(false);
  setVoiceMode(false);
  blurQuestionInput();
  bindResultActions();
  scrollResultsToTop();
}

function buildTripPlanResult(question, mode) {
  const detectedText =
    mode === "行程规划" ? "已按你选择的「行程规划」分析" : "已自动识别为「行程规划」问题";

  return `
    <div class="user-bubble">${question}</div>
    <div class="ai-strip">${detectedText}<br />参考你的资料、AI 记忆和模拟天气信息。</div>
    <article class="ai-card">
      <h3>推荐结论</h3>
      <p><strong>更推荐：云南 15 天游学。</strong></p>
      <p>它更符合预算、学习时间和交通强度要求；新疆自驾体验更强，但对体力、天气稳定性和长距离移动的要求更高。</p>
      <span class="confidence">置信度：较高</span>
    </article>
    <article class="ai-card">
      <h3>多维对比</h3>
      <p>横向滑动查看 7 个决策维度，每张卡展示一个维度的方案差异。</p>
      <div class="compare-carousel" aria-label="新疆与云南多维对比">
        ${compareItem("预算成本", 62, 86, "云南", "云南住宿和城市交通选择更多，更容易控制总费用。")}
        ${compareItem("时间节奏", 58, 88, "云南", "云南更适合慢节奏停留，也更容易留出学习窗口。")}
        ${compareItem("交通强度", 45, 82, "云南", "新疆长距离自驾对体力和抗晕车能力要求更高。")}
        ${compareItem("天气季节", 60, 78, "云南", "云南城市与室内空间更多，抗天气波动能力更强。")}
        ${compareItem("安全风险", 55, 80, "云南", "新疆山路和跨区域转场的不确定性更高。")}
        ${compareItem("体验价值", 92, 84, "看偏好", "新疆自然景观冲击力更强，云南游学和文化体验更均衡。")}
        ${compareItem("学习适配", 48, 90, "云南", "云南更容易安排每天 2 小时的稳定学习时间。")}
      </div>
      <div class="compare-conclusion">
        <strong>结论：云南更适合你这次出行。</strong>
        <p>它在预算、节奏、交通强度和学习适配上更稳定；新疆的自然体验更强，但更适合作为低强度备选路线。</p>
      </div>
    </article>
    <article class="ai-card">
      <h3>备选方案</h3>
      <div class="option-list">
        <section class="option-item">
          <header><h4>A 云南慢节奏游学</h4><span class="fit-tag">推荐</span></header>
          <p>昆明 3 天 → 大理 5 天 → 丽江 4 天 → 返程缓冲 3 天。</p>
          <button type="button" data-fill="生成云南 15 天游学详细日程">生成详细日程</button>
        </section>
        <section class="option-item">
          <header><h4>B 新疆低强度版本</h4><span class="fit-tag">备选</span></header>
          <p>不做全程自驾，只保留 2-3 个核心目的地，减少跨区域长距离转场。</p>
          <button type="button" data-fill="生成新疆低强度备选路线">查看备选路线</button>
        </section>
      </div>
    </article>
    <article class="ai-card">
      <h3>下一步</h3>
      <div class="card-actions">
        <button class="primary-action" type="button" data-fill="生成云南 15 天游学日程">生成云南日程</button>
        <button class="ghost-action" type="button" data-fill="补充出发城市">补充出发城市</button>
        <button class="ghost-action" type="button" data-fill="调整预算到 12000 元再分析">调整预算</button>
      </div>
    </article>
    <article class="ai-card">
      <h3>来源与不确定项</h3>
      <p>参考 4 份资料、4 条 AI 记忆和 3 类模拟工具数据。</p>
      <details>
        <summary>查看来源</summary>
        <ul>
          <li>资料源：云南游学攻略.pdf、新疆 15 天自驾笔记.jpg、个人预算计划.xlsx、课程安排截图.png</li>
          <li>AI 记忆：预算 15000 元、每天学习 2 小时、容易晕车、偏好慢节奏</li>
          <li>模拟工具：目的地天气趋势、城市间交通时间、住宿价格区间</li>
        </ul>
      </details>
      <details>
        <summary>查看不确定项</summary>
        <ul>
          <li>出发城市、具体出行月份、是否有同行人</li>
          <li>实时机票和住宿价格</li>
          <li>新疆部分路线当季开放状态</li>
        </ul>
      </details>
    </article>
  `;
}

function buildPlanBResult(question) {
  return `
    <div class="user-bubble">${question}</div>
    <div class="ai-strip">已按「Plan B」分析<br />突发类型：天气变化影响户外活动。</div>
    <article class="ai-card">
      <h3>影响判断</h3>
      <p><strong>明天大理降雨会影响环洱海骑行。</strong></p>
      <p>雨天骑行体验下降，安全风险升高。建议不要执行完整环洱海骑行，改为室内与短距离低风险安排。</p>
      <span class="confidence">置信度：中等偏高</span>
    </article>
    <article class="ai-card">
      <h3>替代方案</h3>
      <div class="option-list">
        <section class="option-item">
          <header><h4>A 低风险学习日</h4><span class="fit-tag">稳妥</span></header>
          <p>咖啡馆学习 2 小时 + 室内展馆 / 书店 / 手作体验 + 晚上整理游学笔记。</p>
          <button type="button" data-toast="已选择低风险学习日，下面请确认执行事项。">采用</button>
        </section>
        <section class="option-item">
          <header><h4>B 轻量体验日</h4><span class="fit-tag">均衡</span></header>
          <p>雨势减弱后古城短距离步行，下午选择 1 个室内体验点。</p>
          <button type="button" data-toast="已选择轻量体验日，下面请确认执行事项。">采用</button>
        </section>
        <section class="option-item">
          <header><h4>C 顺延骑行</h4><span class="fit-tag">体验优先</span></header>
          <p>明天改为学习和室内安排，将环洱海骑行顺延到后天。</p>
          <button type="button" data-toast="顺延前需要确认后天天气和预约规则。">查看可行性</button>
        </section>
      </div>
    </article>
    <article class="ai-card">
      <h3>成本与时间变化</h3>
      <div class="cost-grid">
        <span>新增：打车 50-120 元</span>
        <span>新增：室内体验 50-200 元</span>
        <span>节省：骑行租车费用</span>
        <span>学习：保留 2-3 小时</span>
      </div>
    </article>
    <article class="ai-card">
      <h3>执行前确认</h3>
      <div class="check-list">
        <label><input type="checkbox" /> 骑行预约是否可取消或改期</label>
        <label><input type="checkbox" /> 后天天气是否适合顺延</label>
        <label><input type="checkbox" /> 明天是否有必须完成的学习任务</label>
        <label><input type="checkbox" /> 是否接受新增交通费用</label>
      </div>
      <button class="inline-action" type="button" data-fill="基于低风险学习日生成调整后日程">生成调整后日程</button>
    </article>
    <article class="ai-card">
      <h3>来源与边界</h3>
      <p>参考当前行程、AI 记忆和模拟天气工具。AI 不会自动取消预约、改签订单或通知同行人。</p>
      <details>
        <summary>查看来源</summary>
        <ul>
          <li>当前行程：大理环洱海骑行</li>
          <li>AI 记忆：每天保留 2 小时学习时间、容易晕车、偏好慢节奏</li>
          <li>模拟天气工具：明天大理有降雨风险</li>
        </ul>
      </details>
    </article>
  `;
}

function compareItem(title, xinjiangScore, yunnanScore, fit, reason) {
  return `
    <section class="compare-item">
      <header><h4>${title}</h4><span class="fit-tag">${fit}</span></header>
      <div class="score-row">
        <span>新疆</span>
        <div class="score-track"><i style="width: ${xinjiangScore}%"></i></div>
        <strong>${xinjiangScore}</strong>
      </div>
      <div class="score-row yunnan-score">
        <span>云南</span>
        <div class="score-track"><i style="width: ${yunnanScore}%"></i></div>
        <strong>${yunnanScore}</strong>
      </div>
      <p>${reason}</p>
    </section>
  `;
}

function fillQuestion(value) {
  questionInput.value = value;
  resizeQuestionInput();
  syncSendButton();
  autoDetectMode(value);
  blurQuestionInput();
}

function bindResultActions() {
  resultStream.querySelectorAll("[data-fill]").forEach((button) => {
    button.addEventListener("click", () => fillQuestion(button.dataset.fill));
  });

  resultStream.querySelectorAll("[data-toast]").forEach((button) => {
    button.addEventListener("click", () => showToast(button.dataset.toast));
  });
}

questionInput.addEventListener("input", () => {
  resizeQuestionInput();
  syncSendButton();
  autoDetectMode(questionInput.value);
});

questionInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
  event.preventDefault();
  if (!askBtn.disabled) askBtn.click();
});
resizeQuestionInput();
syncSendButton();

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

document.querySelector(".voice-btn").addEventListener("click", () => setVoiceMode(true));
document.querySelector(".keyboard-btn").addEventListener("click", () => setVoiceMode(false, true));
document.querySelector(".voice-close-btn").addEventListener("click", () => setVoiceMode(false));

document.querySelector(".attach-btn").addEventListener("click", (event) => {
  event.preventDefault();
  const shouldOpen = attachPanel.hidden;
  setVoiceMode(false);
  setAttachPanel(shouldOpen);
  blurQuestionInput();
});

attachPanel.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    showToast(`Demo 中模拟选择：${button.innerText.trim()}`);
    setAttachPanel(false);
  });
});

askBtn.addEventListener("click", (event) => {
  event.preventDefault();
  if (askBtn.disabled) return;
  const question = questionInput.value.trim();
  const activeMode = getActiveMode();
  blurQuestionInput();
  renderResult(question, activeMode);
  showToast("已生成 AI 结果卡片。");
});

document.querySelector("#uploadBtn").addEventListener("click", () => {
  memoryConfirmCard.hidden = false;
  showToast("已模拟解析资料，并发现可保存的 AI 记忆。");
  appBody.scrollTo({ top: appBody.scrollHeight, behavior: "smooth" });
});

document.querySelector("#saveMemoryBtn").addEventListener("click", () => {
  memoryConfirmCard.querySelectorAll("input").forEach((input) => {
    input.checked = true;
  });
  showToast("已保存为 AI 记忆，后续规划会自动参考。");
});

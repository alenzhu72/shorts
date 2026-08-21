const storyInput = document.querySelector("#storyInput");
const fileInput = document.querySelector("#fileInput");
const fileName = document.querySelector("#fileName");
const imageInput = document.querySelector("#imageInput");
const slotImageInput = document.querySelector("#slotImageInput");
const imageDrop = document.querySelector("#imageDrop");
const imagePreviewGrid = document.querySelector("#imagePreviewGrid");
const apiKeyInput = document.querySelector("#apiKeyInput");
const apiHostSelect = document.querySelector("#apiHostSelect");
const modelInput = document.querySelector("#modelInput");
const resolutionSelect = document.querySelector("#resolutionSelect");
const totalMinutes = document.querySelector("#totalMinutes");
const chapterCount = document.querySelector("#chapterCount");
const clipCountSelect = document.querySelector("#clipCountSelect");
const styleSelect = document.querySelector("#styleSelect");
const characterSelect = document.querySelector("#characterSelect");
const categorySelect = document.querySelector("#categorySelect");
const firstImageOnly = document.querySelector("#firstImageOnly");
const generateBtn = document.querySelector("#generateBtn");
const generateAllVideosBtn = document.querySelector("#generateAllVideosBtn");
const testApiBtn = document.querySelector("#testApiBtn");
const exportBtn = document.querySelector("#exportBtn");
const clearBtn = document.querySelector("#clearBtn");
const progressLabel = document.querySelector("#progressLabel");
const progressCount = document.querySelector("#progressCount");
const progressBar = document.querySelector("#progressBar");
const taskLookupInput = document.querySelector("#taskLookupInput");
const taskLookupBtn = document.querySelector("#taskLookupBtn");
const taskLookupResult = document.querySelector("#taskLookupResult");
const results = document.querySelector("#results");
const resultHint = document.querySelector("#resultHint");
const template = document.querySelector("#cardTemplate");
const API_ORIGIN = "";
const STORAGE_KEY = "story-video-prompt-tool-state-v2";

let generatedSegments = [];
let referenceImageDataUrls = [];
let activeImageSlot = 0;
let saveTimer = 0;

const copy = {
  zh: {
    langCode: "zh-CN",
    pageTitle: "故事章节视频生成器",
    clear: "清空",
    filePicker: "选择 TXT 文件",
    fileHint: "也可以直接粘贴文本",
    imageTitle: "人物参考图片",
    imageHint: "拖入或选择最多 4 张人物图片。每个章节和片段都会使用同一组人物参考图。",
    imagePicker: "选择图片",
    apiKey: "MiniMax API Key",
    model: "模型",
    resolution: "分辨率",
    placeholder: "把完整故事粘贴到这里，或导入 .txt 文件。支持“第1章 / 第一章 / Chapter 1 / ### 标题”等章节标记。",
    inputAria: "故事输入",
    controlsAria: "分章设置",
    language: "输出语言",
    totalMinutes: "故事总时长",
    minutes: "分钟",
    chapterCount: "输出章节数",
    chapters: "章",
    clipCount: "每章视频段数",
    splitMode: "切分方式",
    splitChapter: "识别原章节",
    splitAuto: "语义分章",
    style: "画面风格",
    character: "人物类型",
    category: "故事分类",
    generate: "生成摘要和提示词",
    generateAll: "生成全部视频",
    generateOne: "生成本章视频",
    wait: "等待输入",
    imported: "已导入文本",
    imageReady: "人物图片已导入",
    needStory: "请先导入或粘贴完整故事",
    needKey: "请先填写 MiniMax API Key",
    needImage: "请先上传 1-4 张人物参考图片",
    analyzing: "正在分析故事结构",
    generated: "生成完成，可以编辑或发起视频任务",
    generating: (current, total) => `正在生成第 ${current} / ${total} 条`,
    submitting: "正在提交 MiniMax H3 任务",
    compressing: "正在压缩人物参考图",
    polling: (current, total, status) => `片段 ${current}/${total}：${status}`,
    videoDone: "视频生成完成",
    resultTitle: "输出结果",
    resultHint: "每章生成 1-5 段 10 秒视频，所有段都使用同一组人物参考图保持人物统一。",
    resultHintDone: (minutes, total, chunks) => `${minutes} 分钟故事已分成 ${total} 章，每章生成 ${chunks} 段 10 秒视频；所有章节和片段使用同一组人物参考图。`,
    export: "导出 TXT",
    summaryLabel: "章节总结",
    promptLabel: "MiniMax H3 视频提示词",
    copy: "复制",
    copied: "已复制",
    duration: (chunks) => `视频：${chunks} 段 × 10秒`,
    summaryExport: "章节总结：",
    promptExport: "MiniMax H3 提示词：",
    defaultChapter: (index) => `第 ${index} 章`,
    chars: "字",
    arcStart: "开场",
    arcMiddle: "推进",
    arcEnd: "收束",
    continuity: "人物连续性：严格参考上传的 1-4 张人物图片，每张图对应一个固定人物；所有章节和所有片段都使用同一批主要人物；脸型、发型、五官、服装主色、年龄感和气质保持一致，即使剧情场景变化也不要换人。",
    videoOnly: "只生成 9:16 竖屏视频画面；不要声音、不要字幕、不要背景音乐、不要配音、不要旁白、不要屏幕文字。"
  },
  en: {
    langCode: "en",
    pageTitle: "Story Chapter Video Generator",
    clear: "Clear",
    filePicker: "Choose TXT File",
    fileHint: "Or paste story text directly",
    imageTitle: "Character Reference Image",
    imageHint: "Drop or choose up to 4 character images. Every chapter and clip will use the same character reference set.",
    imagePicker: "Choose Image",
    apiKey: "MiniMax API Key",
    model: "Model",
    resolution: "Resolution",
    placeholder: "Paste the full story here, or import a .txt file. Supports markers like Chapter 1, Part One, ### Title, 第1章.",
    inputAria: "Story input",
    controlsAria: "Chapter settings",
    language: "Output Language",
    totalMinutes: "Story Length",
    minutes: "min",
    chapterCount: "Output Chapters",
    chapters: "chapters",
    clipCount: "Clips Per Chapter",
    splitMode: "Split Mode",
    splitChapter: "Detect Chapters",
    splitAuto: "Semantic Split",
    style: "Visual Style",
    character: "Character Type",
    category: "Story Category",
    generate: "Generate Summaries and Prompts",
    generateAll: "Generate All Videos",
    generateOne: "Generate Chapter Video",
    wait: "Waiting for input",
    imported: "Text imported",
    imageReady: "Character image imported",
    needStory: "Please import or paste the full story first",
    needKey: "Please enter your MiniMax API key first",
    needImage: "Please upload 1-4 character reference images first",
    analyzing: "Analyzing story structure",
    generated: "Done. You can edit prompts or start video tasks.",
    generating: (current, total) => `Generating ${current} / ${total}`,
    submitting: "Submitting MiniMax H3 task",
    compressing: "Compressing character reference images",
    polling: (current, total, status) => `Clip ${current}/${total}: ${status}`,
    videoDone: "Video generation complete",
    resultTitle: "Results",
    resultHint: "Each chapter generates 1-5 clips of 10 seconds. All clips use the same character reference image set for continuity.",
    resultHintDone: (minutes, total, chunks) => `${minutes}-minute story split into ${total} chapters. Each chapter generates ${chunks} 10-second clip(s), all using the same character reference image set.`,
    export: "Export TXT",
    summaryLabel: "Chapter Summary",
    promptLabel: "MiniMax H3 Video Prompt",
    copy: "Copy",
    copied: "Copied",
    duration: (chunks) => `Video: ${chunks} x 10 seconds`,
    summaryExport: "Chapter summary: ",
    promptExport: "MiniMax H3 prompt: ",
    defaultChapter: (index) => `Chapter ${index}`,
    chars: "chars",
    arcStart: "Opening",
    arcMiddle: "Development",
    arcEnd: "Resolution",
    continuity: "Character continuity: strictly follow the uploaded 1-4 character reference images, where each image represents one fixed character. Use the same main characters across all chapters and all clips; keep face shape, hairstyle, facial features, main clothing colors, apparent age, and personality consistent. Do not recast the characters even when the story scene changes.",
    videoOnly: "Generate 9:16 vertical video only; no sound, no subtitles, no background music, no voice-over, no narration, and no on-screen text."
  }
};

const styleLabels = {
  zh: ["电影感写实", "古风叙事", "悬疑惊悚", "温暖治愈", "科幻未来"],
  en: ["Cinematic Realism", "Period Drama", "Suspense Thriller", "Warm Healing", "Sci-Fi Future"]
};

const characterLabels = {
  zh: ["亚洲人", "黑人", "金发碧眼洋人"],
  en: ["Asian", "Black", "Blond Blue-Eyed Western"]
};

const categoryLabels = {
  zh: ["恐怖故事", "爱情故事"],
  en: ["Horror Story", "Romance Story"]
};

const clipCountLabels = {
  zh: ["1段", "2段", "3段", "4段", "5段"],
  en: ["1 clip", "2 clips", "3 clips", "4 clips", "5 clips"]
};

document.querySelectorAll("input[name='outputLanguage']").forEach((input) => {
  input.addEventListener("change", () => {
    applyLanguage(getLanguage());
    scheduleSaveState();
  });
});

applyLanguage(getLanguage());
renderEmptyImageSlots();
restoreSavedState();

[
  storyInput,
  apiHostSelect,
  modelInput,
  resolutionSelect,
  totalMinutes,
  chapterCount,
  clipCountSelect,
  styleSelect,
  characterSelect,
  categorySelect,
  firstImageOnly
].forEach((element) => {
  element.addEventListener("input", scheduleSaveState);
  element.addEventListener("change", scheduleSaveState);
});

document.querySelectorAll("input[name='splitMode']").forEach((input) => {
  input.addEventListener("change", scheduleSaveState);
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const t = copy[getLanguage()];
  fileName.textContent = file.name;
  storyInput.value = await file.text();
  setProgress(0, t.imported);
  scheduleSaveState();
});

imageInput.addEventListener("change", async () => {
  await loadReferenceImages([...(imageInput.files || [])]);
  imageInput.value = "";
});

slotImageInput.addEventListener("change", async () => {
  const file = slotImageInput.files?.[0];
  if (file) await loadReferenceImageSlot(file, activeImageSlot);
  slotImageInput.value = "";
});

["dragenter", "dragover"].forEach((eventName) => {
  imageDrop.addEventListener(eventName, (event) => {
    event.preventDefault();
    imageDrop.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  imageDrop.addEventListener(eventName, (event) => {
    event.preventDefault();
    imageDrop.classList.remove("is-dragging");
  });
});

imageDrop.addEventListener("drop", async (event) => {
  const files = [...event.dataTransfer.files].filter((item) => item.type.startsWith("image/"));
  await loadReferenceImages(files);
});

generateBtn.addEventListener("click", async () => {
  const lang = getLanguage();
  const t = copy[lang];
  const text = cleanText(storyInput.value);
  if (text.length < 80) {
    setProgress(0, t.needStory);
    storyInput.focus();
    return;
  }

  generateBtn.disabled = true;
  exportBtn.disabled = true;
  generateAllVideosBtn.disabled = true;
  results.innerHTML = "";
  generatedSegments = [];
  setProgress(3, t.analyzing);

  const clipSeconds = 10;
  const clipCount = Math.max(1, Math.min(5, Math.round(Number(clipCountSelect.value || 2))));
  const chunks = Array.from({ length: clipCount }, () => 10);
  const durationText = `${clipCount} x ${formatDuration(10, lang)}`;
  const mode = document.querySelector("input[name='splitMode']:checked").value;
  const storyMinutes = Math.max(1, Number(totalMinutes.value || 20));
  const desiredCount = Math.max(1, Math.min(30, Math.round(Number(chapterCount.value || 1))));
  const parts = mode === "chapter"
    ? splitByChapterOrFallback(text, desiredCount, lang)
    : splitIntoBalancedParts(text, desiredCount, lang);

  resultHint.textContent = t.resultHintDone(storyMinutes, parts.length, chunks.length);

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    const summary = summarize(part.text, index, parts.length, lang);
    const prompt = buildPrompt({
      index,
      total: parts.length,
      title: part.title,
      summary,
      clipSeconds,
      storyMinutes,
      style: getStyleText(lang),
      character: getCharacterText(lang),
      category: getCategoryText(lang),
      lang
    });

    const record = {
      title: part.title || t.defaultChapter(index + 1),
      summary,
      prompt,
      chars: part.text.length,
      clipSeconds,
      durationText,
      chunks,
      videos: [],
      lang
    };

    generatedSegments.push(record);
    renderCard(record, index);
    setProgress(Math.round(((index + 1) / parts.length) * 100), t.generating(index + 1, parts.length));
    await waitFrame();
  }

  setProgress(100, t.generated);
  exportBtn.disabled = false;
  generateAllVideosBtn.disabled = false;
  generateBtn.disabled = false;
  saveState();
});

generateAllVideosBtn.addEventListener("click", async () => {
  generateAllVideosBtn.disabled = true;
  try {
    for (let index = 0; index < generatedSegments.length; index += 1) {
      await generateChapterVideo(index);
    }
  } catch (error) {
    setProgress(0, readableError(error));
  } finally {
    generateAllVideosBtn.disabled = false;
  }
});

testApiBtn.addEventListener("click", async () => {
  testApiBtn.disabled = true;
  try {
    const created = await createVideoTask({
      apiKey: apiKeyInput.value.trim(),
      apiHost: apiHostSelect.value,
      model: modelInput.value.trim() || "MiniMax-H3",
      resolution: resolutionSelect.value,
      duration: 10,
      prompt: "A simple 10-second vertical test video, no audio, no subtitles.",
      imageDataUrls: [],
      textOnly: true
    });
    const taskId = created.task_id || created.taskId || JSON.stringify(created);
    setProgress(0, `API Key 测试已提交，task_id: ${taskId}`);
  } catch (error) {
    setProgress(0, readableError(error));
  } finally {
    testApiBtn.disabled = false;
  }
});

exportBtn.addEventListener("click", () => {
  syncCardsToData();
  saveState();
  const lang = generatedSegments[0]?.lang || getLanguage();
  const t = copy[lang];
  const lines = generatedSegments.flatMap((item, index) => [
    `【${index + 1}. ${item.title}】`,
    t.duration(item.chunks?.length || 2),
    `${t.summaryExport}${item.summary}`,
    `${t.promptExport}${item.prompt}`,
    ...item.videos.map((video, videoIndex) => `Video ${videoIndex + 1}: ${video.url || video.taskId || ""}`),
    ""
  ]);
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `minimax-h3-story-videos-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

taskLookupBtn.addEventListener("click", async () => {
  const taskId = taskLookupInput.value.trim();
  if (!taskId) {
    taskLookupResult.textContent = "请先输入 task id";
    return;
  }
  taskLookupBtn.disabled = true;
  taskLookupResult.textContent = "正在查询...";
  try {
    const data = await fetchJsonWithTimeout("/api/minimax/query", {
      apiKey: apiKeyInput.value.trim(),
      apiHost: apiHostSelect.value,
      taskId
    }, 45000);
    const task = data.task || data;
    const status = task.status || data.status || "unknown";
    const url = extractVideoUrl(data);
    if (url) {
      taskLookupResult.innerHTML = `<a href="${escapeAttr(url)}" target="_blank" rel="noreferrer">打开 MP4</a>`;
      setProgress(100, `任务 ${taskId} 已完成`);
      return;
    }
    taskLookupResult.textContent = `任务 ${taskId}: ${status}`;
  } catch (error) {
    taskLookupResult.textContent = readableError(error);
  } finally {
    taskLookupBtn.disabled = false;
  }
});

clearBtn.addEventListener("click", () => {
  const t = copy[getLanguage()];
  storyInput.value = "";
  fileInput.value = "";
  imageInput.value = "";
  taskLookupInput.value = "";
  taskLookupResult.textContent = "";
  referenceImageDataUrls = [];
  localStorage.removeItem(STORAGE_KEY);
  imagePreviewGrid.innerHTML = "";
  fileName.textContent = t.fileHint;
  results.innerHTML = "";
  generatedSegments = [];
  resultHint.textContent = t.resultHint;
  exportBtn.disabled = true;
  generateAllVideosBtn.disabled = true;
  generateBtn.disabled = false;
  setProgress(0, t.wait);
});

async function loadReferenceImages(files) {
  const t = copy[getLanguage()];
  const imageFiles = files.filter((file) => file.type.startsWith("image/")).slice(0, 4);
  if (!imageFiles.length) return;
  setProgress(0, t.compressing);
  referenceImageDataUrls = await Promise.all(imageFiles.map((file) => imageFileToCompressedDataUrl(file)));
  renderEmptyImageSlots();
  setProgress(0, `${t.imageReady}: ${imageFiles.length}`);
  saveState();
}

async function loadReferenceImageSlot(file, index) {
  const t = copy[getLanguage()];
  if (!file.type.startsWith("image/")) return;
  setProgress(0, t.compressing);
  referenceImageDataUrls[index] = await imageFileToCompressedDataUrl(file);
  renderEmptyImageSlots();
  setProgress(0, `${t.imageReady}: ${index + 1}`);
  saveState();
}

function renderEmptyImageSlots() {
  imagePreviewGrid.innerHTML = "";
  for (let index = 0; index < 4; index += 1) {
    const slot = document.createElement("button");
    slot.type = "button";
    slot.className = "image-slot";
    slot.title = `Character ${index + 1}`;
    slot.addEventListener("click", () => {
      activeImageSlot = index;
      slotImageInput.click();
    });
    if (referenceImageDataUrls[index]) {
      const img = document.createElement("img");
      img.src = referenceImageDataUrls[index];
      img.alt = `Character ${index + 1}`;
      slot.appendChild(img);
    } else {
      slot.textContent = index + 1;
    }
    imagePreviewGrid.appendChild(slot);
  }
}

async function generateChapterVideo(index) {
  syncCardsToData();
  const item = generatedSegments[index];
  const t = copy[item.lang || getLanguage()];
  if (!apiKeyInput.value.trim()) {
    setProgress(0, t.needKey);
    apiKeyInput.focus();
    return;
  }
  if (!referenceImageDataUrls.length) {
    setProgress(0, t.needImage);
    imageInput.focus();
    return;
  }

  const card = results.querySelectorAll(".result-card")[index];
  const button = card.querySelector(".generate-video");
  const status = card.querySelector(".task-status");
  const list = card.querySelector(".video-list");
  button.disabled = true;
  item.videos = [];
  list.innerHTML = "";

  try {
    for (let chunkIndex = 0; chunkIndex < item.chunks.length; chunkIndex += 1) {
      const chunkDuration = item.chunks[chunkIndex];
      const prompt = buildChunkPrompt(item.prompt, chunkIndex, item.chunks.length, item.lang);
      status.textContent = t.submitting;
      setProgress(Math.round((chunkIndex / item.chunks.length) * 100), t.submitting);

      const created = await createVideoTask({
        apiKey: apiKeyInput.value.trim(),
        apiHost: apiHostSelect.value,
        model: modelInput.value.trim() || "MiniMax-H3",
        resolution: resolutionSelect.value,
        duration: chunkDuration,
        prompt,
        imageDataUrls: firstImageOnly?.checked ? referenceImageDataUrls.slice(0, 1) : referenceImageDataUrls
      });

      const taskId = created.task_id || created.taskId;
      if (!taskId) throw new Error(JSON.stringify(created));
      const video = { taskId, duration: chunkDuration, url: "" };
      item.videos.push(video);
      renderVideoRow(list, video, item.lang);
      saveState();

      const url = await pollVideoTask({
        apiKey: apiKeyInput.value.trim(),
        apiHost: apiHostSelect.value,
        taskId,
        onStatus: (taskStatus) => {
          status.textContent = t.polling(chunkIndex + 1, item.chunks.length, taskStatus);
        }
      });
      video.url = url;
      renderVideoRow(list, video, item.lang);
      setProgress(Math.round(((chunkIndex + 1) / item.chunks.length) * 100), t.polling(chunkIndex + 1, item.chunks.length, "succeeded"));
      saveState();
    }
    status.textContent = t.videoDone;
    saveState();
  } finally {
    button.disabled = false;
  }
}

async function createVideoTask({ apiKey, apiHost, model, resolution, duration, prompt, imageDataUrls, textOnly = false }) {
  return fetchJsonWithTimeout("/api/minimax/create", {
    apiKey,
    apiHost,
    model,
    resolution,
    duration,
    prompt,
    imageDataUrls,
    imageDataUrl: imageDataUrls?.[0] || "",
    textOnly
  }, 90000);
}

async function pollVideoTask({ apiKey, apiHost, taskId, onStatus }) {
  for (let attempt = 0; attempt < 180; attempt += 1) {
    await delay(10000);
    const data = await fetchJsonWithTimeout("/api/minimax/query", { apiKey, apiHost, taskId }, 45000);
    const task = data.task || data;
    const status = task.status || data.status || "processing";
    onStatus?.(status);
    if (status === "succeeded" || status === "success") {
      return extractVideoUrl(data);
    }
    if (["failed", "cancelled", "canceled"].includes(status)) {
      throw new Error(task.error || `MiniMax task ${status}`);
    }
  }
  throw new Error("MiniMax task polling timed out");
}

function extractVideoUrl(data) {
  const task = data.task || data;
  return task.content?.url
    || task.output?.url
    || task.video_url
    || task.file_url
    || data.content?.url
    || data.output?.url
    || data.url
    || "";
}

function renderVideoRow(list, video, lang) {
  let row = list.querySelector(`[data-task-id="${video.taskId}"]`);
  if (!row) {
    row = document.createElement("div");
    row.className = "video-row";
    row.dataset.taskId = video.taskId;
    list.appendChild(row);
  }
  const duration = formatDuration(video.duration, lang);
  row.innerHTML = video.url
    ? `<span>${duration}</span><a href="${escapeAttr(video.url)}" target="_blank" rel="noreferrer">MP4</a><video src="${escapeAttr(video.url)}" controls playsinline></video>`
    : `<span>${duration}</span><code>${escapeHtml(video.taskId)}</code>`;
}

function buildChunkPrompt(prompt, chunkIndex, totalChunks, lang) {
  const label = lang === "en"
    ? `This is clip ${chunkIndex + 1}/${totalChunks} of the same chapter. Keep visual continuity with the previous and next clips.`
    : `这是同一章节的第 ${chunkIndex + 1}/${totalChunks} 个片段，和前后片段保持画面连续。`;
  return `${prompt}\n${label}`.slice(0, 6900);
}

function cleanText(value) {
  return value.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function getLanguage() {
  return document.querySelector("input[name='outputLanguage']:checked")?.value || "zh";
}

function getStyleText(lang) {
  const selected = styleSelect.selectedOptions[0];
  return selected?.dataset[lang] || selected?.dataset.zh || selected?.textContent || "";
}

function getCharacterText(lang) {
  const selected = characterSelect.selectedOptions[0];
  return selected?.dataset[lang] || selected?.dataset.zh || selected?.textContent || "";
}

function getCategoryText(lang) {
  const selected = categorySelect.selectedOptions[0];
  return selected?.dataset[lang] || selected?.dataset.zh || selected?.textContent || "";
}

function formatDuration(seconds, lang) {
  if (lang === "en") {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = seconds / 60;
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }
  if (seconds < 60) return `${seconds}秒`;
  return `${seconds / 60}分钟`;
}

function promptDuration(lang) {
  return lang === "en" ? "10-second vertical video" : "10秒竖屏视频";
}

function applyLanguage(lang) {
  const t = copy[lang];
  document.documentElement.lang = t.langCode;
  document.title = t.pageTitle;
  document.querySelector("#pageTitle").textContent = t.pageTitle;
  clearBtn.title = t.clear;
  document.querySelector(".sr-only").textContent = t.clear;
  document.querySelector("#filePickerText").textContent = t.filePicker;
  document.querySelector("#imageTitle").textContent = t.imageTitle;
  document.querySelector("#imageHint").textContent = t.imageHint;
  document.querySelector("#imagePickerText").textContent = t.imagePicker;
  document.querySelector("#apiKeyLabel").textContent = t.apiKey;
  document.querySelector("#modelLabel").textContent = t.model;
  document.querySelector("#resolutionLabel").textContent = t.resolution;
  if (!fileInput.files?.[0]) fileName.textContent = t.fileHint;
  storyInput.placeholder = t.placeholder;
  document.querySelector("#inputBand").setAttribute("aria-label", t.inputAria);
  document.querySelector("#controls").setAttribute("aria-label", t.controlsAria);
  document.querySelector("#languageLabel").textContent = t.language;
  document.querySelector("#totalMinutesLabel").textContent = t.totalMinutes;
  document.querySelector("#minutesUnit").textContent = t.minutes;
  document.querySelector("#chapterCountLabel").textContent = t.chapterCount;
  document.querySelector("#chaptersUnit").textContent = t.chapters;
  document.querySelector("#clipCountLabel").textContent = t.clipCount;
  document.querySelector("#splitModeLabel").textContent = t.splitMode;
  document.querySelector("#splitChapterText").textContent = t.splitChapter;
  document.querySelector("#splitAutoText").textContent = t.splitAuto;
  document.querySelector("#styleLabel").textContent = t.style;
  document.querySelector("#characterLabel").textContent = t.character;
  document.querySelector("#categoryLabel").textContent = t.category;
  generateBtn.textContent = t.generate;
  generateAllVideosBtn.textContent = t.generateAll;
  exportBtn.textContent = t.export;
  document.querySelector("#resultsTitle").textContent = t.resultTitle;
  document.querySelectorAll("#styleSelect option").forEach((option, index) => {
    option.textContent = styleLabels[lang][index];
  });
  document.querySelectorAll("#characterSelect option").forEach((option, index) => {
    option.textContent = characterLabels[lang][index];
  });
  document.querySelectorAll("#categorySelect option").forEach((option, index) => {
    option.textContent = categoryLabels[lang][index];
  });
  document.querySelectorAll("#clipCountSelect option").forEach((option, index) => {
    option.textContent = clipCountLabels[lang][index];
  });
  if (!generatedSegments.length) {
    resultHint.textContent = t.resultHint;
    setProgress(0, t.wait);
  }
}

function splitByChapterOrFallback(text, desiredCount, lang) {
  const chapterPattern = /(^|\n)\s*((第[零一二三四五六七八九十百千万\d]+[章节回幕部卷集].{0,40})|(chapter\s*\d+.{0,40})|(#{1,3}\s*.{1,60}))\s*(?=\n)/gi;
  const matches = [...text.matchAll(chapterPattern)];
  if (matches.length < 2) return splitIntoBalancedParts(text, desiredCount, lang);
  const chapters = matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    const rawTitle = match[2].replace(/^#{1,3}\s*/, "").trim();
    return { title: rawTitle || copy[lang].defaultChapter(index + 1), text: text.slice(start, end).trim() };
  }).filter((part) => part.text.length > 20);
  if (chapters.length >= desiredCount) return normalizeCount(chapters, desiredCount, lang);
  const expanded = [];
  const totalChars = chapters.reduce((sum, part) => sum + part.text.length, 0);
  chapters.forEach((chapter) => {
    const share = Math.max(1, Math.round((chapter.text.length / totalChars) * desiredCount));
    splitIntoBalancedParts(chapter.text, share, lang).forEach((part, index) => {
      expanded.push({ title: share === 1 ? chapter.title : `${chapter.title} · ${index + 1}`, text: part.text });
    });
  });
  return normalizeCount(expanded, desiredCount, lang);
}

function splitIntoBalancedParts(text, desiredCount, lang) {
  const paragraphs = text.split(/\n+/).map((part) => part.trim()).filter(Boolean);
  const units = paragraphs.length > desiredCount / 2 ? paragraphs : splitSentences(text);
  const targetChars = Math.max(80, Math.ceil(text.length / desiredCount));
  const parts = [];
  let buffer = "";
  units.forEach((unit) => {
    if (buffer && buffer.length + unit.length > targetChars && parts.length < desiredCount - 1) {
      parts.push({ title: copy[lang].defaultChapter(parts.length + 1), text: buffer.trim() });
      buffer = unit;
    } else {
      buffer += buffer ? `\n${unit}` : unit;
    }
  });
  if (buffer.trim()) parts.push({ title: copy[lang].defaultChapter(parts.length + 1), text: buffer.trim() });
  return normalizeCount(parts, desiredCount, lang);
}

function normalizeCount(parts, desiredCount, lang = "zh") {
  let list = [...parts].filter((part) => part.text.trim());
  while (list.length > desiredCount) {
    let smallestIndex = 0;
    for (let i = 1; i < list.length; i += 1) {
      if (list[i].text.length < list[smallestIndex].text.length) smallestIndex = i;
    }
    const mergeInto = smallestIndex === 0 ? 1 : smallestIndex - 1;
    list[mergeInto] = { title: list[mergeInto].title, text: `${list[mergeInto].text}\n${list[smallestIndex].text}` };
    list.splice(smallestIndex, 1);
  }
  return list.map((part, index) => ({ ...part, title: part.title || copy[lang].defaultChapter(index + 1) }));
}

function splitSentences(text) {
  const matches = text.match(/[^。！？!?；;.!?]+[。！？!?；;.!?]?/g);
  return (matches || [text]).map((line) => line.trim()).filter(Boolean);
}

function summarize(text, index, total, lang) {
  const t = copy[lang];
  const sentences = splitSentences(text).filter((line) => line.length > 8);
  if (sentences.length === 0) return text.slice(0, 140);
  const keywords = lang === "zh"
    ? ["突然", "发现", "决定", "秘密", "冲突", "危险", "真相", "离开", "回来", "死亡", "救", "爱", "恨", "追", "逃", "哭", "笑", "承认", "拒绝", "背叛", "选择"]
    : ["suddenly", "discover", "decide", "secret", "conflict", "danger", "truth", "leave", "return", "death", "save", "love", "hate", "chase", "escape", "cry", "laugh", "admit", "refuse", "betray", "choice"];
  const scored = sentences.map((sentence, sentenceIndex) => {
    const searchable = lang === "zh" ? sentence : sentence.toLowerCase();
    const keywordScore = keywords.reduce((score, word) => score + (searchable.includes(word) ? 2 : 0), 0);
    const positionScore = sentenceIndex === 0 || sentenceIndex === sentences.length - 1 ? 2 : 0;
    const lengthScore = Math.min(3, Math.floor(sentence.length / 35));
    return { sentence, score: keywordScore + positionScore + lengthScore, sentenceIndex };
  });
  scored.sort((a, b) => b.score - a.score || a.sentenceIndex - b.sentenceIndex);
  const picked = scored.slice(0, 2).sort((a, b) => a.sentenceIndex - b.sentenceIndex).map((item) => item.sentence);
  const arc = index === 0 ? t.arcStart : index === total - 1 ? t.arcEnd : t.arcMiddle;
  const separator = lang === "zh" ? "" : " ";
  return `${arc}: ${picked.join(separator)}`.slice(0, 300);
}

function buildPrompt({ index, total, title, summary, storyMinutes, style, character, category, lang }) {
  const t = copy[lang];
  const durationText = promptDuration(lang);
  const movement = lang === "en"
    ? "[Tracking shot], [Push in], vertical composition, full body and close-up details alternate naturally."
    : "[Tracking shot], [Push in]，竖屏构图，全身关系和面部近景自然交替。";
  if (lang === "en") {
    const beat = index === 0 ? "establish the main characters, setting, and central hook" : index === total - 1 ? "show the ending emotion and lingering aftertaste" : "highlight this chapter's key turn and character reactions";
    return [
      `${durationText}, ${style}. `,
      `MiniMax H3 reference-generation task. This is chapter ${index + 1}/${total} from a complete story of about ${storyMinutes} minutes. `,
      `Chapter: ${title || `Chapter ${index + 1}`}. Story focus: ${summary}. `,
      `Character type setting: ${character}. Genre direction: ${category}. `,
      `Visual direction: ${beat}; generate 1-5 separate 10-second clips from this prompt as needed, and keep all uploaded reference characters as the same people in every clip. `,
      `${t.continuity} ${movement} ${t.videoOnly}`
    ].join("");
  }
  const beat = index === 0 ? "建立人物、地点和核心悬念" : index === total - 1 ? "呈现结局情绪和余韵" : "突出本章关键转折和人物反应";
  return [
    `${durationText}，${style}。`,
    `MiniMax H3 参考图生视频任务。这是约 ${storyMinutes} 分钟完整故事的第 ${index + 1}/${total} 章。`,
    `章节：${title || `第 ${index + 1} 章`}。剧情重点：${summary}`,
    `人物类型设定：${character}。分类氛围：${category}。`,
    `画面要求：${beat}；可按设置生成 1-5 段独立的 10 秒视频，每段都必须把上传的 1-4 张参考图人物作为同一批固定人物。`,
    `${t.continuity}${movement}${t.videoOnly}`
  ].join("");
}

function renderCard(record, index) {
  const t = copy[record.lang || getLanguage()];
  const node = template.content.firstElementChild.cloneNode(true);
  node.querySelector(".segment-title").textContent = `${index + 1}. ${record.title}`;
  node.querySelector(".segment-meta").textContent = `${record.chunks?.length || 2} x ${formatDuration(10, record.lang)} · ${record.chars}${t.chars}`;
  node.querySelector(".summary-label").textContent = t.summaryLabel;
  node.querySelector(".prompt-label").textContent = t.promptLabel;
  const summaryField = node.querySelector(".summary-field");
  const promptField = node.querySelector(".prompt-field");
  summaryField.value = record.summary;
  promptField.value = record.prompt;
  summaryField.addEventListener("input", () => {
    syncCardsToData();
    scheduleSaveState();
  });
  promptField.addEventListener("input", () => {
    syncCardsToData();
    scheduleSaveState();
  });
  node.querySelector(".generate-video").textContent = t.generateOne;
  node.querySelector(".generate-video").addEventListener("click", () => {
    generateChapterVideo(index).catch((error) => {
      node.querySelector(".task-status").textContent = readableError(error);
      setProgress(0, readableError(error));
    });
  });
  wireCopyButton(node.querySelector(".copy-summary"), node.querySelector(".summary-field"), t);
  wireCopyButton(node.querySelector(".copy-prompt"), node.querySelector(".prompt-field"), t);
  results.appendChild(node);
}

function syncCardsToData() {
  [...results.querySelectorAll(".result-card")].forEach((card, index) => {
    if (!generatedSegments[index]) return;
    generatedSegments[index].summary = card.querySelector(".summary-field").value.trim();
    generatedSegments[index].prompt = card.querySelector(".prompt-field").value.trim();
  });
}

function setProgress(percent, label) {
  const safePercent = Math.max(0, Math.min(100, percent));
  progressBar.style.width = `${safePercent}%`;
  progressCount.textContent = `${safePercent}%`;
  progressLabel.textContent = label;
}

function wireCopyButton(button, field, t) {
  button.textContent = t.copy;
  button.setAttribute("aria-label", t.copy);
  button.addEventListener("click", async () => {
    await copyText(field.value);
    button.textContent = t.copied;
    window.setTimeout(() => {
      button.textContent = t.copy;
    }, 1200);
  });
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.top = "-9999px";
  document.body.appendChild(helper);
  helper.select();
  document.execCommand("copy");
  helper.remove();
}

function scheduleSaveState() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveState, 300);
}

function saveState() {
  try {
    syncCardsToData();
    const state = {
      version: 2,
      savedAt: new Date().toISOString(),
      storyText: storyInput.value,
      settings: {
        outputLanguage: getLanguage(),
        apiHost: apiHostSelect.value,
        model: modelInput.value,
        resolution: resolutionSelect.value,
        totalMinutes: totalMinutes.value,
        chapterCount: chapterCount.value,
        clipCount: clipCountSelect.value,
        splitMode: document.querySelector("input[name='splitMode']:checked")?.value || "chapter",
        style: styleSelect.value,
        character: characterSelect.value,
        category: categorySelect.value,
        firstImageOnly: Boolean(firstImageOnly.checked)
      },
      referenceImageDataUrls,
      generatedSegments,
      resultHint: resultHint.textContent
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save local state", error);
  }
}

function restoreSavedState() {
  let state;
  try {
    state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    state = null;
  }
  if (!state) return;

  const settings = state.settings || {};
  if (settings.outputLanguage) {
    const languageInput = document.querySelector(`input[name='outputLanguage'][value="${settings.outputLanguage}"]`);
    if (languageInput) languageInput.checked = true;
  }
  setValue(apiHostSelect, settings.apiHost);
  setValue(modelInput, settings.model);
  setValue(resolutionSelect, settings.resolution);
  setValue(totalMinutes, settings.totalMinutes);
  setValue(chapterCount, settings.chapterCount);
  setValue(clipCountSelect, settings.clipCount);
  if (settings.splitMode) {
    const splitInput = document.querySelector(`input[name='splitMode'][value="${settings.splitMode}"]`);
    if (splitInput) splitInput.checked = true;
  }
  setValue(styleSelect, settings.style);
  setValue(characterSelect, settings.character);
  setValue(categorySelect, settings.category);
  firstImageOnly.checked = Boolean(settings.firstImageOnly);

  storyInput.value = state.storyText || "";
  referenceImageDataUrls = Array.isArray(state.referenceImageDataUrls) ? state.referenceImageDataUrls.slice(0, 4) : [];
  generatedSegments = Array.isArray(state.generatedSegments) ? state.generatedSegments : [];

  applyLanguage(getLanguage());
  renderEmptyImageSlots();
  results.innerHTML = "";
  generatedSegments.forEach((record, index) => renderCard(record, index));

  if (storyInput.value) fileName.textContent = "已恢复上次故事文本";
  if (generatedSegments.length) {
    const t = copy[generatedSegments[0]?.lang || getLanguage()];
    resultHint.textContent = state.resultHint || t.resultHint;
    exportBtn.disabled = false;
    generateAllVideosBtn.disabled = false;
    setProgress(100, "已恢复上次保存的摘要和提示词");
  }
}

function setValue(element, value) {
  if (value !== undefined && value !== null) element.value = value;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function imageFileToCompressedDataUrl(file) {
  const source = await fileToDataUrl(file);
  const image = await loadImage(source);
  const maxSide = 768;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
  const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function fetchJsonWithTimeout(url, body, timeoutMs) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const timer = window.setTimeout(() => {
      request.abort();
      reject(new Error("提交 MiniMax 任务超时：请确认本地服务正在运行，或减少参考图片尺寸后重试。"));
    }, timeoutMs);

    request.open("POST", `${API_ORIGIN}${url}`, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.onload = () => {
      window.clearTimeout(timer);
      let data = {};
      try {
        data = request.responseText ? JSON.parse(request.responseText) : {};
      } catch {
        data = { error: request.responseText };
      }
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(data.error || `本地服务返回 HTTP ${request.status}`));
        return;
      }
      resolve(data);
    };
    request.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("本地服务连接失败：请确认页面地址是 http://127.0.0.1:8787/，并且 start-local.bat 或本地服务正在运行。"));
    };
    request.send(JSON.stringify(body));
  });
}

function readableError(error) {
  if (!error) return "未知错误";
  if (error.errors && Array.isArray(error.errors)) {
    const details = error.errors
      .map((item) => item.message || item.code || String(item))
      .filter(Boolean)
      .join("; ");
    return details ? `${error.message || "AggregateError"}: ${details}` : (error.message || "AggregateError");
  }
  if ((error.message || String(error)) === "AggregateError") {
    return "AggregateError：浏览器没有拿到本地服务返回的详细错误。请确认页面显示“API排错版”，并重新点击生成；如果仍出现，请把 minimax-local.log 发我。";
  }
  return error.message || String(error);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
}

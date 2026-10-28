const WORDS = ["가족", "바닥", "수학", "사막", "가격"];
const RECOGNITION = window.SpeechRecognition || window.webkitSpeechRecognition;

const shell = document.querySelector(".game-shell");
const word = document.querySelector("#word");
const progressText = document.querySelector("#progress-text");
const progressDots = document.querySelector("#progress-dots");
const instruction = document.querySelector("#instruction");
const status = document.querySelector("#game-status");
const micButton = document.querySelector("#mic-button");
const micLabel = document.querySelector("#mic-label");
const wall = document.querySelector("#word-wall");
const confetti = document.querySelector("#confetti");
const completePanel = document.querySelector("#complete-panel");
const restartButton = document.querySelector("#restart-button");
const cameraButton = document.querySelector("#camera-button");
const cameraFeed = document.querySelector("#camera-feed");

let index = 0;
let recognition;
let isListening = false;
let cameraStream;

function currentWord() {
  return WORDS[index];
}

function setPhase(phase) {
  shell.dataset.phase = phase;
}

function setStatus(message) {
  status.textContent = message;
}

function renderProgress() {
  progressText.textContent = `${index + 1} / ${WORDS.length}`;
  progressDots.replaceChildren(...WORDS.map((_, dotIndex) => {
    const dot = document.createElement("li");
    if (dotIndex < index) dot.classList.add("is-complete");
    if (dotIndex === index) dot.classList.add("is-current");
    return dot;
  }));
}

function renderRound() {
  word.textContent = currentWord();
  micButton.setAttribute("aria-label", `${currentWord()} 말하기`);
  renderProgress();
  instruction.textContent = "마이크를 누르고 단어를 말해 보세요";
  micLabel.textContent = "말하기";
  setPhase("ready");
  setStatus(`${index + 1}번째 단어는 ${currentWord()}이에요.`);
}

function makeConfetti() {
  const colors = ["var(--success)", "var(--coral)", "#f6c94b", "#78cfe0", "#fff"];
  confetti.replaceChildren(...Array.from({ length: 26 }, (_, itemIndex) => {
    const piece = document.createElement("i");
    piece.style.left = `${8 + ((itemIndex * 17) % 84)}%`;
    piece.style.background = colors[itemIndex % colors.length];
    piece.style.setProperty("--drift", `${-100 + ((itemIndex * 53) % 200)}px`);
    piece.style.setProperty("--spin", `${180 + ((itemIndex * 47) % 540)}deg`);
    piece.style.animationDelay = `${(itemIndex % 7) * 24}ms`;
    return piece;
  }));
  confetti.classList.remove("is-falling");
  requestAnimationFrame(() => confetti.classList.add("is-falling"));
}

function finishGame() {
  setPhase("complete");
  micButton.disabled = true;
  cameraButton.disabled = true;
  completePanel.hidden = false;
  requestAnimationFrame(() => restartButton.focus());
}

function passRound() {
  if (isListening && recognition) recognition.stop();
  isListening = false;
  setPhase("success");
  micButton.disabled = true;
  instruction.textContent = index === WORDS.length - 1 ? "정확해요! 마지막 벽을 통과했어요" : "정확해요! 다음 벽으로 갈게요";
  micLabel.textContent = "좋아요";
  setStatus(`${currentWord()} 발음에 성공했어요.`);
  makeConfetti();

  window.setTimeout(() => {
    index += 1;
    if (index === WORDS.length) {
      finishGame();
      return;
    }
    wall.style.visibility = "hidden";
    window.setTimeout(() => {
      wall.style.visibility = "visible";
      micButton.disabled = false;
      renderRound();
    }, 70);
  }, 920);
}

function retry(transcript) {
  isListening = false;
  setPhase("retry");
  micButton.disabled = false;
  micLabel.textContent = "다시 말하기";
  instruction.textContent = `${currentWord()}을 한 번 더 또박또박 말해 보세요`;
  setStatus(transcript ? `“${transcript}”로 들렸어요. 목표 단어는 ${currentWord()}이에요.` : "음성을 인식하지 못했어요. 조용한 곳에서 다시 말해 보세요.");
}

function normalize(value) {
  return value.replace(/\s/g, "").replace(/[.?!,]/g, "");
}

function listen() {
  if (isListening || micButton.disabled) return;
  if (!RECOGNITION) {
    setPhase("retry");
    instruction.textContent = "이 브라우저는 음성 인식을 지원하지 않아요";
    setStatus("Chrome 또는 Edge에서 다시 열면 발음 인식을 사용할 수 있어요.");
    return;
  }

  recognition = new RECOGNITION();
  recognition.lang = "ko-KR";
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  isListening = true;
  setPhase("listening");
  micLabel.textContent = "듣는 중";
  instruction.textContent = `${currentWord()}을 말해 보세요`;
  setStatus("말씀하신 단어를 듣고 있어요.");

  recognition.onresult = (event) => {
    const alternatives = Array.from(event.results[0], result => result.transcript);
    const matched = alternatives.find(transcript => normalize(transcript).includes(normalize(currentWord())));
    if (matched) passRound();
    else retry(alternatives[0]);
  };
  recognition.onerror = (event) => {
    if (event.error === "aborted") return;
    isListening = false;
    setPhase("retry");
    micLabel.textContent = "다시 말하기";
    instruction.textContent = "마이크 권한을 확인하고 다시 눌러 주세요";
    setStatus(event.error === "not-allowed" ? "마이크 권한이 필요해요. 브라우저 설정에서 허용해 주세요." : "음성을 듣지 못했어요. 조용한 곳에서 다시 시도해 보세요.");
  };
  recognition.onend = () => {
    if (isListening) {
      isListening = false;
      if (shell.dataset.phase === "listening") retry();
    }
  };
  recognition.start();
}

async function toggleCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = undefined;
    cameraFeed.srcObject = null;
    shell.dataset.camera = "off";
    cameraButton.setAttribute("aria-pressed", "false");
    cameraButton.setAttribute("aria-label", "카메라 켜기");
    setStatus("카메라를 껐어요. 게임은 계속할 수 있어요.");
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    cameraFeed.srcObject = cameraStream;
    shell.dataset.camera = "on";
    cameraButton.setAttribute("aria-pressed", "true");
    cameraButton.setAttribute("aria-label", "카메라 끄기");
    setStatus("카메라를 켰어요. 이제 발음을 시작해 보세요.");
  } catch {
    setStatus("카메라 없이도 게임을 계속할 수 있어요.");
  }
}

function restart() {
  index = 0;
  completePanel.hidden = true;
  micButton.disabled = false;
  cameraButton.disabled = false;
  renderRound();
}

micButton.addEventListener("click", listen);
cameraButton.addEventListener("click", toggleCamera);
restartButton.addEventListener("click", restart);
window.addEventListener("beforeunload", () => cameraStream?.getTracks().forEach(track => track.stop()));

renderRound();

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 0;
let timer;
let timeLeft = 15;

// DOM elements
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");
const endQuizBtn = document.getElementById("endQuizBtn");
const hintText = document.getElementById("hintText");
const scoreEl = document.getElementById("score");
const timeLeftEl = document.getElementById("timeLeft");

const quizContainer = document.getElementById("quizContainer");
const quizResult = document.getElementById("quizResult");
const finalScore = document.getElementById("finalScore");
const percentageEl = document.getElementById("percentage");
const restartBtn = document.getElementById("restartBtn");

// Fetch 10 random questions from Open Trivia DB
async function fetchQuestions() {
  try {
    const res = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
    const data = await res.json();
    questions = data.results.map(q => {
      const options = [...q.incorrect_answers, q.correct_answer];
      return {
        question: decodeHTML(q.question),
        options: shuffleArray(options.map(decodeHTML)),
        answer: decodeHTML(q.correct_answer)
      };
    });
    currentQuestionIndex = 0;
    score = 0;
    totalQuestions = 0;
    scoreEl.textContent = score;
    loadQuestion();
  } catch (err) {
    questionEl.textContent = "Failed to load questions.";
    console.error(err);
  }
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function loadQuestion() {
  if (currentQuestionIndex >= questions.length) {
    showResult();
    return;
  }
  const q = questions[currentQuestionIndex];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";
  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.onclick = () => selectAnswer(option, q.answer, btn);
    optionsEl.appendChild(btn);
  });
  nextBtn.disabled = true;
  startTimer();
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 15;
  timeLeftEl.textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timeLeftEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      disableOptions();
      nextBtn.disabled = false;
      fetchHint();
    }
  }, 1000);
}

function disableOptions() {
  const buttons = optionsEl.querySelectorAll("button");
  buttons.forEach(btn => btn.disabled = true);
}

function selectAnswer(selected, correct, button) {
  clearInterval(timer);
  disableOptions();
  if (selected === correct) {
    button.style.backgroundColor = "#4CAF50";
    score++;
  } else {
    button.style.backgroundColor = "#f44336";
  }
  totalQuestions++;
  scoreEl.textContent = score;
  nextBtn.disabled = false;
  fetchHint();
}

function fetchHint() {
  fetch("https://official-joke-api.appspot.com/random_joke")
    .then(res => res.json())
    .then(data => {
      hintText.textContent = `${data.setup} ... ${data.punchline}`;
    })
    .catch(() => {
      hintText.textContent = "Couldn't fetch a hint this time.";
    });
}

nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  loadQuestion();
});

endQuizBtn.addEventListener("click", showResult);

function showResult() {
  clearInterval(timer);
  quizContainer.style.display = "none";
  quizResult.style.display = "block";
  finalScore.textContent = score + " / " + totalQuestions;
  percentageEl.textContent = ((score / totalQuestions) * 100).toFixed(2);
}

restartBtn.addEventListener("click", () => {
  quizResult.style.display = "none";
  quizContainer.style.display = "block";
  hintText.textContent = "Answer a question to get a hint...";
  fetchQuestions();
});

// Load quiz on page load
fetchQuestions();

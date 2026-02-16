document.addEventListener("DOMContentLoaded", function () {

    const ADMIN_PASSWORD = "123456";

    let topics = JSON.parse(localStorage.getItem("topics"));
    let questions = JSON.parse(localStorage.getItem("questions"));

    if (!topics || !questions) {
        topics = defaultData.topics;
        questions = defaultData.questions;
        saveData();
    }

    let score = 0;
    let currentQuestions = [];
    let currentIndex = 0;
    let editingIndex = null;

    const loginModal = document.getElementById("loginModal");
    const adminBtn = document.getElementById("adminBtn");
    const adminPanel = document.getElementById("adminPanel");
    const userPanel = document.getElementById("userPanel");

    // ================= ADMIN LOGIN =================
    adminBtn.addEventListener("click", function () {
        loginModal.style.display = "flex";
    });

    window.loginAdmin = function () {
        const passwordInput = document.getElementById("adminPassword").value;
        if (passwordInput === ADMIN_PASSWORD) {
            loginModal.style.display = "none";
            adminPanel.classList.remove("hidden");
            userPanel.classList.add("hidden");
            renderAdmin();
        } else {
            alert("Sai mật khẩu!");
        }
    };

    window.backToUser = function () {
        adminPanel.classList.add("hidden");
        userPanel.classList.remove("hidden");
    };

    // ================= DATA =================
    function saveData() {
        localStorage.setItem("topics", JSON.stringify(topics));
        localStorage.setItem("questions", JSON.stringify(questions));
    }

    // ================= TOPIC CRUD =================
    window.addTopic = function () {
        const t = document.getElementById("newTopic").value.trim();
        if (!t) return;

        topics.push(t);
        saveData();
        renderAll();
        document.getElementById("newTopic").value = "";
    };

    window.deleteTopic = function (index) {
        const topicName = topics[index];

        topics.splice(index, 1);
        questions = questions.filter(q => q.topic !== topicName);

        saveData();
        renderAll();
    };

    // ================= QUESTION CRUD =================
    window.addQuestion = function () {
        const topic = document.getElementById("adminTopicSelect").value;
        const q = document.getElementById("newQuestion").value.trim();
        const a = document.getElementById("newAnswer").value.trim();

        if (!topic || !q || !a) return;

        if (editingIndex !== null) {
            questions[editingIndex] = { topic, question: q, answer: a };
            editingIndex = null;
        } else {
            questions.push({ topic, question: q, answer: a });
        }

        saveData();
        renderAll();

        document.getElementById("newQuestion").value = "";
        document.getElementById("newAnswer").value = "";
    };

    window.editQuestion = function (index) {
        const q = questions[index];

        document.getElementById("adminTopicSelect").value = q.topic;
        document.getElementById("newQuestion").value = q.question;
        document.getElementById("newAnswer").value = q.answer;

        editingIndex = index;
    };

    window.deleteQuestion = function (index) {
        questions.splice(index, 1);
        saveData();
        renderAll();
    };

    // ================= RENDER ADMIN =================
    function renderAdmin() {

        const topicSelect = document.getElementById("adminTopicSelect");
        topicSelect.innerHTML = "";

        topics.forEach(t => {
            topicSelect.innerHTML += `<option value="${t}">${t}</option>`;
        });

        document.getElementById("topicList").innerHTML =
            topics.map((t, i) =>
                `<li>
                    ${t}
                    <button onclick="deleteTopic(${i})" style="background:#ef4444;margin-left:10px;">X</button>
                 </li>`
            ).join("");

        document.getElementById("adminQuestionList").innerHTML =
            questions.map((q, i) =>
                `<div class="question-card">
                    <strong>${q.topic}</strong><br>
                    ${q.question}<br>
                    <button onclick="editQuestion(${i})">Sửa</button>
                    <button onclick="deleteQuestion(${i})" style="background:#ef4444;">Xóa</button>
                </div>`
            ).join("");
    }

    // ================= USER QUIZ =================
    window.startQuiz = function () {
        const topic = document.getElementById("userTopicSelect").value;
        currentQuestions = questions.filter(q => q.topic === topic);
        currentIndex = 0;
        score = 0;
        updateScore();
        showQuestion();
    };

    function showQuestion() {
        if (currentIndex >= currentQuestions.length) {
            document.getElementById("quizContainer").innerHTML =
                `<h3>🎉 Hoàn thành! Điểm: ${score}</h3>`;
            return;
        }

        const q = currentQuestions[currentIndex];

        document.getElementById("quizContainer").innerHTML = `
            <div class="question-card">
                <p>${q.question}</p>
                <input type="text" id="userAnswer" placeholder="Nhập câu trả lời">
                <button onclick="checkAnswer()">Trả lời</button>
                <div id="result"></div>
            </div>
        `;
    }

    window.checkAnswer = function () {
        const input = document.getElementById("userAnswer").value.trim();
        const correctAnswer = currentQuestions[currentIndex].answer;
        const result = document.getElementById("result");

        if (input.toLowerCase() === correctAnswer.toLowerCase()) {
            score++;
            updateScore();
            result.innerHTML = `<div class="correct">🎉 Chính xác!</div>`;
            launchConfetti();

            setTimeout(() => {
                currentIndex++;
                showQuestion();
            }, 1000);
        } else {
            result.innerHTML = `<div class="wrong">❌ Sai rồi!</div>`;
        }
    };

    function updateScore() {
        document.getElementById("score").innerText = score;
    }

    function renderAll() {
        document.getElementById("userTopicSelect").innerHTML =
            topics.map(t => `<option value="${t}">${t}</option>`).join("");
        renderAdmin();
    }

    // ================= CONFETTI =================
    function launchConfetti() {
        for (let i = 0; i < 25; i++) {
            const confetti = document.createElement("div");
            confetti.style.position = "fixed";
            confetti.style.width = "8px";
            confetti.style.height = "8px";
            confetti.style.background =
                "hsl(" + Math.random() * 360 + ",100%,50%)";
            confetti.style.top = "50%";
            confetti.style.left = "50%";
            confetti.style.borderRadius = "50%";
            confetti.style.zIndex = 9999;
            document.body.appendChild(confetti);

            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * 200;

            confetti.animate([
                { transform: "translate(0,0)", opacity: 1 },
                {
                    transform:
                        `translate(${Math.cos(angle) * distance}px,
                                   ${Math.sin(angle) * distance}px)`,
                    opacity: 0
                }
            ], {
                duration: 800,
                easing: "ease-out"
            });

            setTimeout(() => confetti.remove(), 800);
        }
    }

    renderAll();
    startQuiz();
});

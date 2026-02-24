// Exam Format JavaScript
// Bạn sẽ điền nội dung vào đây

let currentExam = null;
let examQuestions = [];
let currentExamQuestionIndex = 0;
let examAnswers = [];
let examStartTime = null;
let timerInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showExamSelection();
});

function showExamSelection() {
    const exams = [
        { id: 'part5', name: 'Part 5 - Incomplete Sentences', questions: 30, time: 15 },
        { id: 'part6', name: 'Part 6 - Text Completion', questions: 16, time: 10 },
        { id: 'part7', name: 'Part 7 - Reading Comprehension', questions: 54, time: 55 }
    ];
    
    const container = document.getElementById('examList');
    container.innerHTML = exams.map(exam => `
        <div class="exam-card" onclick="selectExam('${exam.id}')">
            <h3>${exam.name}</h3>
            <div class="exam-info">
                <span>📝 ${exam.questions} câu</span>
                <span>⏱️ ${exam.time} phút</span>
            </div>
            <button class="btn btn-primary">Bắt đầu thi</button>
        </div>
    `).join('');
}

async function selectExam(examId) {
    try {
        const response = await fetch(`exams/${examId}.json`);
        const data = await response.json();
        currentExam = data;
        examQuestions = data.questions;
        currentExamQuestionIndex = 0;
        examAnswers = new Array(examQuestions.length).fill(null);
        examStartTime = Date.now();
        
        document.getElementById('examSelectionView').style.display = 'none';
        document.getElementById('examTestView').style.display = 'block';
        showExamQuestion();
        startExamTimer();
    } catch (error) {
        console.error('Error loading exam:', error);
        alert('Không thể tải đề thi!');
    }
}

function showExamQuestion() {
    const question = examQuestions[currentExamQuestionIndex];
    document.getElementById('examQuestionNumber').textContent = currentExamQuestionIndex + 1;
    document.getElementById('examTotalQuestions').textContent = examQuestions.length;
    
    if (question.passage) {
        document.getElementById('examPassage').style.display = 'block';
        document.getElementById('examPassageText').textContent = question.passage;
    } else {
        document.getElementById('examPassage').style.display = 'none';
    }
    
    document.getElementById('examQuestion').textContent = question.question;
    
    const optionsHtml = question.options.map((option, index) => {
        const letter = String.fromCharCode(65 + index);
        const isSelected = examAnswers[currentExamQuestionIndex] === index;
        return `
            <div class="exam-option ${isSelected ? 'selected' : ''}" onclick="selectExamAnswer(${index})">
                <span class="option-letter">${letter}</span>
                <span class="option-text">${option}</span>
            </div>
        `;
    }).join('');
    document.getElementById('examOptions').innerHTML = optionsHtml;
}

function selectExamAnswer(answerIndex) {
    examAnswers[currentExamQuestionIndex] = answerIndex;
    showExamQuestion();
}

function navigateExamQuestion(direction) {
    currentExamQuestionIndex += direction;
    if (currentExamQuestionIndex < 0) currentExamQuestionIndex = 0;
    if (currentExamQuestionIndex >= examQuestions.length) currentExamQuestionIndex = examQuestions.length - 1;
    showExamQuestion();
}

function startExamTimer() {
    const timeLimit = currentExam.timeLimit * 60 * 1000;
    
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - examStartTime;
        const remaining = timeLimit - elapsed;
        
        if (remaining <= 0) {
            clearInterval(timerInterval);
            submitExam();
            return;
        }
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        document.getElementById('examTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function submitExam() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    if (!confirm('Bạn có chắc muốn nộp bài?')) {
        return;
    }
    
    let correctCount = 0;
    examQuestions.forEach((question, index) => {
        if (examAnswers[index] === question.correctAnswer) {
            correctCount++;
        }
    });
    
    const percentage = Math.round((correctCount / examQuestions.length) * 100);
    
    document.getElementById('examTestView').style.display = 'none';
    document.getElementById('examResultView').style.display = 'block';
    
    document.getElementById('examResultScore').textContent = `${correctCount}/${examQuestions.length}`;
    document.getElementById('examResultPercentage').textContent = `${percentage}%`;
    
    displayExamReview();
}

function displayExamReview() {
    const reviewHtml = examQuestions.map((question, index) => {
        const userAnswer = examAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        const userAnswerLetter = userAnswer !== null ? String.fromCharCode(65 + userAnswer) : '-';
        const correctAnswerLetter = String.fromCharCode(65 + question.correctAnswer);
        
        return `
            <div class="exam-review-item ${isCorrect ? 'correct' : 'wrong'}">
                <div class="review-header">
                    <span>Câu ${index + 1}</span>
                    <span>${isCorrect ? '✅' : '❌'}</span>
                </div>
                <p class="review-question">${question.question}</p>
                <p class="review-answer">
                    Bạn chọn: <strong>${userAnswerLetter}</strong> | 
                    Đáp án đúng: <strong>${correctAnswerLetter}</strong>
                </p>
                ${question.explanation ? `<p class="review-explanation">${question.explanation}</p>` : ''}
            </div>
        `;
    }).join('');
    
    document.getElementById('examReviewList').innerHTML = reviewHtml;
}

function backToExamSelection() {
    document.getElementById('examResultView').style.display = 'none';
    document.getElementById('examSelectionView').style.display = 'block';
    showExamSelection();
}

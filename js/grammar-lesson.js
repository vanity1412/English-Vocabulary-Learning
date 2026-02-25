// Grammar Lesson Page JavaScript
let currentGrammarTopic = null;
let grammarExercises = [];
let currentExerciseIndex = 0;
let grammarScore = 0;
let learnedTopics = new Set();

// LocalStorage keys
const STORAGE_KEYS = {
    LEARNED_TOPICS: 'grammarLearnedTopics',
    NOTES: 'grammarNotes'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadLearnedTopics();
    initializeTabButtons();
    loadGrammarLesson();
});

function loadLearnedTopics() {
    const saved = localStorage.getItem(STORAGE_KEYS.LEARNED_TOPICS);
    if (saved) {
        learnedTopics = new Set(JSON.parse(saved));
    }
}

function saveLearnedTopics() {
    localStorage.setItem(STORAGE_KEYS.LEARNED_TOPICS, JSON.stringify([...learnedTopics]));
}

function initializeTabButtons() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tabName === 'theory') {
        document.getElementById('theoryTab').classList.add('active');
    } else if (tabName === 'examples') {
        document.getElementById('examplesTab').classList.add('active');
    } else if (tabName === 'notes') {
        document.getElementById('notesTab').classList.add('active');
        loadNotes();
    }
}

async function loadGrammarLesson() {
    // Get topic ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const topicId = urlParams.get('topic');
    
    if (!topicId) {
        alert('Không tìm thấy chủ đề!');
        window.location.href = 'grammar.html';
        return;
    }
    
    try {
        // Load grammar topics
        const response = await fetch('grammar/grammar_topics.json');
        const data = await response.json();
        currentGrammarTopic = data.topics.find(t => t.id === topicId);
        
        if (!currentGrammarTopic) {
            alert('Không tìm thấy chủ đề!');
            window.location.href = 'grammar.html';
            return;
        }
        
        displayGrammarLesson();
    } catch (error) {
        console.error('Error loading grammar lesson:', error);
        alert('Không thể tải dữ liệu ngữ pháp!');
    }
}

function displayGrammarLesson() {
    const topic = currentGrammarTopic;
    
    // Update page title
    document.getElementById('pageTitle').textContent = `${topic.title} - TOEIC`;
    document.getElementById('grammarLessonTitle').textContent = topic.title;
    
    // Display theory
    document.getElementById('grammarTheory').innerHTML = topic.theory;
    
    // Display examples
    const examplesHtml = topic.examples.map(ex => `
        <div class="grammar-example">
            <p class="example-sentence">${ex.sentence}</p>
            <p class="example-translation">${ex.translation}</p>
            <p class="example-explanation">💡 ${ex.explanation}</p>
        </div>
    `).join('');
    document.getElementById('grammarExamples').innerHTML = examplesHtml;
    
    // Update button text if already learned
    updateLearnedButton();
}

function updateLearnedButton() {
    const btn = document.querySelector('.lesson-actions .btn-secondary');
    if (learnedTopics.has(currentGrammarTopic.id)) {
        btn.textContent = '❌ Bỏ đánh dấu đã học';
    } else {
        btn.textContent = '✅ Đánh dấu đã học';
    }
}

async function startGrammarExercise() {
    try {
        const response = await fetch(`grammar/exercises/${currentGrammarTopic.id}.json`);
        const data = await response.json();
        grammarExercises = data.exercises;
        currentExerciseIndex = 0;
        grammarScore = 0;
        
        document.getElementById('grammarLessonView').style.display = 'none';
        document.getElementById('grammarExerciseView').style.display = 'block';
        showGrammarExercise();
    } catch (error) {
        console.error('Error loading exercises:', error);
        alert('Không thể tải bài tập! Vui lòng kiểm tra lại.');
    }
}

function showGrammarExercise() {
    if (currentExerciseIndex >= grammarExercises.length) {
        showGrammarResults();
        return;
    }
    
    const exercise = grammarExercises[currentExerciseIndex];
    document.getElementById('grammarExerciseQuestion').textContent = exercise.question;
    document.getElementById('grammarExerciseCurrent').textContent = currentExerciseIndex + 1;
    document.getElementById('grammarExerciseTotal').textContent = grammarExercises.length;
    document.getElementById('grammarScore').textContent = grammarScore;
    
    // Update progress bar
    const progress = ((currentExerciseIndex) / grammarExercises.length) * 100;
    document.getElementById('exerciseProgressFill').style.width = progress + '%';
    
    const optionsHtml = exercise.options.map((option, index) => `
        <div class="grammar-option" onclick="selectGrammarOption(${index})">
            ${option}
        </div>
    `).join('');
    document.getElementById('grammarOptions').innerHTML = optionsHtml;
    document.getElementById('grammarFeedback').textContent = '';
    document.getElementById('grammarFeedback').className = 'grammar-feedback';
}

function selectGrammarOption(selectedIndex) {
    const exercise = grammarExercises[currentExerciseIndex];
    const options = document.querySelectorAll('.grammar-option');
    
    options.forEach(opt => {
        opt.style.pointerEvents = 'none';
    });
    
    if (selectedIndex === exercise.correctAnswer) {
        options[selectedIndex].classList.add('correct');
        grammarScore++;
        document.getElementById('grammarScore').textContent = grammarScore;
        document.getElementById('grammarFeedback').className = 'grammar-feedback correct';
        document.getElementById('grammarFeedback').textContent = `✅ Chính xác! ${exercise.explanation}`;
    } else {
        options[selectedIndex].classList.add('wrong');
        options[exercise.correctAnswer].classList.add('correct');
        document.getElementById('grammarFeedback').className = 'grammar-feedback wrong';
        document.getElementById('grammarFeedback').textContent = `❌ Sai rồi! Đáp án đúng là: "${exercise.options[exercise.correctAnswer]}". ${exercise.explanation}`;
    }
    
    setTimeout(() => {
        currentExerciseIndex++;
        showGrammarExercise();
    }, 3500);
}

function showGrammarResults() {
    const percentage = Math.round((grammarScore / grammarExercises.length) * 100);
    let message = '';
    let emoji = '';
    
    if (percentage >= 90) {
        message = 'Xuất sắc!';
        emoji = '🏆';
    } else if (percentage >= 70) {
        message = 'Tốt lắm!';
        emoji = '🎉';
    } else if (percentage >= 50) {
        message = 'Khá đấy!';
        emoji = '👍';
    } else {
        message = 'Cố gắng thêm nhé!';
        emoji = '💪';
    }
    
    // Auto mark as learned if score >= 70%
    if (percentage >= 70) {
        learnedTopics.add(currentGrammarTopic.id);
        saveLearnedTopics();
    }
    
    document.getElementById('grammarOptions').innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="font-size: 80px; margin-bottom: 20px;">${emoji}</div>
            <h2 style="color: #667eea; margin-bottom: 20px;">${message}</h2>
            <p style="font-size: 28px; margin: 20px 0; color: #333;">
                Điểm: <strong style="color: #28a745;">${grammarScore}/${grammarExercises.length}</strong> (${percentage}%)
            </p>
            ${percentage >= 70 ? '<p style="color: #28a745; font-size: 18px; margin: 15px 0;">✅ Chủ đề đã được đánh dấu là đã học!</p>' : ''}
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="window.location.href='grammar.html'">📚 Chọn chủ đề khác</button>
                <button class="btn btn-secondary" onclick="startGrammarExercise()">🔄 Làm lại</button>
                <button class="btn btn-secondary" onclick="backToGrammarLesson()">📖 Xem lại lý thuyết</button>
            </div>
        </div>
    `;
    document.getElementById('grammarFeedback').textContent = '';
    
    // Update progress bar to 100%
    document.getElementById('exerciseProgressFill').style.width = '100%';
}

function backToGrammarLesson() {
    document.getElementById('grammarExerciseView').style.display = 'none';
    document.getElementById('grammarLessonView').style.display = 'block';
}

function markTopicAsLearned() {
    if (learnedTopics.has(currentGrammarTopic.id)) {
        learnedTopics.delete(currentGrammarTopic.id);
        alert('✅ Đã bỏ đánh dấu chủ đề này!');
    } else {
        learnedTopics.add(currentGrammarTopic.id);
        alert('✅ Đã đánh dấu chủ đề này là đã học!');
    }
    saveLearnedTopics();
    updateLearnedButton();
}

// Notes functions
function loadNotes() {
    const notes = localStorage.getItem(`${STORAGE_KEYS.NOTES}_${currentGrammarTopic.id}`);
    document.getElementById('userNotes').value = notes || '';
}

function saveNotes() {
    const notes = document.getElementById('userNotes').value;
    localStorage.setItem(`${STORAGE_KEYS.NOTES}_${currentGrammarTopic.id}`, notes);
    alert('💾 Ghi chú đã được lưu!');
}

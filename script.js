// Global variables
let vocabulary = [];
let currentIndex = 0;
let learnedWords = new Set();
let quizData = [];
let currentQuizIndex = 0;
let quizScore = 0;
let currentVocabList = 'vocab/vocab_1.json';
let currentImagesFolder = 'images/images_1';
let currentQuizType = 'meaning';
let currentQuizWord = null;
let autoNextEnabled = true;

// Typing practice variables
let typingWords = [];
let currentTypingIndex = 0;
let typingCorrect = 0;
let typingWrong = 0;
let currentTypingWord = null;

// LocalStorage keys
const STORAGE_KEYS = {
    LEARNED: 'learnedWords',
    REVIEW_SCHEDULE: 'reviewSchedule',
    NOTES: 'vocabularyNotes'
};

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadVocabulary();
    loadProgress();
    initializeEventListeners();
    showFlashcard();
    updateProgress();
});

// Load vocabulary from JSON
async function loadVocabulary(filename = null) {
    try {
        const file = filename || currentVocabList;
        const response = await fetch(file);
        const data = await response.json();
        vocabulary = data.vocabulary;
        currentVocabList = file;
        
        // Cập nhật đường dẫn ảnh theo vocab list
        // vocab/vocab_1.json -> images/images_1/
        const listNumber = file.match(/vocab_(\d+)\.json/)?.[1] || '1';
        currentImagesFolder = `images/images_${listNumber}`;
        
        // Reset indices
        currentIndex = 0;
        currentTypingIndex = 0;
        
        // Refresh current mode
        const activeMode = document.querySelector('.mode-btn.active');
        if (activeMode) {
            const mode = activeMode.dataset.mode;
            if (mode === 'flashcard') showFlashcard();
            if (mode === 'typing') startTypingPractice();
        }
        
        updateProgress();
    } catch (error) {
        console.error('Error loading vocabulary:', error);
        alert('Không thể tải dữ liệu từ vựng. Vui lòng kiểm tra file: ' + (filename || currentVocabList));
    }
}

// Load progress from LocalStorage
function loadProgress() {
    const saved = localStorage.getItem(STORAGE_KEYS.LEARNED);
    if (saved) {
        learnedWords = new Set(JSON.parse(saved));
    }
}

// Save progress to LocalStorage
function saveProgress() {
    localStorage.setItem(STORAGE_KEYS.LEARNED, JSON.stringify([...learnedWords]));
}

// Initialize event listeners
function initializeEventListeners() {
    // Mode switching
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    // Flashcard controls
    document.getElementById('flashcard').addEventListener('click', flipCard);
    document.getElementById('prevCard').addEventListener('click', () => navigateCard(-1));
    document.getElementById('nextCard').addEventListener('click', () => navigateCard(1));
    document.getElementById('markLearned').addEventListener('click', markAsLearned);
    document.getElementById('speakBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        speakWord();
    });

    // Quiz controls
    document.getElementById('startQuizBtn').addEventListener('click', startQuiz);
    document.getElementById('nextQuiz').addEventListener('click', nextQuizQuestion);
    document.getElementById('quizSpeakBtn').addEventListener('click', speakQuizWord);
    document.getElementById('checkFillBtn').addEventListener('click', checkFillBlank);
    document.getElementById('fillBlankInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkFillBlank();
    });
    document.getElementById('listenBtn').addEventListener('click', () => speakListeningWord(1));
    document.getElementById('listenSlowBtn').addEventListener('click', () => speakListeningWord(0.6));
    document.getElementById('autoNextToggle').addEventListener('change', (e) => {
        autoNextEnabled = e.target.checked;
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // List selector
    document.getElementById('vocabListSelect').addEventListener('change', (e) => {
        loadVocabulary(e.target.value);
    });
    document.getElementById('reloadList').addEventListener('click', () => {
        loadVocabulary(currentVocabList);
    });

    // Typing practice
    document.getElementById('typingInput').addEventListener('input', handleTypingInput);
    document.getElementById('typingInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkTyping();
    });
    document.getElementById('typingCheck').addEventListener('click', checkTyping);
    document.getElementById('typingSkip').addEventListener('click', skipTyping);
    document.getElementById('typingShowHint').addEventListener('click', showTypingHint);
}

// Switch between modes
function switchMode(mode) {
    // Update buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update content
    document.querySelectorAll('.mode-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${mode}-mode`).classList.add('active');

    // Initialize mode
    switch(mode) {
        case 'flashcard':
            showFlashcard();
            break;
        case 'quiz':
            startQuiz();
            break;
        case 'search':
            document.getElementById('searchInput').focus();
            break;
        case 'typing':
            startTypingPractice();
            break;
        case 'review':
            showReviewSchedule();
            break;
    }
}

// Flashcard functions
function showFlashcard() {
    if (vocabulary.length === 0) return;

    const word = vocabulary[currentIndex];
    document.getElementById('word').textContent = word.word;
    document.getElementById('phonetic').textContent = word.phonetic;
    document.getElementById('meaning').textContent = word.meaning;
    document.getElementById('exampleEn').textContent = word.example_en;
    document.getElementById('exampleVi').textContent = word.example_vi;
    document.getElementById('memoryTip').textContent = `💡 Mẹo ghi nhớ: ${word.memory_tip}`;

    // Set images
    const imagePath = word.image || `${currentImagesFolder}/${word.word}.png`;
    document.getElementById('wordImage').src = imagePath;
    document.getElementById('wordImage').alt = word.word;
    document.getElementById('wordImage').style.display = 'block';
    document.getElementById('wordImageBack').src = imagePath;
    document.getElementById('wordImageBack').alt = word.word;
    document.getElementById('wordImageBack').style.display = 'block';

    // Reset card state
    document.querySelector('.card-front').classList.remove('hidden');
    document.querySelector('.card-back').classList.add('hidden');

    // Update mark learned button
    const markBtn = document.getElementById('markLearned');
    if (learnedWords.has(word.id)) {
        markBtn.textContent = '✅ Đã nhớ';
        markBtn.style.background = '#6c757d';
    } else {
        markBtn.textContent = '✅ Đánh dấu đã nhớ';
        markBtn.style.background = '#28a745';
    }
}

function flipCard() {
    const front = document.querySelector('.card-front');
    const back = document.querySelector('.card-back');
    
    if (front.classList.contains('hidden')) {
        front.classList.remove('hidden');
        back.classList.add('hidden');
    } else {
        front.classList.add('hidden');
        back.classList.remove('hidden');
    }
}

function navigateCard(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = vocabulary.length - 1;
    if (currentIndex >= vocabulary.length) currentIndex = 0;
    showFlashcard();
}

function markAsLearned() {
    const word = vocabulary[currentIndex];
    
    if (learnedWords.has(word.id)) {
        learnedWords.delete(word.id);
    } else {
        learnedWords.add(word.id);
        scheduleReview(word.id);
    }
    
    saveProgress();
    updateProgress();
    showFlashcard();
}

function speakWord() {
    const word = vocabulary[currentIndex].word;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
}

// Quiz functions
async function startQuiz() {
    // Get selected list
    const selectedList = document.getElementById('quizListSelect').value;
    let quizVocabulary = vocabulary;
    
    // Load different list if selected
    if (selectedList !== 'current') {
        try {
            const response = await fetch(selectedList);
            const data = await response.json();
            quizVocabulary = data.vocabulary;
        } catch (error) {
            alert('Không thể tải danh sách từ vựng!');
            return;
        }
    }
    
    // Filter by learned/unlearned
    const wordFilter = document.getElementById('quizWordFilter').value;
    if (wordFilter === 'learned') {
        quizVocabulary = quizVocabulary.filter(word => learnedWords.has(word.id));
        if (quizVocabulary.length === 0) {
            alert('Bạn chưa học từ nào! Hãy học từ vựng trước.');
            return;
        }
    } else if (wordFilter === 'unlearned') {
        quizVocabulary = quizVocabulary.filter(word => !learnedWords.has(word.id));
        if (quizVocabulary.length === 0) {
            alert('Bạn đã học hết tất cả từ trong list này!');
            return;
        }
    }
    
    if (quizVocabulary.length < 4) {
        alert('Cần ít nhất 4 từ vựng để chơi quiz!');
        return;
    }

    currentQuizType = document.getElementById('quizTypeSelect').value;
    const wordCount = document.getElementById('quizWordCount').value;
    const maxWords = wordCount === 'all' ? quizVocabulary.length : parseInt(wordCount);
    
    quizData = shuffleArray([...quizVocabulary]).slice(0, Math.min(maxWords, quizVocabulary.length));
    currentQuizIndex = 0;
    quizScore = 0;
    
    // Show quiz content
    document.querySelector('.quiz-type-selector').style.display = 'none';
    document.getElementById('quizContent').classList.remove('hidden');
    
    // Set quiz type label
    const labels = {
        'meaning': '1️⃣ Chọn nghĩa đúng',
        'fillblank': '2️⃣ Điền từ vào chỗ trống',
        'listening': '3️⃣ Nghe audio rồi chọn từ'
    };
    document.getElementById('quizTypeLabel').textContent = labels[currentQuizType];
    document.getElementById('quizTotal').textContent = quizData.length;
    document.getElementById('nextQuiz').classList.add('hidden');
    
    showQuizQuestion();
}

function showQuizQuestion() {
    if (currentQuizIndex >= quizData.length) {
        showQuizResults();
        return;
    }

    currentQuizWord = quizData[currentQuizIndex];
    document.getElementById('quizCurrent').textContent = currentQuizIndex + 1;
    document.getElementById('score').textContent = quizScore;
    document.getElementById('quizFeedback').textContent = '';
    document.getElementById('quizFeedback').className = 'quiz-feedback';

    // Hide all quiz types
    document.getElementById('quizMeaningType').classList.add('hidden');
    document.getElementById('quizFillBlankType').classList.add('hidden');
    document.getElementById('quizListeningType').classList.add('hidden');

    // Show appropriate quiz type
    switch(currentQuizType) {
        case 'meaning':
            showMeaningQuiz();
            break;
        case 'fillblank':
            showFillBlankQuiz();
            break;
        case 'listening':
            showListeningQuiz();
            break;
    }
}

function showMeaningQuiz() {
    document.getElementById('quizMeaningType').classList.remove('hidden');
    
    const question = currentQuizWord;
    document.getElementById('quizWord').textContent = question.word;
    document.getElementById('quizPhonetic').textContent = question.phonetic;
    
    const imagePath = question.image || `${currentImagesFolder}/${question.word}.png`;
    document.getElementById('quizImage').src = imagePath;
    document.getElementById('quizImage').alt = question.word;

    // Generate options
    const options = generateQuizOptions(question);
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';

    options.forEach((option) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';
        optionDiv.textContent = option.meaning;
        optionDiv.addEventListener('click', () => selectQuizOption(optionDiv, option.id === question.id));
        optionsContainer.appendChild(optionDiv);
    });
}

function showFillBlankQuiz() {
    document.getElementById('quizFillBlankType').classList.remove('hidden');
    document.getElementById('quizOptions').innerHTML = '';
    
    const question = currentQuizWord;
    const imagePath = question.image || `${currentImagesFolder}/${question.word}.png`;
    document.getElementById('quizImageFill').src = imagePath;
    document.getElementById('quizImageFill').alt = question.word;
    
    // Create sentence with blank
    const sentence = question.example_en.replace(new RegExp(question.word, 'gi'), '<span class="blank">______</span>');
    document.getElementById('quizSentence').innerHTML = sentence;
    document.getElementById('quizHintFill').textContent = `💡 Gợi ý: ${question.phonetic} - ${question.meaning}`;
    
    // Reset input
    const input = document.getElementById('fillBlankInput');
    input.value = '';
    input.className = 'fill-blank-input';
    input.disabled = false;
    input.focus();
}

function showListeningQuiz() {
    document.getElementById('quizListeningType').classList.remove('hidden');
    
    const question = currentQuizWord;
    document.getElementById('quizHintListen').textContent = `💡 Gợi ý: ${question.meaning}`;
    
    // Auto play once
    setTimeout(() => speakListeningWord(1), 500);
    
    // Generate options
    const options = generateQuizOptions(question);
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';

    options.forEach((option) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';
        optionDiv.textContent = `${option.word} ${option.phonetic}`;
        optionDiv.addEventListener('click', () => selectQuizOption(optionDiv, option.id === question.id));
        optionsContainer.appendChild(optionDiv);
    });
}

function generateQuizOptions(correctWord) {
    const options = [correctWord];
    // Lấy từ khác từ quizData thay vì vocabulary
    const otherWords = quizData.filter(w => w.id !== correctWord.id);
    
    while (options.length < 4 && otherWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherWords.length);
        options.push(otherWords[randomIndex]);
        otherWords.splice(randomIndex, 1);
    }
    
    // Nếu không đủ 4 từ từ quizData, lấy thêm từ vocabulary
    if (options.length < 4) {
        const allOtherWords = vocabulary.filter(w => 
            w.id !== correctWord.id && !options.find(opt => opt.id === w.id)
        );
        while (options.length < 4 && allOtherWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * allOtherWords.length);
            options.push(allOtherWords[randomIndex]);
            allOtherWords.splice(randomIndex, 1);
        }
    }
    
    return shuffleArray(options);
}

function selectQuizOption(element, isCorrect) {
    // Disable all options
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.add('disabled');
        opt.style.pointerEvents = 'none';
    });

    if (isCorrect) {
        element.classList.add('correct');
        quizScore++;
        document.getElementById('score').textContent = quizScore;
    } else {
        element.classList.add('wrong');
        // Highlight correct answer
        const correctOption = Array.from(document.querySelectorAll('.quiz-option'))
            .find(opt => opt.textContent === quizData[currentQuizIndex].meaning);
        if (correctOption) correctOption.classList.add('correct');
    }

    // Auto next or show button
    if (autoNextEnabled) {
        setTimeout(() => {
            currentQuizIndex++;
            showQuizQuestion();
        }, 1500);
    } else {
        document.getElementById('nextQuiz').classList.remove('hidden');
    }
}

function nextQuizQuestion() {
    currentQuizIndex++;
    document.getElementById('nextQuiz').classList.add('hidden');
    showQuizQuestion();
}

function showQuizResults() {
    const percentage = Math.round((quizScore / quizData.length) * 100);
    let message = '';
    
    if (percentage >= 80) message = '🎉 Xuất sắc!';
    else if (percentage >= 60) message = '👍 Tốt lắm!';
    else if (percentage >= 40) message = '💪 Cố gắng thêm!';
    else message = '📚 Hãy ôn lại nhé!';

    // Hide all quiz types
    document.getElementById('quizMeaningType').classList.add('hidden');
    document.getElementById('quizFillBlankType').classList.add('hidden');
    document.getElementById('quizListeningType').classList.add('hidden');

    document.getElementById('quizOptions').innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <h2>${message}</h2>
            <p style="font-size: 24px; margin: 20px 0;">
                Điểm: ${quizScore}/${quizData.length} (${percentage}%)
            </p>
            <button class="btn btn-primary" onclick="resetQuiz()">Chọn dạng bài khác</button>
            <button class="btn btn-secondary" onclick="startQuiz()" style="margin-left: 10px;">Chơi lại dạng này</button>
        </div>
    `;
    document.getElementById('quizFeedback').textContent = '';
    document.getElementById('nextQuiz').classList.add('hidden');
}

// Search function
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('searchResults');

    if (!query) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: #999;">Nhập từ cần tìm...</p>';
        return;
    }

    const results = vocabulary.filter(word => 
        word.word.toLowerCase().includes(query) ||
        word.meaning.toLowerCase().includes(query)
    );

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: #999;">Không tìm thấy từ nào</p>';
        return;
    }

    resultsContainer.innerHTML = results.map(word => {
        const imagePath = word.image || `${currentImagesFolder}/${word.word}.png`;
        return `
        <div class="search-item">
            <img src="${imagePath}" alt="${word.word}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 10px; float: left; margin-right: 20px;" onerror="this.style.display='none'">
            <h3>${word.word} <span style="color: #666; font-size: 16px;">${word.phonetic}</span></h3>
            <p style="font-size: 18px; margin: 10px 0;"><strong>${word.meaning}</strong></p>
            <p style="color: #666; margin: 5px 0;">${word.example_en}</p>
            <p style="color: #999; font-style: italic;">${word.example_vi}</p>
            <p style="background: #fff3cd; padding: 10px; border-radius: 5px; margin-top: 10px; clear: both;">
                💡 ${word.memory_tip}
            </p>
        </div>
    `;
    }).join('');
}

// Spaced Repetition functions
function scheduleReview(wordId) {
    const schedule = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEW_SCHEDULE) || '{}');
    const today = new Date().toISOString().split('T')[0];
    
    schedule[wordId] = {
        learned: today,
        nextReview: addDays(today, 1),
        interval: 1,
        reviewCount: 0
    };
    
    localStorage.setItem(STORAGE_KEYS.REVIEW_SCHEDULE, JSON.stringify(schedule));
}

function showReviewSchedule() {
    const schedule = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEW_SCHEDULE) || '{}');
    const today = new Date().toISOString().split('T')[0];
    const reviewList = document.getElementById('reviewList');

    if (Object.keys(schedule).length === 0) {
        reviewList.innerHTML = '<p style="text-align: center; color: #999;">Chưa có từ nào trong lịch ôn tập</p>';
        return;
    }

    const items = Object.entries(schedule).map(([wordId, data]) => {
        const word = vocabulary.find(w => w.id === parseInt(wordId));
        if (!word) return null;

        const isDue = data.nextReview <= today;
        const daysUntil = Math.ceil((new Date(data.nextReview) - new Date(today)) / (1000 * 60 * 60 * 24));

        return {
            word,
            data,
            isDue,
            daysUntil
        };
    }).filter(Boolean);

    // Sort: due first, then by days until review
    items.sort((a, b) => {
        if (a.isDue && !b.isDue) return -1;
        if (!a.isDue && b.isDue) return 1;
        return a.daysUntil - b.daysUntil;
    });

    reviewList.innerHTML = items.map(item => `
        <div class="review-item ${item.isDue ? 'due' : 'upcoming'}">
            <div>
                <strong>${item.word.word}</strong> - ${item.word.meaning}
                <br>
                <small>Đã ôn: ${item.data.reviewCount} lần</small>
            </div>
            <div style="text-align: right;">
                ${item.isDue ? 
                    '<span style="color: #856404; font-weight: bold;">⏰ Cần ôn hôm nay</span>' :
                    `<span style="color: #0c5460;">📅 Ôn sau ${item.daysUntil} ngày</span>`
                }
            </div>
        </div>
    `).join('');
}

// Progress tracking
function updateProgress() {
    const total = vocabulary.length;
    const learned = learnedWords.size;
    const percentage = total > 0 ? (learned / total) * 100 : 0;

    document.getElementById('progressFill').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent = `${learned}/${total} từ đã học`;
}

// Utility functions
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function addDays(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}


// Typing Practice functions
function startTypingPractice() {
    if (vocabulary.length === 0) {
        alert('Chưa có từ vựng nào!');
        return;
    }

    typingWords = shuffleArray([...vocabulary]);
    currentTypingIndex = 0;
    typingCorrect = 0;
    typingWrong = 0;
    
    updateTypingStats();
    showTypingWord();
}

function showTypingWord() {
    if (currentTypingIndex >= typingWords.length) {
        showTypingResults();
        return;
    }

    currentTypingWord = typingWords[currentTypingIndex];
    
    document.getElementById('typingMeaning').textContent = currentTypingWord.meaning;
    document.getElementById('typingPhonetic').textContent = currentTypingWord.phonetic;
    document.getElementById('typingExample').textContent = currentTypingWord.example_vi;
    
    const imagePath = currentTypingWord.image || `${currentImagesFolder}/${currentTypingWord.word}.png`;
    document.getElementById('typingImage').src = imagePath;
    document.getElementById('typingImage').alt = currentTypingWord.word;
    document.getElementById('typingImage').style.display = 'block';
    
    // Reset input
    const input = document.getElementById('typingInput');
    input.value = '';
    input.className = 'typing-input';
    input.disabled = false;
    input.focus();
    
    // Reset feedback and hint
    document.getElementById('typingFeedback').textContent = '';
    document.getElementById('typingFeedback').className = 'typing-feedback';
    document.getElementById('typingHint').classList.add('hidden');
}

function handleTypingInput(e) {
    const input = e.target.value.toLowerCase().trim();
    const correct = currentTypingWord.word.toLowerCase();
    
    // Real-time feedback
    if (input && correct.startsWith(input)) {
        e.target.style.borderColor = '#28a745';
    } else if (input) {
        e.target.style.borderColor = '#dc3545';
    } else {
        e.target.style.borderColor = '#667eea';
    }
}

function checkTyping() {
    const input = document.getElementById('typingInput');
    const userAnswer = input.value.toLowerCase().trim();
    const correctAnswer = currentTypingWord.word.toLowerCase();
    const feedback = document.getElementById('typingFeedback');
    
    if (!userAnswer) {
        alert('Vui lòng nhập từ vựng!');
        return;
    }
    
    input.disabled = true;
    
    if (userAnswer === correctAnswer) {
        // Correct
        input.classList.add('correct');
        feedback.className = 'typing-feedback correct';
        feedback.textContent = `✅ Chính xác! "${currentTypingWord.word}" - ${currentTypingWord.example_en}`;
        typingCorrect++;
        
        setTimeout(() => {
            currentTypingIndex++;
            updateTypingStats();
            showTypingWord();
        }, 2000);
    } else {
        // Wrong
        input.classList.add('wrong');
        feedback.className = 'typing-feedback wrong';
        feedback.textContent = `❌ Sai rồi! Đáp án đúng là: "${currentTypingWord.word}"`;
        typingWrong++;
        
        setTimeout(() => {
            currentTypingIndex++;
            updateTypingStats();
            showTypingWord();
        }, 3000);
    }
}

function skipTyping() {
    const feedback = document.getElementById('typingFeedback');
    feedback.className = 'typing-feedback';
    feedback.textContent = `⏭️ Đáp án: "${currentTypingWord.word}" - ${currentTypingWord.example_en}`;
    
    document.getElementById('typingInput').disabled = true;
    
    setTimeout(() => {
        currentTypingIndex++;
        updateTypingStats();
        showTypingWord();
    }, 2000);
}

function showTypingHint() {
    const hint = document.getElementById('typingHint');
    const hintText = document.getElementById('typingHintText');
    
    const word = currentTypingWord.word;
    const hintLength = Math.ceil(word.length / 2);
    const revealed = word.substring(0, hintLength);
    const hidden = '_'.repeat(word.length - hintLength);
    
    hintText.textContent = revealed + hidden;
    hint.classList.remove('hidden');
}

function updateTypingStats() {
    document.getElementById('typingCorrect').textContent = typingCorrect;
    document.getElementById('typingWrong').textContent = typingWrong;
    
    const total = typingCorrect + typingWrong;
    const accuracy = total > 0 ? Math.round((typingCorrect / total) * 100) : 0;
    document.getElementById('typingAccuracy').textContent = accuracy + '%';
}

function showTypingResults() {
    const total = typingCorrect + typingWrong;
    const accuracy = total > 0 ? Math.round((typingCorrect / total) * 100) : 0;
    
    let message = '';
    if (accuracy >= 90) message = '🏆 Xuất sắc!';
    else if (accuracy >= 70) message = '🎉 Tốt lắm!';
    else if (accuracy >= 50) message = '👍 Khá đấy!';
    else message = '💪 Cố gắng thêm nhé!';
    
    document.getElementById('typingMeaning').textContent = message;
    document.getElementById('typingPhonetic').textContent = '';
    document.getElementById('typingExample').textContent = `Bạn đã hoàn thành ${total} từ với độ chính xác ${accuracy}%`;
    document.getElementById('typingImage').style.display = 'none';
    
    const input = document.getElementById('typingInput');
    input.style.display = 'none';
    
    const feedback = document.getElementById('typingFeedback');
    feedback.className = 'typing-feedback';
    feedback.innerHTML = `
        <button class="btn btn-primary" onclick="startTypingPractice()" style="margin-top: 20px;">
            🔄 Luyện tập lại
        </button>
    `;
}


function speakQuizWord() {
    const word = currentQuizWord.word;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
}

function speakListeningWord(rate = 1) {
    const word = currentQuizWord.word;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    speechSynthesis.speak(utterance);
}

function checkFillBlank() {
    const input = document.getElementById('fillBlankInput');
    const userAnswer = input.value.toLowerCase().trim();
    const correctAnswer = currentQuizWord.word.toLowerCase();
    const feedback = document.getElementById('quizFeedback');
    
    if (!userAnswer) {
        alert('Vui lòng nhập từ vào chỗ trống!');
        return;
    }
    
    input.disabled = true;
    
    if (userAnswer === correctAnswer) {
        input.classList.add('correct');
        feedback.className = 'quiz-feedback correct';
        feedback.textContent = `✅ Chính xác! "${currentQuizWord.word}" - ${currentQuizWord.meaning}`;
        quizScore++;
        document.getElementById('score').textContent = quizScore;
    } else {
        input.classList.add('wrong');
        feedback.className = 'quiz-feedback wrong';
        feedback.textContent = `❌ Sai rồi! Đáp án đúng là: "${currentQuizWord.word}"`;
    }
    
    // Disable all options
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.add('disabled');
        opt.style.pointerEvents = 'none';
    });
    
    // Auto next or show button
    if (autoNextEnabled) {
        setTimeout(() => {
            currentQuizIndex++;
            showQuizQuestion();
        }, 2000);
    } else {
        document.getElementById('nextQuiz').classList.remove('hidden');
    }
}

function resetQuiz() {
    document.querySelector('.quiz-type-selector').style.display = 'flex';
    document.getElementById('quizContent').classList.add('hidden');
    document.getElementById('quizOptions').innerHTML = '';
}

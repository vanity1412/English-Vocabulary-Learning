// ============================================
// VOCABULARY LEARNING APP - SIMPLIFIED VERSION
// ============================================

// Global Variables
let vocabulary = [];
let currentIndex = 0;
let learnedWords = new Set();
let currentVocabList = 'vocab/vocab_1.json';
let currentImagesFolder = 'images/images_1';

// Quiz variables
let quizData = [];
let currentQuizIndex = 0;
let quizScore = 0;
let quizStartTime = null;
let quizType = 'meaning';

// Typing variables
let typingWords = [];
let currentTypingIndex = 0;
let typingScore = 0;
let typingStartTime = null;

// Settings
let speechRate = 0.8;
let autoSpeak = false;
let selectedVoice = null;

// Storage keys
const STORAGE_KEYS = {
    LEARNED_WORDS: 'toeic_learned_words',
    SPEECH_RATE: 'toeic_speech_rate',
    AUTO_SPEAK: 'toeic_auto_speak',
    DARK_MODE: 'toeic_dark_mode'
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    loadSettings();
    loadProgress();
    initializeEventListeners();
    initializeSpeech();
    await loadVocabulary(currentVocabList);
}

// ============================================
// EVENT LISTENERS
// ============================================

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
    document.getElementById('startQuiz').addEventListener('click', startQuiz);
    document.getElementById('nextQuizBtn').addEventListener('click', nextQuizQuestion);
    document.getElementById('retryQuiz').addEventListener('click', resetQuiz);
    document.getElementById('quizSpeakBtn').addEventListener('click', speakQuizWord);
    document.getElementById('checkFillBlank').addEventListener('click', checkFillBlank);
    document.getElementById('fillBlankInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkFillBlank();
    });
    document.getElementById('listenNormal').addEventListener('click', () => speakListeningWord(1));
    document.getElementById('listenSlow').addEventListener('click', () => speakListeningWord(0.6));

    // Typing controls
    document.getElementById('startTyping').addEventListener('click', startTypingPractice);
    document.getElementById('typingInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkTyping();
    });
    document.getElementById('nextTypingBtn').addEventListener('click', nextTypingWord);
    document.getElementById('typingSpeakBtn').addEventListener('click', speakTypingWord);
    document.getElementById('retryTyping').addEventListener('click', resetTyping);

    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Review
    document.getElementById('reviewLearnedBtn').addEventListener('click', reviewLearnedWords);
    document.getElementById('reviewUnlearnedBtn').addEventListener('click', reviewUnlearnedWords);

    // List selector
    document.getElementById('vocabListSelect').addEventListener('change', (e) => {
        loadVocabulary(e.target.value);
    });
    document.getElementById('reloadList').addEventListener('click', () => {
        loadVocabulary(currentVocabList);
    });

    // Settings
    document.getElementById('shortcutsToggle').addEventListener('click', toggleShortcutsPanel);
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettings').addEventListener('click', closeSettings);
    document.getElementById('speechRate').addEventListener('input', updateSpeechRate);
    document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);
    document.getElementById('autoSpeakToggle').addEventListener('change', toggleAutoSpeak);
    document.getElementById('resetProgressBtn').addEventListener('click', resetProgress);
    document.getElementById('exportProgressBtn').addEventListener('click', exportProgress);
    document.getElementById('importProgressBtn').addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput').addEventListener('change', importProgress);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

// ============================================
// LOAD & SAVE DATA
// ============================================

async function loadVocabulary(listPath) {
    try {
        const response = await fetch(listPath);
        const data = await response.json();
        vocabulary = data.vocabulary;
        currentVocabList = listPath;
        
        // Update images folder based on list number
        const listNumber = listPath.match(/vocab_(\d+)/)[1];
        currentImagesFolder = `images/images_${listNumber}`;
        
        currentIndex = 0;
        updateProgress();
        
        // Refresh current mode
        const activeMode = document.querySelector('.mode-btn.active');
        if (activeMode) {
            switchMode(activeMode.dataset.mode);
        } else {
            showFlashcard();
        }
    } catch (error) {
        console.error('Error loading vocabulary:', error);
        alert('Không thể tải danh sách từ vựng!');
    }
}

function loadSettings() {
    speechRate = parseFloat(localStorage.getItem(STORAGE_KEYS.SPEECH_RATE) || '0.8');
    autoSpeak = localStorage.getItem(STORAGE_KEYS.AUTO_SPEAK) === 'true';
    
    document.getElementById('speechRate').value = speechRate;
    document.getElementById('speechRateValue').textContent = speechRate + 'x';
    document.getElementById('autoSpeakToggle').checked = autoSpeak;
    
    if (localStorage.getItem(STORAGE_KEYS.DARK_MODE) === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').checked = true;
    }
}

function loadProgress() {
    const saved = localStorage.getItem(STORAGE_KEYS.LEARNED_WORDS);
    if (saved) {
        learnedWords = new Set(JSON.parse(saved));
    }
}

function saveProgress() {
    localStorage.setItem(STORAGE_KEYS.LEARNED_WORDS, JSON.stringify([...learnedWords]));
}

function updateProgress() {
    const total = vocabulary.length;
    const learned = learnedWords.size;
    const percentage = total > 0 ? (learned / total) * 100 : 0;
    
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressText').textContent = `${learned}/${total} từ đã học`;
}

// ============================================
// MODE SWITCHING
// ============================================

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
        case 'vocabulary':
            renderVocabularyList();
            break;
        case 'quiz':
            resetQuiz();
            break;
        case 'typing':
            resetTyping();
            break;
        case 'search':
            document.getElementById('searchInput').focus();
            break;
        case 'review':
            showReviewStats();
            break;
    }
}

// ============================================
// FLASHCARD MODE
// ============================================

function showFlashcard() {
    if (vocabulary.length === 0) return;

    const word = vocabulary[currentIndex];
    document.getElementById('word').textContent = word.word;
    document.getElementById('phonetic').textContent = word.phonetic;
    document.getElementById('meaning').textContent = word.meaning;
    document.getElementById('exampleEn').textContent = word.example_en;
    document.getElementById('exampleVi').textContent = word.example_vi;
    document.getElementById('memoryTip').textContent = `💡 ${word.memory_tip}`;

    // Set images
    const imagePath = `${currentImagesFolder}/${word.word}.png`;
    document.getElementById('wordImage').src = imagePath;
    document.getElementById('wordImageBack').src = imagePath;

    // Reset card state
    document.querySelector('.card-front').classList.remove('hidden');
    document.querySelector('.card-back').classList.add('hidden');

    // Update mark learned button
    const markBtn = document.getElementById('markLearned');
    if (learnedWords.has(word.word)) {
        markBtn.textContent = '✅ Đã nhớ';
        markBtn.classList.add('learned');
    } else {
        markBtn.textContent = '✅ Đánh dấu đã nhớ';
        markBtn.classList.remove('learned');
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
        if (autoSpeak) speakWord();
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
    if (learnedWords.has(word.word)) {
        learnedWords.delete(word.word);
    } else {
        learnedWords.add(word.word);
    }
    saveProgress();
    updateProgress();
    showFlashcard();
}

function speakWord() {
    const word = vocabulary[currentIndex].word;
    speak(word);
}

// ============================================
// VOCABULARY LIST VIEW
// ============================================

function renderVocabularyList() {
    const vocabList = document.getElementById('vocabList');
    if (!vocabList) return;
    
    vocabList.innerHTML = '';
    
    if (vocabulary.length === 0) {
        vocabList.innerHTML = '<p class="no-data">Chưa có từ vựng. Vui lòng chọn danh sách.</p>';
        return;
    }
    
    vocabulary.forEach((word, index) => {
        const isLearned = learnedWords.has(word.word);
        const wordCard = document.createElement('div');
        wordCard.className = `vocab-card ${isLearned ? 'learned' : ''}`;
        wordCard.innerHTML = `
            <div class="vocab-card-header">
                <h3>${word.word}</h3>
                <span class="vocab-phonetic">${word.phonetic}</span>
                <button class="vocab-speak-btn" onclick="speakText('${word.word}')">🔊</button>
            </div>
            <div class="vocab-card-body">
                <p class="vocab-meaning"><strong>Nghĩa:</strong> ${word.meaning}</p>
                <p class="vocab-example"><strong>Ví dụ:</strong> ${word.example_en}</p>
                <p class="vocab-example-vi">${word.example_vi}</p>
                ${word.memory_tip ? `<p class="vocab-tip">💡 ${word.memory_tip}</p>` : ''}
            </div>
            <div class="vocab-card-footer">
                <button class="btn btn-sm ${isLearned ? 'btn-secondary' : 'btn-primary'}" 
                        onclick="toggleLearnedFromList(${index})">
                    ${isLearned ? '✅ Đã nhớ' : '📝 Đánh dấu'}
                </button>
            </div>
        `;
        vocabList.appendChild(wordCard);
    });
}

function toggleLearnedFromList(index) {
    const word = vocabulary[index];
    if (learnedWords.has(word.word)) {
        learnedWords.delete(word.word);
    } else {
        learnedWords.add(word.word);
    }
    saveProgress();
    updateProgress();
    renderVocabularyList();
}

function speakText(text) {
    speak(text);
}

// ============================================
// QUIZ MODE
// ============================================

function startQuiz() {
    if (vocabulary.length < 4) {
        alert('Cần ít nhất 4 từ vựng để chơi quiz!');
        return;
    }

    quizType = document.getElementById('quizType').value;
    const questionCount = parseInt(document.getElementById('quizQuestionCount').value);
    quizData = shuffleArray([...vocabulary]).slice(0, Math.min(questionCount, vocabulary.length));
    currentQuizIndex = 0;
    quizScore = 0;
    quizStartTime = Date.now();
    
    document.querySelector('.quiz-settings').style.display = 'none';
    document.getElementById('quizContainer').classList.remove('hidden');
    document.getElementById('quizResult').classList.add('hidden');
    
    showQuizQuestion();
    updateQuizTimer();
}

function showQuizQuestion() {
    if (currentQuizIndex >= quizData.length) {
        showQuizResult();
        return;
    }
    
    const question = quizData[currentQuizIndex];
    
    document.getElementById('quizProgress').textContent = `Câu ${currentQuizIndex + 1}/${quizData.length}`;
    document.getElementById('quizScore').textContent = `Điểm: ${quizScore}`;
    
    // Hide all quiz types
    document.getElementById('meaningQuiz').classList.add('hidden');
    document.getElementById('fillBlankQuiz').classList.add('hidden');
    document.getElementById('listeningQuiz').classList.add('hidden');
    document.getElementById('nextQuizBtn').classList.add('hidden');
    
    // Show appropriate quiz type
    switch(quizType) {
        case 'meaning':
            showMeaningQuiz(question);
            break;
        case 'fillblank':
            showFillBlankQuiz(question);
            break;
        case 'listening':
            showListeningQuiz(question);
            break;
    }
}

function showMeaningQuiz(question) {
    document.getElementById('meaningQuiz').classList.remove('hidden');
    
    document.getElementById('quizWord').textContent = question.word;
    document.getElementById('quizPhonetic').textContent = question.phonetic;
    
    const imagePath = `${currentImagesFolder}/${question.word}.png`;
    document.getElementById('quizImage').src = imagePath;
    document.getElementById('quizImage').style.display = 'block';
    
    const options = generateQuizOptions(question);
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';

    options.forEach((option) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';
        optionDiv.textContent = option.meaning;
        optionDiv.onclick = () => selectQuizOption(optionDiv, option.word === question.word);
        optionsContainer.appendChild(optionDiv);
    });
}

function showFillBlankQuiz(question) {
    document.getElementById('fillBlankQuiz').classList.remove('hidden');
    
    const imagePath = `${currentImagesFolder}/${question.word}.png`;
    document.getElementById('fillBlankImage').src = imagePath;
    document.getElementById('fillBlankImage').style.display = 'block';
    
    document.getElementById('fillBlankHint').textContent = `${question.phonetic} - ${question.meaning}`;
    
    // Create sentence with blank
    const sentence = question.example_en.replace(new RegExp(question.word, 'gi'), '<span class="blank">______</span>');
    document.getElementById('fillBlankSentence').innerHTML = sentence;
    
    const input = document.getElementById('fillBlankInput');
    input.value = '';
    input.disabled = false;
    input.focus();
    
    document.getElementById('fillBlankFeedback').classList.add('hidden');
}

function showListeningQuiz(question) {
    document.getElementById('listeningQuiz').classList.remove('hidden');
    
    document.getElementById('listeningHint').textContent = question.meaning;
    
    // Auto play once
    setTimeout(() => speak(question.word), 500);
    
    const options = generateQuizOptions(question);
    const optionsContainer = document.getElementById('listeningOptions');
    optionsContainer.innerHTML = '';

    options.forEach((option) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';
        optionDiv.textContent = `${option.word} ${option.phonetic}`;
        optionDiv.onclick = () => selectQuizOption(optionDiv, option.word === question.word);
        optionsContainer.appendChild(optionDiv);
    });
}

function generateQuizOptions(correctWord) {
    const options = [correctWord];
    const otherWords = vocabulary.filter(w => w.word !== correctWord.word);
    
    while (options.length < 4 && otherWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherWords.length);
        options.push(otherWords[randomIndex]);
        otherWords.splice(randomIndex, 1);
    }
    
    return shuffleArray(options);
}

function selectQuizOption(optionDiv, isCorrect) {
    // Disable all options
    const container = optionDiv.parentElement;
    container.querySelectorAll('.quiz-option').forEach(opt => {
        opt.style.pointerEvents = 'none';
    });
    
    if (isCorrect) {
        optionDiv.classList.add('correct');
        quizScore++;
        document.getElementById('quizScore').textContent = `Điểm: ${quizScore}`;
    } else {
        optionDiv.classList.add('wrong');
        // Show correct answer
        const correctAnswer = quizData[currentQuizIndex];
        container.querySelectorAll('.quiz-option').forEach(opt => {
            if (quizType === 'meaning') {
                if (opt.textContent === correctAnswer.meaning) {
                    opt.classList.add('correct');
                }
            } else if (quizType === 'listening') {
                if (opt.textContent.includes(correctAnswer.word)) {
                    opt.classList.add('correct');
                }
            }
        });
    }
    
    document.getElementById('nextQuizBtn').classList.remove('hidden');
}

function checkFillBlank() {
    const input = document.getElementById('fillBlankInput');
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = quizData[currentQuizIndex].word.toLowerCase();
    const feedback = document.getElementById('fillBlankFeedback');
    
    input.disabled = true;
    
    if (userAnswer === correctAnswer) {
        feedback.className = 'fill-blank-feedback correct';
        feedback.textContent = `✅ Chính xác! "${quizData[currentQuizIndex].word}"`;
        quizScore++;
        document.getElementById('quizScore').textContent = `Điểm: ${quizScore}`;
    } else {
        feedback.className = 'fill-blank-feedback wrong';
        feedback.textContent = `❌ Sai rồi! Đáp án đúng: "${quizData[currentQuizIndex].word}"`;
    }
    
    feedback.classList.remove('hidden');
    document.getElementById('nextQuizBtn').classList.remove('hidden');
}

function speakQuizWord() {
    const question = quizData[currentQuizIndex];
    speak(question.word);
}

function speakListeningWord(rate) {
    const question = quizData[currentQuizIndex];
    speak(question.word, rate);
}

function nextQuizQuestion() {
    currentQuizIndex++;
    showQuizQuestion();
}

function showQuizResult() {
    const elapsed = Math.floor((Date.now() - quizStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const accuracy = Math.round((quizScore / quizData.length) * 100);
    
    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('quizResult').classList.remove('hidden');
    
    document.getElementById('finalScore').textContent = `${quizScore}/${quizData.length}`;
    document.getElementById('finalTime').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
}

function resetQuiz() {
    document.querySelector('.quiz-settings').style.display = 'block';
    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('quizResult').classList.add('hidden');
}

function updateQuizTimer() {
    if (!quizStartTime || currentQuizIndex >= quizData.length) return;
    
    const elapsed = Math.floor((Date.now() - quizStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('quizTimer').textContent = `⏱️ ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    setTimeout(updateQuizTimer, 1000);
}

// ============================================
// TYPING PRACTICE MODE
// ============================================

function startTypingPractice() {
    if (vocabulary.length === 0) {
        alert('Chưa có từ vựng!');
        return;
    }

    const wordCount = parseInt(document.getElementById('typingWordCount').value);
    typingWords = shuffleArray([...vocabulary]).slice(0, Math.min(wordCount, vocabulary.length));
    currentTypingIndex = 0;
    typingScore = 0;
    typingStartTime = Date.now();
    
    document.querySelector('.typing-settings').style.display = 'none';
    document.getElementById('typingContainer').classList.remove('hidden');
    document.getElementById('typingResult').classList.add('hidden');
    
    showTypingWord();
    updateTypingTimer();
}

function showTypingWord() {
    if (currentTypingIndex >= typingWords.length) {
        showTypingResult();
        return;
    }
    
    const word = typingWords[currentTypingIndex];
    
    document.getElementById('typingProgress').textContent = `Từ ${currentTypingIndex + 1}/${typingWords.length}`;
    document.getElementById('typingScore').textContent = `Điểm: ${typingScore}`;
    document.getElementById('typingMeaning').textContent = word.meaning;
    document.getElementById('typingPhonetic').textContent = word.phonetic;
    
    const input = document.getElementById('typingInput');
    input.value = '';
    input.disabled = false;
    input.focus();
    
    document.getElementById('typingFeedback').classList.add('hidden');
    document.getElementById('nextTypingBtn').classList.add('hidden');
}

function checkTyping() {
    const input = document.getElementById('typingInput');
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = typingWords[currentTypingIndex].word.toLowerCase();
    const feedback = document.getElementById('typingFeedback');
    
    input.disabled = true;
    
    if (userAnswer === correctAnswer) {
        feedback.className = 'typing-feedback correct';
        feedback.textContent = `✅ Chính xác! "${typingWords[currentTypingIndex].word}"`;
        typingScore++;
        document.getElementById('typingScore').textContent = `Điểm: ${typingScore}`;
    } else {
        feedback.className = 'typing-feedback wrong';
        feedback.textContent = `❌ Sai rồi! Đáp án đúng: "${typingWords[currentTypingIndex].word}"`;
    }
    
    feedback.classList.remove('hidden');
    document.getElementById('nextTypingBtn').classList.remove('hidden');
}

function nextTypingWord() {
    currentTypingIndex++;
    showTypingWord();
}

function speakTypingWord() {
    if (currentTypingIndex < typingWords.length) {
        speak(typingWords[currentTypingIndex].word);
    }
}

function showTypingResult() {
    const elapsed = Math.floor((Date.now() - typingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const accuracy = Math.round((typingScore / typingWords.length) * 100);
    
    document.getElementById('typingContainer').classList.add('hidden');
    document.getElementById('typingResult').classList.remove('hidden');
    
    document.getElementById('typingFinalScore').textContent = `${typingScore}/${typingWords.length}`;
    document.getElementById('typingFinalTime').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('typingAccuracy').textContent = `${accuracy}%`;
}

function resetTyping() {
    document.querySelector('.typing-settings').style.display = 'block';
    document.getElementById('typingContainer').classList.add('hidden');
    document.getElementById('typingResult').classList.add('hidden');
}

function updateTypingTimer() {
    if (!typingStartTime || currentTypingIndex >= typingWords.length) return;
    
    const elapsed = Math.floor((Date.now() - typingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('typingTimer').textContent = `⏱️ ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    setTimeout(updateTypingTimer, 1000);
}

function handleTypingInput(e) {
    if (e.target.value.trim()) {
        // Could add real-time feedback here
    }
}

// ============================================
// SEARCH MODE
// ============================================

function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('searchResults');
    
    if (!query) {
        resultsContainer.innerHTML = '<p class="no-data">Nhập từ khóa để tìm kiếm...</p>';
        return;
    }
    
    const results = vocabulary.filter(word => 
        word.word.toLowerCase().includes(query) || 
        word.meaning.toLowerCase().includes(query)
    );
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="no-data">Không tìm thấy kết quả nào.</p>';
        return;
    }
    
    resultsContainer.innerHTML = '';
    results.forEach(word => {
        const resultCard = document.createElement('div');
        resultCard.className = 'search-result-card';
        resultCard.innerHTML = `
            <div class="search-result-header">
                <h3>${word.word}</h3>
                <span class="search-phonetic">${word.phonetic}</span>
                <button class="search-speak-btn" onclick="speakText('${word.word}')">🔊</button>
            </div>
            <p class="search-meaning">${word.meaning}</p>
            <p class="search-example">${word.example_en}</p>
            <p class="search-example-vi">${word.example_vi}</p>
        `;
        resultsContainer.appendChild(resultCard);
    });
}

// ============================================
// REVIEW MODE
// ============================================

function showReviewStats() {
    const totalWords = vocabulary.length;
    const learned = learnedWords.size;
    const unlearned = totalWords - learned;
    
    document.getElementById('totalWords').textContent = totalWords;
    document.getElementById('learnedWords').textContent = learned;
    document.getElementById('unlearnedWords').textContent = unlearned;
    
    renderLearnedWordsList();
}

function renderLearnedWordsList() {
    const listContainer = document.getElementById('learnedWordsList');
    if (!listContainer) return;
    
    const learnedWordsArray = vocabulary.filter(word => learnedWords.has(word.word));
    
    if (learnedWordsArray.length === 0) {
        listContainer.innerHTML = '<p class="no-data">Chưa có từ nào được đánh dấu đã nhớ.</p>';
        return;
    }
    
    listContainer.innerHTML = '<h3>📚 Danh sách từ đã học</h3>';
    learnedWordsArray.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.className = 'learned-word-item';
        wordItem.innerHTML = `
            <span class="learned-word-text">${word.word} - ${word.meaning}</span>
            <button class="btn btn-sm btn-secondary" onclick="speakText('${word.word}')">🔊</button>
        `;
        listContainer.appendChild(wordItem);
    });
}

function reviewLearnedWords() {
    const learnedWordsArray = vocabulary.filter(word => learnedWords.has(word.word));
    
    if (learnedWordsArray.length === 0) {
        alert('Bạn chưa đánh dấu từ nào là đã nhớ!');
        return;
    }
    
    // Switch to flashcard with only learned words
    const originalVocab = [...vocabulary];
    vocabulary = learnedWordsArray;
    currentIndex = 0;
    switchMode('flashcard');
    
    // Restore when leaving
    setTimeout(() => {
        const observer = new MutationObserver(() => {
            if (!document.getElementById('flashcard-mode').classList.contains('active')) {
                vocabulary = originalVocab;
                observer.disconnect();
            }
        });
        observer.observe(document.getElementById('flashcard-mode'), { attributes: true });
    }, 100);
}

function reviewUnlearnedWords() {
    const unlearnedWords = vocabulary.filter(word => !learnedWords.has(word.word));
    
    if (unlearnedWords.length === 0) {
        alert('Bạn đã học hết tất cả các từ!');
        return;
    }
    
    const originalVocab = [...vocabulary];
    vocabulary = unlearnedWords;
    currentIndex = 0;
    switchMode('flashcard');
    
    setTimeout(() => {
        const observer = new MutationObserver(() => {
            if (!document.getElementById('flashcard-mode').classList.contains('active')) {
                vocabulary = originalVocab;
                observer.disconnect();
            }
        });
        observer.observe(document.getElementById('flashcard-mode'), { attributes: true });
    }, 100);
}

// ============================================
// SPEECH SYNTHESIS
// ============================================

function initializeSpeech() {
    if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = () => {
            const voices = speechSynthesis.getVoices();
            selectedVoice = voices.find(v => 
                v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))
            ) || voices.find(v => v.lang.startsWith('en'));
        };
    }
}

function speak(text, rate = null) {
    if (!('speechSynthesis' in window)) {
        alert('Trình duyệt không hỗ trợ phát âm!');
        return;
    }
    
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate || speechRate;
    
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    
    speechSynthesis.speak(utterance);
}

// ============================================
// SETTINGS
// ============================================

function toggleShortcutsPanel() {
    const panel = document.getElementById('shortcutsPanel');
    panel.classList.toggle('hidden');
}

function openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function updateSpeechRate(e) {
    speechRate = parseFloat(e.target.value);
    document.getElementById('speechRateValue').textContent = speechRate + 'x';
    localStorage.setItem(STORAGE_KEYS.SPEECH_RATE, speechRate);
}

function toggleDarkMode(e) {
    document.body.classList.toggle('dark-mode', e.target.checked);
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, e.target.checked);
}

function toggleAutoSpeak(e) {
    autoSpeak = e.target.checked;
    localStorage.setItem(STORAGE_KEYS.AUTO_SPEAK, autoSpeak);
}

function resetProgress() {
    if (confirm('Bạn có chắc muốn xóa toàn bộ tiến độ học?')) {
        learnedWords.clear();
        saveProgress();
        updateProgress();
        alert('Đã reset tiến độ học!');
    }
}

function exportProgress() {
    const data = {
        learnedWords: [...learnedWords],
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toeic-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importProgress(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (data.learnedWords) {
                learnedWords = new Set(data.learnedWords);
                saveProgress();
                updateProgress();
                alert('Đã nhập dữ liệu thành công!');
            }
        } catch (error) {
            alert('File không hợp lệ!');
        }
    };
    reader.readAsText(file);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

function handleKeyboard(e) {
    const activeMode = document.querySelector('.mode-btn.active')?.dataset.mode;
    
    if (activeMode === 'flashcard') {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                navigateCard(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                navigateCard(1);
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case ' ':
                e.preventDefault();
                flipCard();
                break;
            case '\\':
                e.preventDefault();
                speakWord();
                break;
            case 'Enter':
                e.preventDefault();
                markAsLearned();
                break;
        }
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// ============================================
// GLOBAL FUNCTIONS (for onclick in HTML)
// ============================================

window.speakText = speakText;
window.toggleLearnedFromList = toggleLearnedFromList;

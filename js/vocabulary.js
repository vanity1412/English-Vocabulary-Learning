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
    DARK_MODE: 'toeic_dark_mode',
    PERSONAL_VOCAB: 'toeic_personal_vocab',
    PERSONAL_VOCAB_META: 'toeic_personal_vocab_meta',
    DEEPSEEK_API_KEY: 'toeic_deepseek_api_key_v1'
};

const PERSONAL_VOCAB_VALUE = 'custom:personal';
const LOCAL_SECRET_PASSPHRASE = 'VVT';
const DEEPSEEK_CHAT_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    loadSettings();
    loadProgress();
    initializePersonalVocabUI();
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

    // Personal vocabulary
    document.getElementById('togglePersonalPanel')?.addEventListener('click', togglePersonalPanel);
    document.getElementById('saveDeepseekKey')?.addEventListener('click', saveDeepSeekKeyFromInput);
    document.getElementById('clearDeepseekKey')?.addEventListener('click', clearDeepSeekKey);
    document.getElementById('loadPersonalRawUrl')?.addEventListener('click', loadPersonalRawUrl);
    document.getElementById('personalFileInput')?.addEventListener('change', handlePersonalFileUpload);
    document.getElementById('generatePersonalVocab')?.addEventListener('click', generatePersonalVocabulary);
    document.getElementById('usePersonalVocab')?.addEventListener('click', () => loadVocabulary(PERSONAL_VOCAB_VALUE));
    document.getElementById('exportPersonalVocab')?.addEventListener('click', exportPersonalVocabulary);
    document.getElementById('clearPersonalVocab')?.addEventListener('click', clearPersonalVocabulary);

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
        currentVocabList = listPath;

        if (listPath === PERSONAL_VOCAB_VALUE) {
            const personalData = loadPersonalVocabularyData();
            vocabulary = personalData.vocabulary;
            currentImagesFolder = '';
            updatePersonalOptionLabel();
        } else {
            const response = await fetch(listPath);
            const data = await response.json();
            vocabulary = Array.isArray(data.vocabulary) ? data.vocabulary : [];

            // Update images folder based on list number
            const listNumber = listPath.match(/vocab_(\d+)/)?.[1];
            currentImagesFolder = listNumber ? `images/images_${listNumber}` : '';
        }
        
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
        showEmptyVocabularyState('Không thể tải danh sách từ vựng.');
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
    const learned = vocabulary.filter(word => learnedWords.has(word.word)).length;
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
    if (vocabulary.length === 0) {
        showEmptyVocabularyState('Chưa có từ vựng trong danh sách này.');
        return;
    }

    const word = vocabulary[currentIndex];
    document.getElementById('word').textContent = word.word || '';
    document.getElementById('phonetic').textContent = word.phonetic || '';
    document.getElementById('meaning').textContent = word.meaning || '';
    document.getElementById('exampleEn').textContent = word.example_en || '';
    document.getElementById('exampleVi').textContent = word.example_vi || '';
    document.getElementById('memoryTip').textContent = word.memory_tip ? `💡 ${word.memory_tip}` : '';

    // Set images
    const imagePath = getWordImagePath(word);
    const wordImageFront = document.getElementById('wordImage');
    const wordImageBack = document.getElementById('wordImageBack');

    if (imagePath) {
        wordImageFront.src = imagePath;
        wordImageBack.src = imagePath;
        wordImageFront.style.display = 'block';
        wordImageBack.style.display = 'block';
    } else {
        wordImageFront.removeAttribute('src');
        wordImageBack.removeAttribute('src');
        wordImageFront.style.display = 'none';
        wordImageBack.style.display = 'none';
    }
    
    // Hide image if it fails to load
    wordImageFront.onerror = function() {
        this.style.display = 'none';
    };
    wordImageBack.onerror = function() {
        this.style.display = 'none';
    };

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
    if (!vocabulary[currentIndex]) return;
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

        const header = document.createElement('div');
        header.className = 'vocab-card-header';

        const title = document.createElement('h3');
        title.textContent = word.word || '';
        const phonetic = document.createElement('span');
        phonetic.className = 'vocab-phonetic';
        phonetic.textContent = word.phonetic || '';
        const speakBtn = document.createElement('button');
        speakBtn.className = 'vocab-speak-btn';
        speakBtn.type = 'button';
        speakBtn.textContent = '🔊';
        speakBtn.addEventListener('click', () => speakText(word.word || ''));
        header.append(title, phonetic, speakBtn);

        const body = document.createElement('div');
        body.className = 'vocab-card-body';
        body.append(
            createTextLine('vocab-meaning', 'Nghĩa:', word.meaning || ''),
            createTextLine('vocab-example', 'Ví dụ:', word.example_en || '')
        );

        const exampleVi = document.createElement('p');
        exampleVi.className = 'vocab-example-vi';
        exampleVi.textContent = word.example_vi || '';
        body.appendChild(exampleVi);

        if (word.memory_tip) {
            const tip = document.createElement('p');
            tip.className = 'vocab-tip';
            tip.textContent = `💡 ${word.memory_tip}`;
            body.appendChild(tip);
        }

        const footer = document.createElement('div');
        footer.className = 'vocab-card-footer';
        const markButton = document.createElement('button');
        markButton.className = `btn btn-sm ${isLearned ? 'btn-secondary' : 'btn-primary'}`;
        markButton.type = 'button';
        markButton.textContent = isLearned ? '✅ Đã nhớ' : '📝 Đánh dấu';
        markButton.addEventListener('click', () => toggleLearnedFromList(index));
        footer.appendChild(markButton);

        wordCard.append(header, body, footer);
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
    
    setOptionalImage(document.getElementById('quizImage'), getWordImagePath(question));
    
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
    
    setOptionalImage(document.getElementById('fillBlankImage'), getWordImagePath(question));
    
    document.getElementById('fillBlankHint').textContent = `${question.phonetic} - ${question.meaning}`;
    
    // Create sentence with blank
    const sentence = (question.example_en || '').replace(new RegExp(escapeRegExp(question.word || ''), 'gi'), '<span class="blank">______</span>');
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

        const header = document.createElement('div');
        header.className = 'search-result-header';
        const title = document.createElement('h3');
        title.textContent = word.word || '';
        const phonetic = document.createElement('span');
        phonetic.className = 'search-phonetic';
        phonetic.textContent = word.phonetic || '';
        const speakBtn = document.createElement('button');
        speakBtn.className = 'search-speak-btn';
        speakBtn.type = 'button';
        speakBtn.textContent = '🔊';
        speakBtn.addEventListener('click', () => speakText(word.word || ''));
        header.append(title, phonetic, speakBtn);

        const meaning = document.createElement('p');
        meaning.className = 'search-meaning';
        meaning.textContent = word.meaning || '';
        const example = document.createElement('p');
        example.className = 'search-example';
        example.textContent = word.example_en || '';
        const exampleVi = document.createElement('p');
        exampleVi.className = 'search-example-vi';
        exampleVi.textContent = word.example_vi || '';

        resultCard.append(header, meaning, example, exampleVi);
        resultsContainer.appendChild(resultCard);
    });
}

// ============================================
// REVIEW MODE
// ============================================

function showReviewStats() {
    const totalWords = vocabulary.length;
    const learned = vocabulary.filter(word => learnedWords.has(word.word)).length;
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
        const wordText = document.createElement('span');
        wordText.className = 'learned-word-text';
        wordText.textContent = `${word.word || ''} - ${word.meaning || ''}`;
        const speakBtn = document.createElement('button');
        speakBtn.className = 'btn btn-sm btn-secondary';
        speakBtn.type = 'button';
        speakBtn.textContent = '🔊';
        speakBtn.addEventListener('click', () => speakText(word.word || ''));
        wordItem.append(wordText, speakBtn);
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
// PERSONAL VOCABULARY
// ============================================

function initializePersonalVocabUI() {
    updatePersonalOptionLabel();
    hydrateDeepSeekKeyInput();

    const meta = getPersonalVocabMeta();
    const nameInput = document.getElementById('personalListName');
    if (nameInput && meta.name) nameInput.value = meta.name;

    const personalData = loadPersonalVocabularyData();
    if (personalData.vocabulary.length > 0) {
        setPersonalStatus(`Đã có ${personalData.vocabulary.length} từ trong list cá nhân. Chọn "Từ cá nhân" để học.`, 'success');
    }
}

function updatePersonalOptionLabel() {
    const option = document.querySelector(`#vocabListSelect option[value="${PERSONAL_VOCAB_VALUE}"]`);
    if (!option) return;

    const data = loadPersonalVocabularyData();
    const meta = getPersonalVocabMeta();
    option.textContent = data.vocabulary.length
        ? `⭐ ${meta.name || 'Từ cá nhân'} (${data.vocabulary.length})`
        : '⭐ Từ cá nhân';
}

function loadPersonalVocabularyData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.PERSONAL_VOCAB);
        if (!saved) return { vocabulary: [] };

        const parsed = JSON.parse(saved);
        const list = Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [];
        return { vocabulary: normalizePersonalVocabulary(list) };
    } catch (error) {
        console.error('Cannot load personal vocabulary:', error);
        return { vocabulary: [] };
    }
}

function getPersonalVocabMeta() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.PERSONAL_VOCAB_META);
        return saved ? JSON.parse(saved) : {};
    } catch (error) {
        return {};
    }
}

function savePersonalVocabularyData(words, name) {
    const normalized = normalizePersonalVocabulary(words);
    const meta = {
        name: String(name || 'Từ cá nhân của tôi').trim() || 'Từ cá nhân của tôi',
        updatedAt: new Date().toISOString(),
        count: normalized.length
    };

    localStorage.setItem(STORAGE_KEYS.PERSONAL_VOCAB, JSON.stringify({ vocabulary: normalized }));
    localStorage.setItem(STORAGE_KEYS.PERSONAL_VOCAB_META, JSON.stringify(meta));
    updatePersonalOptionLabel();
    return { vocabulary: normalized, meta };
}

function normalizePersonalVocabulary(words) {
    const seen = new Set();
    return (Array.isArray(words) ? words : [])
        .map((item, index) => normalizePersonalWord(item, index + 1))
        .filter(item => {
            if (!item.word) return false;
            const key = item.word.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .map((item, index) => ({ ...item, id: index + 1 }));
}

function normalizePersonalWord(item, id) {
    const word = cleanVocabText(item?.word || item?.term || item?.english || '');
    const meaning = cleanVocabText(item?.meaning || item?.definition_vi || item?.vietnamese || item?.definition || '');
    const exampleEn = cleanVocabText(item?.example_en || item?.example || item?.sentence || '');
    const exampleVi = cleanVocabText(item?.example_vi || item?.translation || '');

    return {
        id,
        word,
        phonetic: cleanVocabText(item?.phonetic || item?.ipa || ''),
        meaning: meaning || 'Chưa có nghĩa tiếng Việt',
        example_en: exampleEn || `I want to remember the word "${word}".`,
        example_vi: exampleVi || 'Tôi muốn ghi nhớ từ này.',
        category: cleanVocabText(item?.category || 'personal'),
        difficulty: cleanVocabText(item?.difficulty || 'intermediate'),
        memory_tip: cleanVocabText(item?.memory_tip || item?.tip || `Liên hệ "${word}" với một tình huống quen thuộc.`),
        image: cleanVocabText(item?.image || '')
    };
}

function cleanVocabText(value) {
    return String(value || '')
        .replace(/\s+/g, ' ')
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .trim()
        .slice(0, 700);
}

function togglePersonalPanel() {
    const body = document.getElementById('personalVocabBody');
    const button = document.getElementById('togglePersonalPanel');
    if (!body || !button) return;

    body.classList.toggle('hidden');
    button.textContent = body.classList.contains('hidden') ? 'Mở rộng' : 'Thu gọn';
}

async function hydrateDeepSeekKeyInput() {
    const input = document.getElementById('deepseekApiKey');
    if (!input) return;

    const saved = localStorage.getItem(STORAGE_KEYS.DEEPSEEK_API_KEY);
    if (!saved) {
        input.value = '';
        return;
    }

    try {
        input.value = await decryptLocalSecret(saved);
        setPersonalStatus('DeepSeek key đã được nạp từ trình duyệt này.', 'success');
    } catch (error) {
        input.value = '';
        setPersonalStatus('Không đọc được DeepSeek key đã lưu. Hãy nhập lại key.', 'warning');
    }
}

async function saveDeepSeekKeyFromInput() {
    const input = document.getElementById('deepseekApiKey');
    const key = input?.value.trim() || '';

    if (!key) {
        setPersonalStatus('Bạn chưa nhập DeepSeek API key.', 'warning');
        return;
    }

    if (!key.startsWith('sk-')) {
        setPersonalStatus('Key DeepSeek thường bắt đầu bằng "sk-". Hãy kiểm tra lại trước khi dùng.', 'warning');
    }

    try {
        const encrypted = await encryptLocalSecret(key);
        localStorage.setItem(STORAGE_KEYS.DEEPSEEK_API_KEY, encrypted);
        setPersonalStatus('Đã lưu DeepSeek key trong trình duyệt này.', 'success');
    } catch (error) {
        setPersonalStatus(`Không thể lưu key: ${error.message}`, 'error');
    }
}

function clearDeepSeekKey() {
    localStorage.removeItem(STORAGE_KEYS.DEEPSEEK_API_KEY);
    const input = document.getElementById('deepseekApiKey');
    if (input) input.value = '';
    setPersonalStatus('Đã xóa DeepSeek key khỏi trình duyệt này.', 'success');
}

async function getDeepSeekKey() {
    const typedKey = document.getElementById('deepseekApiKey')?.value.trim();
    if (typedKey) return typedKey;

    const saved = localStorage.getItem(STORAGE_KEYS.DEEPSEEK_API_KEY);
    return saved ? decryptLocalSecret(saved) : '';
}

async function handlePersonalFileUpload(event) {
    const files = Array.from(event.target.files || []);
    const hint = document.getElementById('personalFileHint');
    if (!files.length) {
        if (hint) hint.textContent = 'Chưa chọn file';
        return;
    }

    if (hint) hint.textContent = `${files.length} file đã chọn`;
    setPersonalStatus('Đang đọc file...', 'loading');

    try {
        const chunks = [];
        for (const file of files) {
            const text = await readFileAsText(file);
            chunks.push(`\n\n--- File: ${file.name} ---\n${text}`);
        }

        const textArea = document.getElementById('personalSourceText');
        if (textArea) {
            textArea.value = `${textArea.value.trim()}\n${chunks.join('\n')}`.trim();
        }
        setPersonalStatus(`Đã đọc ${files.length} file. Bạn có thể bấm "Tạo list bằng DeepSeek".`, 'success');
    } catch (error) {
        setPersonalStatus(`Không đọc được file: ${error.message}`, 'error');
    } finally {
        event.target.value = '';
    }
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('FileReader error'));
        reader.readAsText(file);
    });
}

async function loadPersonalRawUrl() {
    const input = document.getElementById('personalRawUrl');
    const url = input?.value.trim();

    if (!url) {
        setPersonalStatus('Hãy nhập raw URL trước.', 'warning');
        return;
    }

    setPersonalStatus('Đang tải raw URL...', 'loading');

    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const text = await response.text();
        const textArea = document.getElementById('personalSourceText');
        if (textArea) {
            textArea.value = `${textArea.value.trim()}\n\n--- URL: ${url} ---\n${text}`.trim();
        }
        setPersonalStatus(`Đã tải ${text.length.toLocaleString('vi-VN')} ký tự từ raw URL.`, 'success');
    } catch (error) {
        setPersonalStatus(`Không tải được URL. Raw host cần cho phép CORS. Lỗi: ${error.message}`, 'error');
    }
}

async function generatePersonalVocabulary() {
    const sourceText = document.getElementById('personalSourceText')?.value.trim() || '';
    const listName = document.getElementById('personalListName')?.value.trim() || 'Từ cá nhân của tôi';
    const wordLimit = clampNumber(parseInt(document.getElementById('personalWordLimit')?.value || '40'), 4, 200);

    if (!sourceText) {
        setPersonalStatus('Hãy dán nội dung, tải raw URL hoặc chọn file trước.', 'warning');
        return;
    }

    const directJson = tryParseVocabularyJson(sourceText);
    if (directJson.length > 0) {
        const saved = savePersonalVocabularyData(directJson.slice(0, wordLimit), listName);
        await loadVocabulary(PERSONAL_VOCAB_VALUE);
        document.getElementById('vocabListSelect').value = PERSONAL_VOCAB_VALUE;
        setPersonalStatus(`Đã nhập trực tiếp ${saved.vocabulary.length} từ từ JSON.`, 'success');
        return;
    }

    let apiKey = '';
    try {
        apiKey = await getDeepSeekKey();
    } catch (error) {
        setPersonalStatus('Không đọc được DeepSeek key đã lưu. Hãy nhập lại key.', 'error');
        return;
    }

    if (!apiKey) {
        setPersonalStatus('Hãy nhập DeepSeek API key trước khi tạo list tự động.', 'warning');
        return;
    }

    setPersonalStatus('DeepSeek đang phân tích và tạo list từ vựng...', 'loading');
    setPersonalControlsDisabled(true);

    try {
        const words = await requestDeepSeekVocabulary(apiKey, sourceText, wordLimit);
        const saved = savePersonalVocabularyData(words, listName);
        await saveDeepSeekKeyFromInput();
        document.getElementById('vocabListSelect').value = PERSONAL_VOCAB_VALUE;
        await loadVocabulary(PERSONAL_VOCAB_VALUE);
        setPersonalStatus(`Đã tạo ${saved.vocabulary.length} từ cho "${saved.meta.name}". Bạn có thể học/quiz ngay.`, 'success');
    } catch (error) {
        setPersonalStatus(`Không tạo được list: ${error.message}`, 'error');
    } finally {
        setPersonalControlsDisabled(false);
    }
}

async function requestDeepSeekVocabulary(apiKey, sourceText, wordLimit) {
    const compactSource = sourceText.slice(0, 24000);
    const body = {
        model: DEEPSEEK_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: [
                    'You convert study material into TOEIC-style vocabulary JSON.',
                    'Return only valid JSON with this exact shape: {"vocabulary":[...]}',
                    'Each item must have: word, phonetic, meaning, example_en, example_vi, category, difficulty, memory_tip.',
                    'Use Vietnamese for meaning, example_vi, and memory_tip.',
                    'Use concise practical TOEIC/business examples. No markdown. No HTML.'
                ].join(' ')
            },
            {
                role: 'user',
                content: `Create up to ${wordLimit} useful English vocabulary items from this material:\n\n${compactSource}`
            }
        ]
    };

    const response = await fetch(DEEPSEEK_CHAT_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const responseText = await response.text();
    if (!response.ok) {
        throw new Error(`DeepSeek HTTP ${response.status}: ${responseText.slice(0, 180)}`);
    }

    let data;
    try {
        data = JSON.parse(responseText);
    } catch (error) {
        throw new Error('DeepSeek trả về dữ liệu không phải JSON.');
    }

    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = parseDeepSeekVocabularyContent(content);
    const normalized = normalizePersonalVocabulary(parsed).slice(0, wordLimit);

    if (normalized.length < 4) {
        throw new Error('DeepSeek tạo dưới 4 từ, chưa đủ để quiz. Hãy đưa thêm nội dung nguồn.');
    }

    return normalized;
}

function parseDeepSeekVocabularyContent(content) {
    const cleaned = String(content || '')
        .replace(/^```(?:json)?/i, '')
        .replace(/```$/i, '')
        .trim();

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch (error) {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('Không tìm thấy JSON trong phản hồi DeepSeek.');
        parsed = JSON.parse(match[0]);
    }

    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.vocabulary)) return parsed.vocabulary;
    if (Array.isArray(parsed.words)) return parsed.words;
    throw new Error('JSON DeepSeek không có mảng vocabulary.');
}

function tryParseVocabularyJson(sourceText) {
    try {
        const parsed = JSON.parse(sourceText);
        if (Array.isArray(parsed)) return parsed;
        if (Array.isArray(parsed.vocabulary)) return parsed.vocabulary;
        if (Array.isArray(parsed.words)) return parsed.words;
    } catch (error) {
        return [];
    }
    return [];
}

async function exportPersonalVocabulary() {
    const data = loadPersonalVocabularyData();
    const meta = getPersonalVocabMeta();

    if (data.vocabulary.length === 0) {
        setPersonalStatus('Chưa có list cá nhân để xuất.', 'warning');
        return;
    }

    const payload = {
        vocabulary: data.vocabulary,
        meta,
        exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vvt-personal-vocab-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setPersonalStatus('Đã xuất list cá nhân thành file JSON.', 'success');
}

async function clearPersonalVocabulary() {
    if (!confirm('Bạn có chắc muốn xóa list từ vựng cá nhân khỏi trình duyệt này?')) return;

    localStorage.removeItem(STORAGE_KEYS.PERSONAL_VOCAB);
    localStorage.removeItem(STORAGE_KEYS.PERSONAL_VOCAB_META);
    updatePersonalOptionLabel();

    if (currentVocabList === PERSONAL_VOCAB_VALUE) {
        await loadVocabulary('vocab/vocab_1.json');
        document.getElementById('vocabListSelect').value = 'vocab/vocab_1.json';
    }

    setPersonalStatus('Đã xóa list từ vựng cá nhân.', 'success');
}

function setPersonalStatus(message, type = 'info') {
    const status = document.getElementById('personalVocabStatus');
    if (!status) return;

    status.textContent = message;
    status.className = `personal-status ${type}`;
}

function setPersonalControlsDisabled(disabled) {
    ['generatePersonalVocab', 'loadPersonalRawUrl', 'usePersonalVocab', 'exportPersonalVocab', 'clearPersonalVocab'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.disabled = disabled;
    });
}

async function encryptLocalSecret(secret) {
    if (!window.crypto?.subtle) {
        return `b64.${textToBase64(secret)}`;
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveLocalCryptoKey(salt);
    const cipherBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        new TextEncoder().encode(secret)
    );

    return `aesgcm.${bytesToBase64(salt)}.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(cipherBuffer))}`;
}

async function decryptLocalSecret(payload) {
    if (payload.startsWith('b64.')) {
        return base64ToText(payload.slice(4));
    }

    const [version, salt64, iv64, cipher64] = payload.split('.');
    if (version !== 'aesgcm' || !salt64 || !iv64 || !cipher64) {
        throw new Error('Unsupported encrypted payload');
    }

    const salt = base64ToBytes(salt64);
    const iv = base64ToBytes(iv64);
    const cipher = base64ToBytes(cipher64);
    const key = await deriveLocalCryptoKey(salt);
    const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    return new TextDecoder().decode(plainBuffer);
}

async function deriveLocalCryptoKey(salt) {
    const material = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(LOCAL_SECRET_PASSPHRASE),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
        material,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
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

function createTextLine(className, label, value) {
    const line = document.createElement('p');
    line.className = className;

    const strong = document.createElement('strong');
    strong.textContent = label ? `${label} ` : '';
    line.appendChild(strong);
    line.appendChild(document.createTextNode(value || ''));
    return line;
}

function showEmptyVocabularyState(message) {
    document.getElementById('word').textContent = 'Chưa có từ vựng';
    document.getElementById('phonetic').textContent = '';
    document.getElementById('meaning').textContent = message || '';
    document.getElementById('exampleEn').textContent = '';
    document.getElementById('exampleVi').textContent = '';
    document.getElementById('memoryTip').textContent = '';

    ['wordImage', 'wordImageBack'].forEach(id => {
        const image = document.getElementById(id);
        if (!image) return;
        image.removeAttribute('src');
        image.style.display = 'none';
    });

    document.querySelector('.card-front')?.classList.remove('hidden');
    document.querySelector('.card-back')?.classList.add('hidden');
}

function getWordImagePath(word) {
    if (word?.image) return word.image;
    if (!currentImagesFolder || !word?.word) return '';
    return `${currentImagesFolder}/${word.word}.png`;
}

function setOptionalImage(image, src) {
    if (!image) return;

    if (!src) {
        image.removeAttribute('src');
        image.style.display = 'none';
        return;
    }

    image.src = src;
    image.style.display = 'block';
}

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clampNumber(value, min, max) {
    if (Number.isNaN(value)) return min;
    return Math.max(min, Math.min(max, value));
}

function bytesToBase64(bytes) {
    let binary = '';
    bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
}

function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function textToBase64(text) {
    return bytesToBase64(new TextEncoder().encode(text));
}

function base64ToText(base64) {
    return new TextDecoder().decode(base64ToBytes(base64));
}

// ============================================
// GLOBAL FUNCTIONS (for onclick in HTML)
// ============================================

window.speakText = speakText;
window.toggleLearnedFromList = toggleLearnedFromList;

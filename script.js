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

// Vocabulary view variables
let selectedVocabularyLists = [];
let allVocabularyWords = [];
let currentPage = 1;
let wordsPerPage = 20;

// Settings
let speechRate = 0.8;
let darkMode = false;
let autoSpeak = false;
let detailedProgress = true;
let selectedVoice = null;
let voicesLoaded = false;

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
    NOTES: 'vocabularyNotes',
    SETTINGS: 'appSettings'
};

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Preload voices
    initializeVoices();
    
    // Show intro screen for 1.5 seconds (faster loading)
    setTimeout(() => {
        document.getElementById('introScreen').classList.add('fade-out');
        setTimeout(() => {
            document.getElementById('introScreen').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            document.getElementById('mainApp').classList.add('fade-in-app');
        }, 600);
    }, 1500);
    
    await loadVocabulary();
    loadProgress();
    loadSettings();
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

    // Vocabulary view
    document.getElementById('selectAllLists').addEventListener('click', selectAllVocabLists);
    document.getElementById('clearAllLists').addEventListener('click', clearAllVocabLists);
    document.getElementById('loadSelectedLists').addEventListener('click', loadSelectedVocabLists);
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
    document.getElementById('startPracticeFlashcard').addEventListener('click', startPracticeFromVocab('flashcard'));
    document.getElementById('startPracticeQuiz').addEventListener('click', startPracticeFromVocab('quiz'));
    document.getElementById('startPracticeTyping').addEventListener('click', startPracticeFromVocab('typing'));
    
    // Keyboard shortcuts toggle
    document.getElementById('shortcutsToggle').addEventListener('click', toggleShortcutsPanel);
    
    // Settings
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettings').addEventListener('click', closeSettings);
    document.getElementById('speechRate').addEventListener('input', updateSpeechRate);
    document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);
    document.getElementById('autoSpeakToggle').addEventListener('change', toggleAutoSpeak);
    document.getElementById('detailedProgressToggle').addEventListener('change', toggleDetailedProgress);
    document.getElementById('resetProgressBtn').addEventListener('click', resetProgress);
    document.getElementById('exportProgressBtn').addEventListener('click', exportProgress);
    document.getElementById('importProgressBtn').addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput').addEventListener('change', importProgress);
    
    // Close modal when clicking outside
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal') {
            closeSettings();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
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
        case 'vocabulary':
            // Không làm gì, chỉ hiển thị form chọn list
            break;
        case 'quiz':
            // Hiện form cài đặt quiz, không tự động bắt đầu
            document.querySelector('.quiz-type-selector').style.display = 'block';
            document.getElementById('quizContent').classList.add('hidden');
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
        
        // Auto speak if enabled
        if (autoSpeak) {
            speakWord();
        }
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
    speak(word);
}

function speak(text, rate = null) {
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate || speechRate;
    
    // Use selected voice if available
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    } else if (voicesLoaded) {
        // Try to find a good English voice
        const voices = speechSynthesis.getVoices();
        const englishVoice = voices.find(v => 
            v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))
        ) || voices.find(v => v.lang.startsWith('en'));
        
        if (englishVoice) {
            utterance.voice = englishVoice;
            selectedVoice = englishVoice;
        }
    }
    
    // Add visual feedback
    const speakBtn = document.getElementById('speakBtn');
    if (speakBtn) {
        speakBtn.textContent = '🔊 Đang phát...';
        speakBtn.disabled = true;
    }
    
    utterance.onend = () => {
        if (speakBtn) {
            speakBtn.textContent = '🔊 Phát âm';
            speakBtn.disabled = false;
        }
    };
    
    utterance.onerror = (e) => {
        console.error('Speech error:', e);
        if (speakBtn) {
            speakBtn.textContent = '🔊 Phát âm';
            speakBtn.disabled = false;
        }
        // Retry once if error
        if (e.error === 'network') {
            setTimeout(() => {
                speechSynthesis.speak(utterance);
            }, 500);
        }
    };
    
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
    speak(word);
}

function speakListeningWord(rate = 1) {
    const word = currentQuizWord.word;
    speak(word, rate);
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
    document.querySelector('.quiz-type-selector').style.display = 'block';
    document.getElementById('quizContent').classList.add('hidden');
    document.getElementById('quizOptions').innerHTML = '';
    
    // Reset về giá trị mặc định
    document.getElementById('quizTypeSelect').value = 'meaning';
    document.getElementById('quizListSelect').value = 'current';
    document.getElementById('quizWordCount').value = '10';
    document.getElementById('quizWordFilter').value = 'all';
    document.getElementById('autoNextToggle').checked = true;
    autoNextEnabled = true;
}


// Vocabulary View Functions
function selectAllVocabLists() {
    document.querySelectorAll('.vocab-checkbox').forEach(cb => cb.checked = true);
}

function clearAllVocabLists() {
    document.querySelectorAll('.vocab-checkbox').forEach(cb => cb.checked = false);
}

async function loadSelectedVocabLists() {
    const checkboxes = document.querySelectorAll('.vocab-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('Vui lòng chọn ít nhất một list!');
        return;
    }
    
    allVocabularyWords = [];
    selectedVocabularyLists = [];
    
    // Show loading
    document.getElementById('vocabularyList').innerHTML = '<p style="text-align: center; padding: 40px;">⏳ Đang tải từ vựng...</p>';
    
    try {
        for (const checkbox of checkboxes) {
            const listPath = checkbox.value;
            selectedVocabularyLists.push(listPath);
            
            const response = await fetch(listPath);
            const data = await response.json();
            
            // Thêm thông tin list vào mỗi từ
            const listNumber = listPath.match(/vocab_(\d+)\.json/)?.[1] || '?';
            data.vocabulary.forEach(word => {
                word.listNumber = listNumber;
                word.imagesFolder = `images/images_${listNumber}`;
            });
            
            allVocabularyWords = allVocabularyWords.concat(data.vocabulary);
        }
        
        // Hiển thị thống kê
        updateVocabularyStats();
        
        // Hiển thị trang đầu tiên
        currentPage = 1;
        displayVocabularyPage();
        
        // Hiển thị pagination và nút luyện tập
        document.getElementById('vocabularyPagination').style.display = 'flex';
        document.getElementById('practiceActions').style.display = 'flex';
        
    } catch (error) {
        console.error('Error loading vocabulary:', error);
        alert('Có lỗi khi tải từ vựng!');
    }
}

function updateVocabularyStats() {
    const total = allVocabularyWords.length;
    const learned = allVocabularyWords.filter(w => learnedWords.has(w.id)).length;
    const unlearned = total - learned;
    
    document.getElementById('totalWords').textContent = total;
    document.getElementById('learnedCount').textContent = learned;
    document.getElementById('unlearnedCount').textContent = unlearned;
    document.getElementById('vocabularyStats').style.display = 'block';
}

function displayVocabularyPage() {
    const startIndex = (currentPage - 1) * wordsPerPage;
    const endIndex = startIndex + wordsPerPage;
    const pageWords = allVocabularyWords.slice(startIndex, endIndex);
    
    const totalPages = Math.ceil(allVocabularyWords.length / wordsPerPage);
    
    // Update page info
    document.getElementById('pageInfo').textContent = `Trang ${currentPage} / ${totalPages}`;
    
    // Enable/disable buttons
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
    
    // Display words
    const listContainer = document.getElementById('vocabularyList');
    listContainer.innerHTML = pageWords.map(word => {
        const isLearned = learnedWords.has(word.id);
        const imagePath = word.image || `${word.imagesFolder}/${word.word}.png`;
        
        return `
            <div class="vocab-card ${isLearned ? 'learned' : ''}">
                <div class="vocab-card-header">
                    <span class="vocab-list-badge">List ${word.listNumber}</span>
                    ${isLearned ? '<span class="learned-badge">✓ Đã học</span>' : ''}
                </div>
                <img src="${imagePath}" alt="${word.word}" class="vocab-card-image" onerror="this.style.display='none'">
                <h3 class="vocab-card-word">${word.word}</h3>
                <p class="vocab-card-phonetic">${word.phonetic}</p>
                <p class="vocab-card-meaning">${word.meaning}</p>
                <div class="vocab-card-example">
                    <p class="example-en">${word.example_en}</p>
                    <p class="example-vi">${word.example_vi}</p>
                </div>
                <div class="vocab-card-tip">
                    💡 ${word.memory_tip}
                </div>
            </div>
        `;
    }).join('');
}

function changePage(direction) {
    const totalPages = Math.ceil(allVocabularyWords.length / wordsPerPage);
    currentPage += direction;
    
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    displayVocabularyPage();
    
    // Scroll to top
    document.getElementById('vocabularyList').scrollIntoView({ behavior: 'smooth' });
}

function startPracticeFromVocab(mode) {
    return function() {
        if (allVocabularyWords.length === 0) {
            alert('Chưa có từ vựng nào!');
            return;
        }
        
        // Set vocabulary to practice
        vocabulary = allVocabularyWords;
        currentIndex = 0;
        
        // Switch to practice mode
        switchMode(mode);
        
        // Start practice
        if (mode === 'flashcard') {
            showFlashcard();
        } else if (mode === 'typing') {
            startTypingPractice();
        }
        // Quiz sẽ hiển thị form cài đặt
    };
}


// Keyboard shortcuts
function toggleShortcutsPanel() {
    const panel = document.getElementById('shortcutsPanel');
    panel.classList.toggle('hidden');
}

function handleKeyboardShortcuts(e) {
    // Không xử lý phím tắt khi đang nhập text
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
    }
    
    const activeMode = document.querySelector('.mode-btn.active')?.dataset.mode;
    
    // Phím tắt cho Flashcard mode
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
    
    // Phím tắt cho Quiz mode
    if (activeMode === 'quiz') {
        const quizContent = document.getElementById('quizContent');
        if (!quizContent.classList.contains('hidden')) {
            switch(e.key) {
                case '1':
                case '2':
                case '3':
                case '4':
                    e.preventDefault();
                    const options = document.querySelectorAll('.quiz-option:not(.disabled)');
                    const index = parseInt(e.key) - 1;
                    if (options[index]) {
                        options[index].click();
                    }
                    break;
                case 'Enter':
                    e.preventDefault();
                    const nextBtn = document.getElementById('nextQuiz');
                    if (!nextBtn.classList.contains('hidden')) {
                        nextQuizQuestion();
                    }
                    break;
                case '\\':
                    e.preventDefault();
                    const speakBtn = document.getElementById('quizSpeakBtn');
                    if (speakBtn && speakBtn.offsetParent !== null) {
                        speakQuizWord();
                    }
                    break;
            }
        }
    }
    
    // Phím tắt cho Typing mode
    if (activeMode === 'typing') {
        switch(e.key) {
            case '\\':
                e.preventDefault();
                const word = currentTypingWord?.word;
                if (word) {
                    speak(word);
                }
                break;
        }
    }
    
    // Phím tắt chung - chuyển mode
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                switchMode('flashcard');
                break;
            case '2':
                e.preventDefault();
                switchMode('vocabulary');
                break;
            case '3':
                e.preventDefault();
                switchMode('quiz');
                break;
            case '4':
                e.preventDefault();
                switchMode('typing');
                break;
            case '5':
                e.preventDefault();
                switchMode('search');
                break;
            case '6':
                e.preventDefault();
                switchMode('review');
                break;
        }
    }
}


// Settings Functions
function loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
        const settings = JSON.parse(saved);
        speechRate = settings.speechRate || 0.8;
        darkMode = settings.darkMode || false;
        autoSpeak = settings.autoSpeak || false;
        detailedProgress = settings.detailedProgress !== undefined ? settings.detailedProgress : true;
        
        // Apply settings
        document.getElementById('speechRate').value = speechRate;
        document.getElementById('speechRateValue').textContent = speechRate + 'x';
        document.getElementById('darkModeToggle').checked = darkMode;
        document.getElementById('autoSpeakToggle').checked = autoSpeak;
        document.getElementById('detailedProgressToggle').checked = detailedProgress;
        
        if (darkMode) {
            document.body.classList.add('dark-mode');
        }
    }
}

function saveSettings() {
    const settings = {
        speechRate,
        darkMode,
        autoSpeak,
        detailedProgress
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
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
    saveSettings();
}

function toggleDarkMode(e) {
    darkMode = e.target.checked;
    document.body.classList.toggle('dark-mode', darkMode);
    saveSettings();
}

function toggleAutoSpeak(e) {
    autoSpeak = e.target.checked;
    saveSettings();
}

function toggleDetailedProgress(e) {
    detailedProgress = e.target.checked;
    updateProgress();
    saveSettings();
}

function resetProgress() {
    if (confirm('Bạn có chắc muốn xóa toàn bộ tiến độ học? Hành động này không thể hoàn tác!')) {
        learnedWords.clear();
        localStorage.removeItem(STORAGE_KEYS.LEARNED);
        localStorage.removeItem(STORAGE_KEYS.REVIEW_SCHEDULE);
        updateProgress();
        showFlashcard();
        alert('✅ Đã reset tiến độ học!');
    }
}

function exportProgress() {
    const data = {
        learnedWords: [...learnedWords],
        reviewSchedule: JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEW_SCHEDULE) || '{}'),
        settings: {
            speechRate,
            darkMode,
            autoSpeak,
            detailedProgress
        },
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toeic-vocab-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Đã xuất dữ liệu thành công!');
}

function importProgress(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            
            // Import learned words
            if (data.learnedWords) {
                learnedWords = new Set(data.learnedWords);
                saveProgress();
            }
            
            // Import review schedule
            if (data.reviewSchedule) {
                localStorage.setItem(STORAGE_KEYS.REVIEW_SCHEDULE, JSON.stringify(data.reviewSchedule));
            }
            
            // Import settings
            if (data.settings) {
                speechRate = data.settings.speechRate || 0.8;
                darkMode = data.settings.darkMode || false;
                autoSpeak = data.settings.autoSpeak || false;
                detailedProgress = data.settings.detailedProgress !== undefined ? data.settings.detailedProgress : true;
                saveSettings();
                loadSettings();
            }
            
            updateProgress();
            showFlashcard();
            alert('✅ Đã nhập dữ liệu thành công!');
            
        } catch (error) {
            alert('❌ Lỗi: File không hợp lệ!');
            console.error(error);
        }
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
}


// Voice initialization
function initializeVoices() {
    // Show loading indicator
    const loadingIndicator = document.getElementById('voiceLoading');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
    }
    
    // Load voices
    function loadVoices() {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            voicesLoaded = true;
            
            // Try to find best English voice
            selectedVoice = voices.find(v => 
                v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))
            ) || voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en'));
            
            console.log('Voices loaded:', voices.length);
            console.log('Selected voice:', selectedVoice?.name);
            
            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
            
            // Preload by speaking empty text
            if (selectedVoice) {
                const utterance = new SpeechSynthesisUtterance('');
                utterance.voice = selectedVoice;
                utterance.volume = 0;
                speechSynthesis.speak(utterance);
            }
        }
    }
    
    // Load immediately if available
    loadVoices();
    
    // Also listen for voiceschanged event (some browsers need this)
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Fallback: try loading after a delay
    setTimeout(loadVoices, 100);
    setTimeout(loadVoices, 500);
    setTimeout(loadVoices, 1000);
}

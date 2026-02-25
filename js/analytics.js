// ============================================
// GOOGLE ANALYTICS & TRACKING SYSTEM
// Theo dõi người dùng và hoạt động học tập
// ============================================

// Google Analytics 4 Configuration
const GA_MEASUREMENT_ID = 'G-755RB1KGKZ'; // VVT TOEIC Learning Website

// Khởi tạo Google Analytics
function initGoogleAnalytics() {
    // Thêm Google Analytics script
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(gaScript);
    
    // Khởi tạo gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        'send_page_view': true,
        'anonymize_ip': true, // Tuân thủ GDPR
        'cookie_flags': 'SameSite=None;Secure'
    });
    
    window.gtag = gtag;
    console.log('✅ Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
}

// ============================================
// CUSTOM TRACKING EVENTS
// ============================================

class AnalyticsTracker {
    constructor() {
        this.sessionStart = Date.now();
        this.studyTime = 0;
        this.wordsLearned = 0;
        this.quizzesTaken = 0;
        this.grammarTopicsViewed = 0;
        
        this.init();
    }
    
    init() {
        // Theo dõi thời gian học
        this.startTimeTracking();
        
        // Theo dõi khi người dùng rời trang
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
        });
        
        // Theo dõi visibility (khi chuyển tab)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseTimeTracking();
            } else {
                this.resumeTimeTracking();
            }
        });
    }
    
    // Theo dõi thời gian học
    startTimeTracking() {
        this.timeTrackingInterval = setInterval(() => {
            if (!document.hidden) {
                this.studyTime += 1; // Tăng mỗi giây
            }
        }, 1000);
    }
    
    pauseTimeTracking() {
        if (this.timeTrackingInterval) {
            clearInterval(this.timeTrackingInterval);
        }
    }
    
    resumeTimeTracking() {
        this.startTimeTracking();
    }
    
    // Track page view
    trackPageView(pageName) {
        if (window.gtag) {
            gtag('event', 'page_view', {
                'page_title': pageName,
                'page_location': window.location.href,
                'page_path': window.location.pathname
            });
        }
        console.log(`📊 Page View: ${pageName}`);
    }
    
    // Track từ vựng đã học
    trackWordLearned(word, listNumber) {
        this.wordsLearned++;
        
        if (window.gtag) {
            gtag('event', 'word_learned', {
                'event_category': 'Learning',
                'event_label': word,
                'value': listNumber
            });
        }
        
        console.log(`📚 Word Learned: ${word} (List ${listNumber})`);
    }
    
    // Track quiz hoàn thành
    trackQuizCompleted(quizType, score, totalQuestions, timeSpent) {
        this.quizzesTaken++;
        
        if (window.gtag) {
            gtag('event', 'quiz_completed', {
                'event_category': 'Quiz',
                'event_label': quizType,
                'quiz_score': score,
                'quiz_total': totalQuestions,
                'quiz_accuracy': Math.round((score / totalQuestions) * 100),
                'time_spent': timeSpent
            });
        }
        
        console.log(`🎯 Quiz Completed: ${quizType} - Score: ${score}/${totalQuestions}`);
    }
    
    // Track ngữ pháp đã xem
    trackGrammarTopicViewed(topicName) {
        this.grammarTopicsViewed++;
        
        if (window.gtag) {
            gtag('event', 'grammar_topic_viewed', {
                'event_category': 'Grammar',
                'event_label': topicName
            });
        }
        
        console.log(`📝 Grammar Topic Viewed: ${topicName}`);
    }
    
    // Track bài tập ngữ pháp
    trackGrammarExercise(topicName, score, total) {
        if (window.gtag) {
            gtag('event', 'grammar_exercise', {
                'event_category': 'Grammar',
                'event_label': topicName,
                'score': score,
                'total': total,
                'accuracy': Math.round((score / total) * 100)
            });
        }
        
        console.log(`✍️ Grammar Exercise: ${topicName} - ${score}/${total}`);
    }
    
    // Track Part TOEIC đã xem
    trackPartViewed(partNumber, topicName) {
        if (window.gtag) {
            gtag('event', 'part_viewed', {
                'event_category': 'TOEIC Parts',
                'event_label': `Part ${partNumber} - ${topicName}`
            });
        }
        
        console.log(`🎯 Part Viewed: Part ${partNumber} - ${topicName}`);
    }
    
    // Track donation button click
    trackDonationClick() {
        if (window.gtag) {
            gtag('event', 'donation_click', {
                'event_category': 'Engagement',
                'event_label': 'Donation Button'
            });
        }
        
        console.log(`💝 Donation Button Clicked`);
    }
    
    // Track search
    trackSearch(searchTerm, resultsCount) {
        if (window.gtag) {
            gtag('event', 'search', {
                'search_term': searchTerm,
                'results_count': resultsCount
            });
        }
        
        console.log(`🔍 Search: "${searchTerm}" - ${resultsCount} results`);
    }
    
    // Track session end
    trackSessionEnd() {
        const sessionDuration = Math.floor((Date.now() - this.sessionStart) / 1000);
        
        if (window.gtag) {
            gtag('event', 'session_end', {
                'event_category': 'Engagement',
                'session_duration': sessionDuration,
                'study_time': this.studyTime,
                'words_learned': this.wordsLearned,
                'quizzes_taken': this.quizzesTaken,
                'grammar_topics_viewed': this.grammarTopicsViewed
            });
        }
        
        console.log(`👋 Session End - Duration: ${sessionDuration}s, Study Time: ${this.studyTime}s`);
    }
    
    // Get session summary
    getSessionSummary() {
        return {
            sessionDuration: Math.floor((Date.now() - this.sessionStart) / 1000),
            studyTime: this.studyTime,
            wordsLearned: this.wordsLearned,
            quizzesTaken: this.quizzesTaken,
            grammarTopicsViewed: this.grammarTopicsViewed
        };
    }
}

// ============================================
// LOCAL STORAGE TRACKING (Backup)
// ============================================

class LocalAnalytics {
    constructor() {
        this.storageKey = 'vvt_analytics';
        this.data = this.loadData();
    }
    
    loadData() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            totalVisits: 0,
            totalStudyTime: 0,
            totalWordsLearned: 0,
            totalQuizzes: 0,
            lastVisit: null,
            firstVisit: Date.now()
        };
    }
    
    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }
    
    recordVisit() {
        this.data.totalVisits++;
        this.data.lastVisit = Date.now();
        this.saveData();
    }
    
    addStudyTime(seconds) {
        this.data.totalStudyTime += seconds;
        this.saveData();
    }
    
    addWordLearned() {
        this.data.totalWordsLearned++;
        this.saveData();
    }
    
    addQuiz() {
        this.data.totalQuizzes++;
        this.saveData();
    }
    
    getStats() {
        return {
            ...this.data,
            studyTimeFormatted: this.formatTime(this.data.totalStudyTime)
        };
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
}

// ============================================
// INITIALIZE
// ============================================

let analyticsTracker;
let localAnalytics;

document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo Google Analytics
    initGoogleAnalytics();
    
    // Khởi tạo trackers
    analyticsTracker = new AnalyticsTracker();
    localAnalytics = new LocalAnalytics();
    
    // Record visit
    localAnalytics.recordVisit();
    
    // Track page view
    const pageName = document.title;
    analyticsTracker.trackPageView(pageName);
    
    console.log('📊 Analytics initialized successfully!');
    console.log('🌐 Website:', 'https://vanity1412.github.io/English-Vocabulary-Learning/');
    console.log('📈 Measurement ID:', GA_MEASUREMENT_ID);
});

// Export để sử dụng trong các file khác
window.analyticsTracker = analyticsTracker;
window.localAnalytics = localAnalytics;

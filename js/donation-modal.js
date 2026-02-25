// ============================================
// DONATION MODAL SYSTEM
// Hiển thị QR code ủng hộ sau mỗi 10 phút học
// ============================================

class DonationModal {
    constructor() {
        this.studyStartTime = Date.now();
        this.lastShownTime = Date.now();
        this.intervalMinutes = 10; // Hiển thị sau mỗi 10 phút
        this.isShowing = false;
        
        this.init();
    }
    
    init() {
        this.createModal();
        this.startTracking();
    }
    
    createModal() {
        const modalHTML = `
            <div id="donationModal" class="donation-modal">
                <div class="donation-modal-content">
                    <button class="donation-close" onclick="donationModal.close()">&times;</button>
                    
                    <div class="donation-header">
                        <div class="donation-icon">💝</div>
                        <h2>Ủng Hộ Duy Trì Website</h2>
                        <p class="donation-subtitle">Cảm ơn bạn đã tin tưởng và sử dụng!</p>
                    </div>
                    
                    <div class="donation-body">
                        <div class="study-time-info">
                            <div class="time-badge">
                                <span class="time-icon">⏱️</span>
                                <span class="time-text">Bạn đã học được <strong id="studyTimeDisplay">10 phút</strong></span>
                            </div>
                            <p class="encouragement">Tuyệt vời! Hãy tiếp tục phát huy nhé! 🎉</p>
                        </div>
                        
                        <div class="qr-section">
                            <div class="qr-container">
                                <img src="images/qr_money.png" alt="QR Code Ủng Hộ" class="qr-image">
                                <div class="qr-label">Quét mã để ủng hộ</div>
                            </div>
                            
                            <div class="donation-info">
                                <div class="info-item">
                                    <span class="info-icon">🏦</span>
                                    <div class="info-text">
                                        <strong>Ngân hàng:</strong> Vietcombank
                                    </div>
                                </div>
                                <div class="info-item">
                                    <span class="info-icon">💳</span>
                                    <div class="info-text">
                                        <strong>STK:</strong> 1036788047
                                    </div>
                                </div>
                                <div class="info-item">
                                    <span class="info-icon">👤</span>
                                    <div class="info-text">
                                        <strong>Chủ TK:</strong> VU VAN THONG
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="donation-message">
                            <p>💖 Mỗi đóng góp của bạn giúp chúng tôi:</p>
                            <ul class="donation-benefits">
                                <li>✅ Duy trì và phát triển website</li>
                                <li>✅ Cập nhật nội dung mới thường xuyên</li>
                                <li>✅ Cải thiện trải nghiệm người dùng</li>
                                <li>✅ Thêm nhiều tính năng hữu ích</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="donation-footer">
                        <button class="btn-continue" onclick="donationModal.close()">
                            Tiếp Tục Học 📚
                        </button>
                        <p class="thank-you-text">Cảm ơn bạn rất nhiều! ❤️</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    startTracking() {
        // Kiểm tra mỗi phút
        setInterval(() => {
            this.checkAndShow();
        }, 60000); // 60 giây
    }
    
    checkAndShow() {
        if (this.isShowing) return;
        
        const now = Date.now();
        const minutesSinceLastShown = (now - this.lastShownTime) / 1000 / 60;
        
        if (minutesSinceLastShown >= this.intervalMinutes) {
            this.show();
        }
    }
    
    show() {
        if (this.isShowing) return;
        
        this.isShowing = true;
        const modal = document.getElementById('donationModal');
        
        // Tính thời gian đã học
        const totalMinutes = Math.floor((Date.now() - this.studyStartTime) / 1000 / 60);
        document.getElementById('studyTimeDisplay').textContent = `${totalMinutes} phút`;
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Phát âm thanh thông báo nhẹ nhàng (optional)
        this.playNotificationSound();
    }
    
    close() {
        const modal = document.getElementById('donationModal');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        this.isShowing = false;
        this.lastShownTime = Date.now();
    }
    
    playNotificationSound() {
        // Tạo âm thanh thông báo nhẹ nhàng
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            // Không làm gì nếu không hỗ trợ
        }
    }
    
    // Cho phép hiển thị thủ công (để test)
    forceShow() {
        this.show();
    }
}

// Khởi tạo khi trang load
let donationModal;
document.addEventListener('DOMContentLoaded', () => {
    donationModal = new DonationModal();
});

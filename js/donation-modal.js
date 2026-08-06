// ============================================
// DONATION MODAL SYSTEM
// Tự nhắc sau một khoảng thời gian học.
// Nếu người dùng bấm "Đã ủng hộ", popup sẽ không tự hiện nữa.
// ============================================

class DonationModal {
    constructor() {
        this.studyStartTime = Date.now();
        this.lastShownTime = Date.now();
        this.intervalMinutes = 10;
        this.autoPopupEnabled = true;
        this.supportedKey = 'vvt_donation_supported';
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
                                <span class="time-text">Bạn đã học được <strong id="studyTimeDisplay">0 phút</strong></span>
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
                        <div class="donation-actions">
                            <button class="btn-continue" onclick="donationModal.close()">
                                Tiếp tục học
                            </button>
                            <button class="btn-supported" onclick="donationModal.markSupported()">
                                Đã ủng hộ
                            </button>
                        </div>
                        <p class="thank-you-text">Cảm ơn bạn rất nhiều! ❤️</p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    startTracking() {
        // Vẫn tự nhắc sau mỗi intervalMinutes phút.
        // Nếu đã bấm "Đã ủng hộ", không tự hiện nữa.
        if (!this.autoPopupEnabled || this.hasSupported()) return;

        setInterval(() => {
            this.checkAndShow();
        }, 60000);
    }

    checkAndShow() {
        if (this.isShowing || this.hasSupported()) return;

        const now = Date.now();
        const minutesSinceLastShown = (now - this.lastShownTime) / 1000 / 60;

        if (minutesSinceLastShown >= this.intervalMinutes) {
            this.show({ manual: false });
        }
    }

    show(options = {}) {
        if (this.isShowing) return;
        if (!options.manual && this.hasSupported()) return;

        this.isShowing = true;
        const modal = document.getElementById('donationModal');
        if (!modal) return;

        const totalMinutes = Math.floor((Date.now() - this.studyStartTime) / 1000 / 60);
        const studyTimeDisplay = document.getElementById('studyTimeDisplay');
        if (studyTimeDisplay) studyTimeDisplay.textContent = `${totalMinutes} phút`;

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Không phát âm báo mặc định để tránh cắt mạch học/nghe.
        if (options.playSound) this.playNotificationSound();
    }

    close() {
        const modal = document.getElementById('donationModal');
        if (modal) modal.classList.remove('show');
        document.body.style.overflow = 'auto';

        this.isShowing = false;
        this.lastShownTime = Date.now();
    }

    hasSupported() {
        return localStorage.getItem(this.supportedKey) === '1';
    }

    markSupported() {
        localStorage.setItem(this.supportedKey, '1');
        this.close();
    }

    playNotificationSound() {
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
            // Không làm gì nếu trình duyệt không hỗ trợ.
        }
    }

    forceShow() {
        this.show({ manual: true });
    }
}

let donationModal;
document.addEventListener('DOMContentLoaded', () => {
    donationModal = new DonationModal();
});

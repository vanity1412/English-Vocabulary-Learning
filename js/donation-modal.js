// ============================================
// DONATION MODAL SYSTEM
// Reminder shown after a study interval.
// Pressing "Da ung ho" now asks for an admin support code before disabling auto popups.
// ============================================

class DonationModal {
    constructor() {
        this.studyStartTime = Date.now();
        this.lastShownTime = Date.now();
        this.intervalMinutes = 10;
        this.autoPopupEnabled = true;
        this.supportedKey = 'vvt_donation_supported';
        this.supportUnlockHash = 'qOTI0xkq5Nw41LA0881EvjYikfCnfG89KrkMPwnftAk=';
        this.supportUnlockSalt = 'vvt-donation-unlock-20260807';
        this.supportUnlockIterations = 150000;
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
                            <div class="donation-video-offer">
                                Ủng hộ admin sẽ được cung cấp video giải chi tiết ETS các năm - video Cô Thắm.
                            </div>
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
                        <div class="support-unlock hidden" id="supportUnlockBox">
                            <label for="supportUnlockCode">Liên hệ Zalo <a href="https://zalo.me/0968046024" target="_blank" rel="noopener">0968 046 024</a> để nhận mã xác nhận.</label>
                            <div class="support-unlock-row">
                                <input type="password" id="supportUnlockCode" placeholder="Nhập mã xác nhận" autocomplete="off">
                                <button type="button" onclick="donationModal.verifySupportCode()">Xác nhận</button>
                            </div>
                            <div class="support-unlock-status" id="supportUnlockStatus"></div>
                        </div>
                        <p class="thank-you-text">Cảm ơn bạn rất nhiều! ❤️</p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const unlockInput = document.getElementById('supportUnlockCode');
        if (unlockInput) {
            unlockInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.verifySupportCode();
                }
            });
        }
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
        this.showSupportUnlock();
    }

    showSupportUnlock() {
        const unlockBox = document.getElementById('supportUnlockBox');
        const status = document.getElementById('supportUnlockStatus');
        const input = document.getElementById('supportUnlockCode');

        if (unlockBox) unlockBox.classList.remove('hidden');
        if (status) {
            status.textContent = 'Nhập mã admin cung cấp để tắt popup ủng hộ vĩnh viễn trên trình duyệt này.';
            status.className = 'support-unlock-status';
        }
        if (input) input.focus();
    }

    async verifySupportCode() {
        const input = document.getElementById('supportUnlockCode');
        const status = document.getElementById('supportUnlockStatus');
        const code = input ? input.value.trim() : '';

        if (!code) {
            this.setUnlockStatus('Vui lòng nhập mã xác nhận.', 'error');
            return;
        }

        this.setUnlockStatus('Đang kiểm tra mã...', 'loading');

        try {
            const isValid = await this.checkSupportCode(code);
            if (!isValid) {
                this.setUnlockStatus('Mã chưa đúng. Vui lòng kiểm tra lại hoặc liên hệ Zalo admin.', 'error');
                return;
            }

            localStorage.setItem(this.supportedKey, '1');
            this.setUnlockStatus('Đã xác nhận ủng hộ. Popup sẽ không tự hiện lại trên trình duyệt này.', 'success');

            setTimeout(() => this.close(), 700);
        } catch (error) {
            this.setUnlockStatus('Trình duyệt không hỗ trợ kiểm tra mã an toàn. Hãy thử trình duyệt khác.', 'error');
        }
    }

    async checkSupportCode(code) {
        if (!window.crypto || !window.crypto.subtle) {
            throw new Error('WebCrypto is unavailable');
        }

        const encoder = new TextEncoder();
        const material = await crypto.subtle.importKey(
            'raw',
            encoder.encode(code),
            'PBKDF2',
            false,
            ['deriveBits']
        );
        const bits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                hash: 'SHA-256',
                salt: encoder.encode(this.supportUnlockSalt),
                iterations: this.supportUnlockIterations
            },
            material,
            256
        );
        const actualHash = this.bytesToBase64(new Uint8Array(bits));
        return this.safeCompare(actualHash, this.supportUnlockHash);
    }

    setUnlockStatus(message, type = '') {
        const status = document.getElementById('supportUnlockStatus');
        if (!status) return;

        status.textContent = message;
        status.className = `support-unlock-status ${type}`.trim();
    }

    bytesToBase64(bytes) {
        let binary = '';
        bytes.forEach(byte => {
            binary += String.fromCharCode(byte);
        });
        return btoa(binary);
    }

    safeCompare(a, b) {
        if (a.length !== b.length) return false;

        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
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

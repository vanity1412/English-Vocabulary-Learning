# 📊 Thông Tin Google Analytics - VVT TOEIC

## ✅ Đã Cấu Hình Thành Công!

### Thông tin luồng dữ liệu:
- **Tên luồng**: toeic
- **URL**: https://vanity1412.github.io/English-Vocabulary-Learning/
- **Mã luồng**: 13666382897
- **Measurement ID**: `G-755RB1KGKZ` ✅

## 🎯 Truy cập Google Analytics

### Dashboard chính:
🔗 https://analytics.google.com/

### Xem dữ liệu realtime:
1. Vào Google Analytics
2. Chọn property "VVT TOEIC Website"
3. Click **Reports > Realtime**
4. Bạn sẽ thấy người dùng đang online!

## 📈 Các báo cáo quan trọng

### 1. Realtime (Thời gian thực)
**Reports > Realtime**
- Xem ai đang online ngay bây giờ
- Trang nào đang được xem
- Nguồn truy cập từ đâu

### 2. Overview (Tổng quan)
**Reports > Life cycle > Acquisition > Overview**
- Tổng số người dùng
- Số phiên làm việc
- Thời gian trung bình
- Tỷ lệ thoát

### 3. Events (Sự kiện học tập)
**Reports > Life cycle > Engagement > Events**

Các events được tracking:
- ✅ `page_view` - Xem trang
- ✅ `word_learned` - Học từ mới
- ✅ `quiz_completed` - Hoàn thành quiz
- ✅ `grammar_topic_viewed` - Xem ngữ pháp
- ✅ `grammar_exercise` - Làm bài tập ngữ pháp
- ✅ `part_viewed` - Xem Part TOEIC
- ✅ `donation_click` - Click ủng hộ
- ✅ `search` - Tìm kiếm từ
- ✅ `session_end` - Kết thúc phiên học

### 4. Pages and Screens
**Reports > Life cycle > Engagement > Pages and screens**
- Trang nào được xem nhiều nhất
- Thời gian trung bình trên mỗi trang
- Tỷ lệ thoát của từng trang

### 5. User Attributes
**Reports > User > User attributes**
- Thiết bị (Desktop/Mobile/Tablet)
- Trình duyệt
- Hệ điều hành
- Vị trí địa lý

## 🎯 Tạo Custom Reports

### Report 1: Hiệu quả học tập
1. **Explore > Blank**
2. Thêm dimensions:
   - `Event name`
   - `Event label`
3. Thêm metrics:
   - `Event count`
   - `Total users`
4. Filter: `Event name` = `word_learned` hoặc `quiz_completed`

### Report 2: Từ vựng phổ biến
1. **Explore > Blank**
2. Dimensions: `Event label`
3. Metrics: `Event count`
4. Filter: `Event name` = `word_learned`
5. Sort by: `Event count` (descending)

### Report 3: Độ chính xác Quiz
1. **Explore > Blank**
2. Dimensions: `Event label` (quiz type)
3. Metrics: Custom metric `quiz_accuracy`
4. Filter: `Event name` = `quiz_completed`

## 📊 Thiết lập Goals (Mục tiêu)

### Goal 1: Học 10 từ
- Event: `word_learned`
- Condition: Count >= 10

### Goal 2: Hoàn thành Quiz
- Event: `quiz_completed`
- Condition: Any

### Goal 3: Xem 3 chủ đề ngữ pháp
- Event: `grammar_topic_viewed`
- Condition: Count >= 3

### Goal 4: Click Donation
- Event: `donation_click`
- Condition: Any

## 🔔 Thiết lập Alerts (Cảnh báo)

### Alert 1: Spike in traffic
- Condition: Daily users > 100
- Action: Email notification

### Alert 2: High bounce rate
- Condition: Bounce rate > 70%
- Action: Email notification

### Alert 3: Low engagement
- Condition: Average session duration < 1 minute
- Action: Email notification

## 📱 Google Analytics App

Tải app để xem thống kê trên điện thoại:
- **iOS**: https://apps.apple.com/app/google-analytics/id881599038
- **Android**: https://play.google.com/store/apps/details?id=com.google.android.apps.giant

## 🎨 Dashboard Nội Bộ

Xem thống kê cá nhân tại:
🔗 https://vanity1412.github.io/English-Vocabulary-Learning/stats.html

Thống kê bao gồm:
- 👥 Tổng lần truy cập
- ⏱️ Thời gian học
- 📚 Từ đã học
- 🎯 Quiz hoàn thành
- 🏆 Thành tích đạt được

## 🔍 Kiểm tra Analytics hoạt động

### Cách 1: Realtime
1. Mở website: https://vanity1412.github.io/English-Vocabulary-Learning/
2. Mở Google Analytics > Realtime
3. Bạn sẽ thấy mình đang online!

### Cách 2: Console
1. Mở website
2. Nhấn F12 (Developer Tools)
3. Vào tab Console
4. Bạn sẽ thấy:
   ```
   ✅ Google Analytics initialized with ID: G-755RB1KGKZ
   📊 Analytics initialized successfully!
   🌐 Website: https://vanity1412.github.io/English-Vocabulary-Learning/
   📈 Measurement ID: G-755RB1KGKZ
   ```

### Cách 3: Network Tab
1. Mở F12 > Network tab
2. Filter: `google-analytics` hoặc `gtag`
3. Reload trang
4. Bạn sẽ thấy requests đến Google Analytics

## 📊 Dữ liệu mẫu (sau 1 tuần)

### Ví dụ metrics:
- **Users**: 50-100 người
- **Sessions**: 150-300 phiên
- **Avg. session duration**: 5-10 phút
- **Words learned**: 500-1000 từ
- **Quizzes completed**: 50-100 quiz
- **Bounce rate**: 30-50%

## 🎯 KPIs quan trọng cần theo dõi

### Engagement (Tương tác)
- ✅ Average session duration > 5 phút
- ✅ Pages per session > 3 trang
- ✅ Bounce rate < 50%

### Learning (Học tập)
- ✅ Words learned per user > 10 từ
- ✅ Quiz completion rate > 70%
- ✅ Grammar topics viewed > 2 chủ đề

### Retention (Giữ chân)
- ✅ Returning users > 30%
- ✅ Daily active users tăng dần
- ✅ Average visits per user > 3 lần

## 🚀 Tips tối ưu hóa

### 1. Tăng engagement
- Thêm gamification (điểm, level)
- Tạo streak (chuỗi ngày học liên tục)
- Thêm leaderboard

### 2. Giảm bounce rate
- Cải thiện tốc độ load trang
- Thêm nội dung hấp dẫn ngay đầu
- Clear call-to-action

### 3. Tăng retention
- Email reminder (nếu có)
- Push notifications
- Thêm tính năng social (share progress)

## 📞 Hỗ trợ

Nếu cần hỗ trợ về Analytics:
- **Facebook**: https://www.facebook.com/thong.vu.871003
- **GitHub**: https://github.com/vanity1412
- **SĐT**: 0968 046 024

## 🎉 Chúc mừng!

Website của bạn đã sẵn sàng theo dõi người dùng!
Hãy kiểm tra Google Analytics thường xuyên để cải thiện trải nghiệm học tập! 📊✨

---

**Cập nhật lần cuối**: 2024
**Website**: https://vanity1412.github.io/English-Vocabulary-Learning/
**Analytics ID**: G-755RB1KGKZ

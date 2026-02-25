# Hướng Dẫn Setup Google Analytics cho Website

## 📊 Bước 1: Tạo tài khoản Google Analytics

1. Truy cập: https://analytics.google.com/
2. Đăng nhập bằng tài khoản Google của bạn
3. Click "Start measuring" hoặc "Bắt đầu đo lường"
4. Điền thông tin:
   - **Account name**: VVT TOEIC Learning
   - **Property name**: VVT TOEIC Website
   - **Reporting time zone**: (GMT+07:00) Bangkok, Hanoi, Jakarta
   - **Currency**: Vietnamese Dong (₫)

5. Click "Next" và chọn:
   - **Industry**: Education
   - **Business size**: Small
   - **How you plan to use Google Analytics**: Measure website performance

6. Chấp nhận Terms of Service

## 📊 Bước 2: Tạo Data Stream

1. Chọn platform: **Web**
2. Điền thông tin:
   - **Website URL**: https://vanity1412.github.io/ten-repo-cua-ban
   - **Stream name**: VVT TOEIC Website
3. Click "Create stream"

4. **LƯU LẠI MEASUREMENT ID**: 
   - Bạn sẽ thấy ID dạng: `G-XXXXXXXXXX`
   - Copy ID này

## 📊 Bước 3: Cập nhật code

1. Mở file `js/analytics.js`
2. Tìm dòng:
   ```javascript
   const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
   ```
3. Thay `G-XXXXXXXXXX` bằng Measurement ID của bạn
4. Ví dụ:
   ```javascript
   const GA_MEASUREMENT_ID = 'G-ABC123DEF456';
   ```

## 📊 Bước 4: Thêm script vào các trang HTML

Thêm dòng này vào **TRƯỚC thẻ `</body>`** trong TẤT CẢ các file HTML:

```html
<script src="js/analytics.js"></script>
```

### Các file cần thêm:
- ✅ index.html
- ✅ vocabulary.html
- ✅ grammar.html
- ✅ grammar-lesson.html
- ✅ parts.html
- ✅ parts/part-detail.html
- ✅ parts/topic-view.html

## 📊 Bước 5: Deploy lên GitHub Pages

1. Commit và push code lên GitHub
2. Vào Settings > Pages
3. Chọn branch: `main` hoặc `master`
4. Click Save
5. Website sẽ có URL: `https://vanity1412.github.io/ten-repo`

## 📊 Bước 6: Kiểm tra hoạt động

1. Truy cập website của bạn
2. Mở Console (F12) và xem có log: `📊 Analytics initialized`
3. Vào Google Analytics > Reports > Realtime
4. Bạn sẽ thấy mình đang online!

## 📊 Các chỉ số được theo dõi

### 1. **Tổng quan**
- Số người truy cập (Users)
- Số phiên làm việc (Sessions)
- Tỷ lệ thoát (Bounce Rate)
- Thời gian trung bình trên trang

### 2. **Hoạt động học tập**
- Số từ đã học (`word_learned`)
- Số quiz đã làm (`quiz_completed`)
- Điểm số quiz (`quiz_score`)
- Độ chính xác (`quiz_accuracy`)
- Thời gian học (`study_time`)

### 3. **Nội dung**
- Trang được xem nhiều nhất
- Chủ đề ngữ pháp phổ biến (`grammar_topic_viewed`)
- Part TOEIC được xem nhiều (`part_viewed`)
- Từ khóa tìm kiếm (`search`)

### 4. **Tương tác**
- Click nút donation (`donation_click`)
- Thời gian học trung bình
- Số từ học được mỗi phiên

## 📊 Xem báo cáo trong Google Analytics

### Realtime (Thời gian thực)
- **Reports > Realtime**: Xem ai đang online ngay bây giờ

### Overview (Tổng quan)
- **Reports > Life cycle > Acquisition > Overview**: Nguồn truy cập
- **Reports > Life cycle > Engagement > Overview**: Tương tác người dùng

### Events (Sự kiện)
- **Reports > Life cycle > Engagement > Events**: Xem tất cả events
  - `word_learned`: Từ đã học
  - `quiz_completed`: Quiz hoàn thành
  - `grammar_topic_viewed`: Ngữ pháp đã xem
  - `part_viewed`: Part TOEIC đã xem
  - `donation_click`: Click ủng hộ

### Custom Reports
Tạo báo cáo tùy chỉnh:
1. **Explore > Blank**
2. Thêm dimensions: `event_name`, `event_label`
3. Thêm metrics: `event_count`, `total_users`

## 📊 Thống kê nội bộ (LocalStorage)

Website cũng lưu thống kê cá nhân trong trình duyệt:
- Tổng số lần truy cập
- Tổng thời gian học
- Tổng số từ đã học
- Tổng số quiz đã làm

Xem trong Console:
```javascript
localAnalytics.getStats()
```

## 📊 Tips & Best Practices

### 1. **Bảo vệ quyền riêng tư**
- Analytics đã được cấu hình `anonymize_ip: true`
- Không thu thập thông tin cá nhân

### 2. **Theo dõi hiệu quả**
- Kiểm tra Realtime mỗi ngày
- Xem báo cáo hàng tuần
- Phân tích xu hướng hàng tháng

### 3. **Tối ưu hóa**
- Xem trang nào có bounce rate cao → Cải thiện nội dung
- Xem từ nào được học nhiều → Thêm từ tương tự
- Xem quiz nào khó → Điều chỉnh độ khó

### 4. **Mục tiêu**
Tạo Goals trong GA4:
- **Goal 1**: Học được 10 từ
- **Goal 2**: Hoàn thành 1 quiz
- **Goal 3**: Xem 3 chủ đề ngữ pháp
- **Goal 4**: Click donation

## 📊 Troubleshooting

### Không thấy dữ liệu?
1. Kiểm tra Measurement ID đúng chưa
2. Kiểm tra Console có lỗi không
3. Đợi 24-48h để dữ liệu xuất hiện đầy tiên
4. Kiểm tra AdBlocker có chặn không

### Dữ liệu không chính xác?
1. Xóa cache trình duyệt
2. Test ở chế độ Incognito
3. Kiểm tra múi giờ trong GA4

## 📊 Dashboard mẫu

Tạo dashboard tùy chỉnh:

### KPIs chính
- **Daily Active Users**: Người dùng hàng ngày
- **Average Study Time**: Thời gian học trung bình
- **Words Learned per User**: Từ học được/người
- **Quiz Completion Rate**: Tỷ lệ hoàn thành quiz

### Charts
- **Line Chart**: Người dùng theo thời gian
- **Bar Chart**: Top 10 từ được học nhiều nhất
- **Pie Chart**: Phân bố theo Part TOEIC
- **Table**: Chi tiết hoạt động học tập

## 📊 Liên hệ & Hỗ trợ

Nếu cần hỗ trợ:
- Facebook: https://www.facebook.com/thong.vu.871003
- GitHub: https://github.com/vanity1412
- SĐT: 0968 046 024

---

**Chúc bạn thành công với website học TOEIC! 🎉📚**

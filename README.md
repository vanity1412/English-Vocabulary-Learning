# 📚 English Vocabulary Learning App

Ứng dụng học từ vựng tiếng Anh với phương pháp **Spaced Repetition** và học theo ngữ cảnh.

## 🎯 Tính năng

### 1. **Flashcard Mode** 🎴
- Hiển thị từ tiếng Anh với phát âm chuẩn
- Click để xem nghĩa tiếng Việt và ví dụ
- Mẹo ghi nhớ dựa trên Memory Science
- Phát âm tự động bằng Web Speech API
- Đánh dấu từ đã học

### 2. **Quiz Mode** 🎯
- Trắc nghiệm 4 đáp án
- Random từ vựng từ JSON
- Hiển thị điểm số và kết quả ngay lập tức
- Đánh giá kết quả theo phần trăm

### 3. **Search Mode** 🔍
- Tìm kiếm nhanh từ tiếng Anh
- Hiển thị đầy đủ nghĩa, ví dụ và mẹo ghi nhớ
- Tìm kiếm theo cả từ và nghĩa

### 4. **Review Mode** 📅
- Lịch ôn tập theo Spaced Repetition
- Nhắc nhở từ cần ôn hôm nay
- Theo dõi số lần ôn tập

## 🧠 Phương pháp học Spaced Repetition

### Chu kỳ ôn tập tối ưu:
- **Ngày 1**: Học từ mới
- **Ngày 2**: Ôn lại lần 1 (sau 1 ngày)
- **Ngày 5**: Ôn lại lần 2 (sau 3 ngày)
- **Ngày 12**: Ôn lại lần 3 (sau 7 ngày)
- **Ngày 26**: Ôn lại lần 4 (sau 14 ngày)
- **Ngày 56**: Ôn lại lần 5 (sau 30 ngày)

### Lộ trình học 1200 từ trong 60 ngày:
- **Mỗi ngày học**: 20 từ mới
- **Mỗi ngày ôn**: 30-40 từ cũ
- **Tổng thời gian**: 30-45 phút/ngày

## 💡 Kỹ thuật ghi nhớ

### 1. **Context-based Learning** (Học theo ngữ cảnh)
Mỗi từ đều có:
- Ví dụ thực tế bằng tiếng Anh
- Dịch nghĩa tiếng Việt
- Ngữ cảnh sử dụng cụ thể

### 2. **Memory Tips** (Mẹo ghi nhớ)
- Phân tích từ gốc (word roots)
- Liên tưởng hình ảnh
- Câu chuyện ghi nhớ

### 3. **Categorization** (Phân nhóm)
Từ vựng được chia theo chủ đề:
- Business (Kinh doanh)
- Travel (Du lịch)
- Education (Giáo dục)
- Daily Life (Hàng ngày)

## 🚀 Cách sử dụng

1. Mở file `index.html` bằng trình duyệt
2. Chọn chế độ học phù hợp:
   - **Flashcard**: Học từ mới
   - **Quiz**: Kiểm tra kiến thức
   - **Search**: Tra cứu nhanh
   - **Review**: Ôn tập theo lịch

3. Tiến độ học tập được lưu tự động trong LocalStorage

## 📝 Cấu trúc dữ liệu JSON

```json
{
  "id": 1,
  "word": "accountant",
  "phonetic": "/əˈkaʊn.tənt/",
  "meaning": "kế toán - người chịu trách nhiệm về tiền trong doanh nghiệp",
  "example_en": "My accountant takes care of my taxes",
  "example_vi": "Kế toán của tôi lo liệu thuế của tôi",
  "category": "business",
  "difficulty": "intermediate",
  "memory_tip": "Account (tài khoản) + ant (người) = người quản lý tài khoản tiền bạc"
}
```

## 🎓 Tips học hiệu quả

1. **Học đều đặn**: 30 phút mỗi ngày tốt hơn 3 giờ cuối tuần
2. **Ôn đúng lịch**: Tuân thủ lịch ôn tập trong Review Mode
3. **Học theo ngữ cảnh**: Đọc kỹ ví dụ, không học thuộc lòng
4. **Thực hành Quiz**: Làm quiz để kiểm tra kiến thức
5. **Phát âm đúng**: Sử dụng nút phát âm để nghe chuẩn

## 🔧 Công nghệ sử dụng

- **HTML5**: Cấu trúc trang
- **CSS3**: Giao diện responsive, animations
- **Vanilla JavaScript**: Logic xử lý
- **LocalStorage**: Lưu trữ tiến độ
- **Web Speech API**: Phát âm từ vựng
- **JSON**: Cơ sở dữ liệu từ vựng

## 📱 Responsive Design

Ứng dụng hoạt động tốt trên:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🎨 Tùy chỉnh

### Thêm từ vựng mới:
Chỉnh sửa file `vocab.json` và thêm object mới theo format có sẵn.

### Thay đổi chu kỳ ôn tập:
Sửa mảng `spaced_repetition_intervals` trong `vocab.json`.

### Tùy chỉnh giao diện:
Chỉnh sửa file `style.css` theo ý muốn.

## 📊 Theo dõi tiến độ

- Thanh progress bar hiển thị % từ đã học
- Review Mode hiển thị lịch ôn tập chi tiết
- LocalStorage lưu trữ vĩnh viễn (trừ khi xóa cache)

## 🌟 Lợi ích của phương pháp này

1. **Hiệu quả cao**: Spaced Repetition tăng khả năng ghi nhớ lâu dài 200%
2. **Tiết kiệm thời gian**: Chỉ ôn khi cần, không lãng phí thời gian
3. **Học theo ngữ cảnh**: Nhớ từ qua cách dùng thực tế
4. **Tự động hóa**: Ứng dụng tự động nhắc nhở ôn tập
5. **Không cần internet**: Hoạt động hoàn toàn offline

---

**Chúc bạn học tốt! 🎉**

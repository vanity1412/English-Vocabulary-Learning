"""
Script tải ảnh từ Pexels API với API key
Tự động tạo keyword từ nghĩa tiếng Việt
Hỗ trợ nhiều file vocab_*.json -> images_*/
CHẾ ĐỘ XÁC NHẬN: Hiển thị ảnh trước khi tải để đảm bảo khớp với từ
"""

import json
import requests
import time
from pathlib import Path
import glob
import webbrowser
from urllib.parse import quote

# API key từ Pexels
PEXELS_API_KEY = "An1WDakf9z9h6dT34w1TjxXKXLlsAEKH5Cch8SCt0BO5Rb76wrbY6mOJ"
PEXELS_API = "https://api.pexels.com/v1/search"

def generate_keyword(word, meaning):
    """Tạo keyword tìm kiếm từ word và nghĩa tiếng Việt"""
    # Lấy nghĩa đầu tiên nếu có nhiều nghĩa
    if isinstance(meaning, list):
        meaning = meaning[0] if meaning else ""
    
    # Loại bỏ các ký tự đặc biệt và lấy từ khóa chính
    meaning = meaning.lower().strip()
    
    # Kết hợp word với nghĩa để tạo keyword tốt hơn
    keyword = f"{word} {meaning}"
    
    return keyword

def search_images_pexels(keyword, per_page=5):
    """Tìm kiếm ảnh từ Pexels API và trả về danh sách"""
    try:
        headers = {"Authorization": PEXELS_API_KEY}
        params = {
            "query": keyword,
            "per_page": per_page,
            "size": "medium"
        }
        
        response = requests.get(PEXELS_API, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return data.get('photos', [])
        else:
            print(f"LOI API {response.status_code}")
            return []
            
    except Exception as e:
        print(f"LOI: {e}")
        return []

def download_image_from_url(photo_url, output_path):
    """Tải ảnh từ URL"""
    try:
        img_response = requests.get(photo_url, timeout=10)
        if img_response.status_code == 200:
            with open(output_path, 'wb') as f:
                f.write(img_response.content)
            return True
        return False
    except Exception as e:
        print(f"LOI khi tai anh: {e}")
        return False

def download_image_pexels_interactive(word, meaning, output_path):
    """Tải ảnh với chế độ xác nhận - cho phép xem và chọn ảnh"""
    print(f"\n{'='*70}")
    print(f"TU: {word}")
    print(f"NGHIA: {meaning}")
    print(f"{'='*70}")
    
    # Tự động tạo nhiều keyword suggestions
    keyword_suggestions = generate_keyword(word, meaning)
    
    print("\nGOI Y KEYWORD:")
    for i, kw in enumerate(keyword_suggestions, 1):
        print(f"  {i}. {kw}")
    print(f"  c. Nhap keyword tuy chinh")
    
    # Cho phép chọn keyword hoặc nhập tùy chỉnh
    kw_choice = input("\nChon keyword (1-3/c, Enter = 1): ").strip().lower()
    
    if kw_choice == 'c':
        keyword = input("Nhap keyword: ").strip()
    elif kw_choice.isdigit() and 1 <= int(kw_choice) <= len(keyword_suggestions):
        keyword = keyword_suggestions[int(kw_choice) - 1]
    else:
        keyword = keyword_suggestions[0]  # Mặc định keyword đầu tiên
    
    while True:
        print(f"\n{'='*70}")
        print(f"Keyword: '{keyword}'")
        print(f"{'='*70}")
        print("Dang tim kiem anh...")
        
        photos = search_images_pexels(keyword, per_page=10)  # Tăng lên 10 ảnh
        
        if not photos:
            print("\n❌ KHONG TIM THAY ANH!")
            print("\nLUA CHON:")
            print("  1. Thu keyword khac tu goi y")
            print("  2. Nhap keyword moi")
            print("  3. Bo qua tu nay")
            
            choice = input("\nChon (1/2/3): ").strip()
            
            if choice == '1':
                print("\nGOI Y KEYWORD:")
                for i, kw in enumerate(keyword_suggestions, 1):
                    print(f"  {i}. {kw}")
                kw_num = input("Chon (1-3): ").strip()
                if kw_num.isdigit() and 1 <= int(kw_num) <= len(keyword_suggestions):
                    keyword = keyword_suggestions[int(kw_num) - 1]
                continue
            elif choice == '2':
                keyword = input("Nhap keyword moi: ").strip()
                if not keyword:
                    continue
                continue
            else:
                return False
        
        print(f"\n✓ Tim thay {len(photos)} anh")
        print("\nDang mo cac anh trong trinh duyet...")
        print("(Xem tat ca anh de chon anh phu hop nhat)\n")
        
        # Hiển thị danh sách ảnh
        for i, photo in enumerate(photos, 1):
            print(f"  [{i:2d}] {photo['url']}")
        
        # Mở 5 ảnh đầu tiên trong trình duyệt để xem
        for photo in photos[:5]:
            webbrowser.open(photo['url'])
            time.sleep(0.3)
        
        print(f"\n{'='*70}")
        print("LUA CHON:")
        print(f"  1-{len(photos)}: Chon anh thu (1-{len(photos)})")
        print("  a: Xem TAT CA anh trong trinh duyet")
        print("  n: Thu keyword khac")
        print("  c: Nhap keyword tuy chinh")
        print("  s: Bo qua tu nay")
        print(f"{'='*70}")
        
        choice = input("\nChon: ").strip().lower()
        
        if choice == 's':
            return False
        elif choice == 'n':
            print("\nGOI Y KEYWORD:")
            for i, kw in enumerate(keyword_suggestions, 1):
                print(f"  {i}. {kw}")
            kw_num = input("Chon (1-3): ").strip()
            if kw_num.isdigit() and 1 <= int(kw_num) <= len(keyword_suggestions):
                keyword = keyword_suggestions[int(kw_num) - 1]
            continue
        elif choice == 'c':
            keyword = input("Nhap keyword moi: ").strip()
            if not keyword:
                continue
            continue
        elif choice == 'a':
            print("\nDang mo tat ca anh...")
            for photo in photos:
                webbrowser.open(photo['url'])
                time.sleep(0.3)
            continue
        elif choice.isdigit() and 1 <= int(choice) <= len(photos):
            selected_photo = photos[int(choice) - 1]
            photo_url = selected_photo['src']['medium']
            
            print(f"\n⬇️  Dang tai anh {choice}...", end=" ")
            if download_image_from_url(photo_url, output_path):
                print("✅ THANH CONG!")
                print(f"📁 Luu tai: {output_path}")
                print(f"🔑 Keyword da dung: '{keyword}'")
                return True
            else:
                print("❌ THAT BAI!")
                retry = input("Thu lai? (y/n): ").strip().lower()
                if retry == 'y':
                    continue
                return False
        else:
            print("❌ Lua chon khong hop le!")
            continue

def process_vocab_file(vocab_file, interactive_mode=True):
    """Xử lý một file vocab và tải ảnh vào thư mục tương ứng"""
    vocab_path = Path(vocab_file)
    vocab_name = vocab_path.stem
    
    # Tạo tên thư mục images tương ứng
    if vocab_name.startswith('vocab_'):
        suffix = vocab_name.replace('vocab_', '')
        images_dir = Path(f'images_{suffix}')
    else:
        images_dir = Path('images')
    
    print("\n" + "="*70)
    print(f"XU LY FILE: {vocab_file}")
    print(f"THU MUC ANH: {images_dir}")
    print(f"CHE DO: {'XAC NHAN (Interactive)' if interactive_mode else 'TU DONG'}")
    print("="*70)
    
    # Đọc file vocab
    try:
        with open(vocab_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"LOI: Khong tim thay file {vocab_file}")
        return 0, 0
    except json.JSONDecodeError as e:
        print(f"LOI: File {vocab_file} khong dung dinh dang JSON - {e}")
        return 0, 0
    
    vocabulary = data.get('vocabulary', [])
    if not vocabulary:
        print("LOI: Khong co du lieu tu vung trong file")
        return 0, 0
    
    print(f"Tim thay {len(vocabulary)} tu vung\n")
    
    # Tạo thư mục images
    images_dir.mkdir(exist_ok=True)
    
    # Tải ảnh
    success_count = 0
    failed_words = []
    
    for i, word_data in enumerate(vocabulary, 1):
        word = word_data.get('word', '')
        meaning = word_data.get('meaning', '')
        
        if not word:
            print(f"[{i}/{len(vocabulary)}] BO QUA - Khong co tu")
            continue
        
        filename = word.replace("'", "").replace("-", "")
        output_path = images_dir / f"{filename}.png"
        
        if output_path.exists():
            print(f"[{i}/{len(vocabulary)}] '{word}' - DA CO ANH")
            success_count += 1
            continue
        
        print(f"\n[{i}/{len(vocabulary)}]")
        
        if interactive_mode:
            # Chế độ xác nhận - cho phép xem và chọn ảnh
            if download_image_pexels_interactive(word, meaning, output_path):
                success_count += 1
            else:
                failed_words.append(word)
        else:
            # Chế độ tự động - lấy ảnh đầu tiên
            keyword = generate_keyword(word, meaning)
            photos = search_images_pexels(keyword, per_page=1)
            
            if photos:
                photo_url = photos[0]['src']['medium']
                print(f"'{word}' (keyword: '{keyword}')... ", end="")
                if download_image_from_url(photo_url, output_path):
                    print("THANH CONG!")
                    success_count += 1
                else:
                    print("THAT BAI!")
                    failed_words.append(word)
            else:
                print(f"'{word}' - KHONG TIM THAY ANH")
                failed_words.append(word)
        
        time.sleep(1)
    
    # Tổng kết file này
    print(f"\n>>> File {vocab_file}: {success_count}/{len(vocabulary)} thanh cong")
    if failed_words:
        print(f"    That bai: {', '.join(failed_words)}")
    
    return success_count, len(vocabulary)

def main():
    print("="*70)
    print("TAI ANH TU PEXELS API - DAM BAO ANH KHOP VOI TU")
    print("="*70)
    print(f"API Key: {PEXELS_API_KEY[:20]}...")
    print()
    
    # Chọn chế độ
    print("CHE DO TAI ANH:")
    print("  1. CHE DO XAC NHAN (Interactive) - Xem va chon anh truoc khi tai")
    print("  2. CHE DO TU DONG - Tai anh dau tien tu dong")
    
    mode_choice = input("\nChon che do (1/2, mac dinh 1): ").strip()
    interactive_mode = mode_choice != '2'
    
    print()
    
    # Tìm tất cả file vocab_*.json
    vocab_files = sorted(glob.glob('vocab_*.json'))
    
    if not vocab_files:
        print("LOI: Khong tim thay file vocab_*.json nao")
        print("Vui long tao file vocab_1.json, vocab_2.json, ...")
        return
    
    print(f"Tim thay {len(vocab_files)} file vocab:")
    for vf in vocab_files:
        print(f"  - {vf}")
    
    # Xử lý từng file
    total_success = 0
    total_words = 0
    
    for vocab_file in vocab_files:
        success, total = process_vocab_file(vocab_file, interactive_mode)
        total_success += success
        total_words += total
    
    # Tổng kết cuối cùng
    print("\n" + "="*70)
    print("HOAN THANH TAT CA!")
    print("="*70)
    print(f"Tong ket: {total_success}/{total_words} anh tai thanh cong")
    print(f"So file xu ly: {len(vocab_files)}")
    print("\n" + "="*70)
    print("Anh chat luong cao tu Pexels - Dam bao khop voi tu vung")
    print("Cau truc: vocab_X.json -> images_X/")
    print("="*70)

if __name__ == "__main__":
    main()
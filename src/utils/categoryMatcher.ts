import { CategoryKey } from "../types";

interface KeywordMapping {
  category: CategoryKey;
  keywords: string[];
}

const KEYWORD_MAP: KeywordMapping[] = [
  {
    category: "Utilities",
    keywords: [
      "tiền điện", "điện", "tiền nước", "nước", "internet", "wifi", "truyền hình",
      "tiền mạng", "tiền rác", "phí quản lý", "dịch vụ", "utilities", "electric", "water"
    ]
  },
  {
    category: "Housing",
    keywords: [
      "thuê phòng", "thuê nhà", "tiền nhà", "tiền phòng", "sửa nhà", "nội thất",
      "phòng trọ", "đặt cọc", "chung cư", "housing", "rent", "bàn ghế", "tủ lạnh",
      "máy giặt", "máy lạnh", "điều hòa", "nhà ở"
    ]
  },
  {
    category: "Dating",
    keywords: [
      "ăn tối", "ăn trưa", "hẹn hò", "đi chơi", "xem phim", "cinema", "cgv", "lotte cinema",
      "cafe", "cà phê", "trà sữa", "haidilao", "pizza", "kichi", "bbq", "lẩu", "nướng", "dating",
      "ăn uống", "quán ăn", "nhà hàng", "bún", "phở", "cơm", "bánh mì", "trà trái cây"
    ]
  },
  {
    category: "Groceries",
    keywords: [
      "siêu thị", "chợ", "thịt", "rau", "củ", "quả", "sữa", "trứng", "lotte",
      "winmart", "coopmart", "bachhoaxanh", "bách hóa xanh", "groceries", "đồ ăn tươi",
      "mì gói", "gia vị", "dầu ăn", "thực phẩm"
    ]
  },
  {
    category: "Shopping",
    keywords: [
      "quần áo", "giày", "dép", "shopee", "tiki", "lazada", "mỹ phẩm", "son", "váy", "áo",
      "shopping", "mua sắm", "đồng hồ", "túi xách", "kính", "đồ gia dụng", "quần"
    ]
  },
  {
    category: "Entertainment",
    keywords: [
      "du lịch", "vé máy bay", "khách sạn", "resort", "chơi game", "concert", "quán bar",
      "karaoke", "entertainment", "giải trí", "vé xem", "netflix", "spotify", "gõ nhạc"
    ]
  },
  {
    category: "Transportation",
    keywords: [
      "xăng", "xe máy", "ô tô", "grab", "be", "gojek", "rửa xe", "gửi xe", "bảo dưỡng",
      "taxi", "transportation", "đi lại", "vé xe", "vé tàu", "cầu đường", "phí đỗ xe"
    ]
  },
  {
    category: "Health",
    keywords: [
      "thuốc", "nhà thuốc", "bệnh viện", "khám", "nha khoa", "thực phẩm chức năng",
      "gym", "health", "y tế", "sức khỏe", "khám bệnh", "vitamin", "thuốc tây"
    ]
  }
];

export function predictCategoryFromTitle(title: string): CategoryKey | null {
  if (!title || !title.trim()) return null;
  const lower = title.toLowerCase().trim();

  for (const item of KEYWORD_MAP) {
    for (const kw of item.keywords) {
      // Create a regex to match the keyword as a whole word or at least not inside another word
      // For Vietnamese, we might just use simple includes or word boundary
      // Note: \b doesn't work perfectly with unicode characters in JS, but for basic matching it's okay.
      // Alternatively, check if the keyword is a substring.
      // A simple split and includes check for single words, or just fallback to .includes
      
      // We will use standard includes since it works reasonably well for Vietnamese phrases
      if (lower.includes(kw)) {
        return item.category;
      }
    }
  }
  return null;
}

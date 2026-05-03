/**
 * クラス名を結合するユーティリティ
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

/**
 * 件数をカウント
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  if (count === 1) {
    return `1${singular}`;
  }
  return `${count}${plural || singular + "s"}`;
}

/**
 * IDを生成（簡易版）
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 受注番号を生成（ORD-YYYY-NNNN形式）
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD-${year}-${random}`;
}

/**
 * 請求書番号を生成（INV-YYYYMM-NNNN形式）
 */
export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV-${year}${month}-${random}`;
}

/**
 * 納品書番号を生成（DEL-YYYY-NNNN形式）
 */
export function generateDeliveryNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `DEL-${year}-${random}`;
}

/**
 * 仕入れ番号を生成（PUR-YYYY-NNNN形式）
 */
export function generatePurchaseNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `PUR-${year}-${random}`;
}

/**
 * 出荷番号を生成（SHP-YYYYMMDD-NNNN形式）
 */
export function generateShipmentNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `SHP-${year}${month}${day}-${random}`;
}

/**
 * 相対時間を取得（「2時間前」など）
 */
export function getRelativeTime(date: Date | string): string {
  try {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "今";
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 30) return `${diffDays}日前`;

    return formatDate(date);
  } catch (error) {
    console.warn(`Error calculating relative time: ${date}`, error);
    return "-";
  }
}

/**
 * オブジェクトをクエリ文字列に変換
 */
export function objectToQueryString(obj: Record<string, any>): string {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

/**
 * クエリ文字列をオブジェクトに変換
 */
export function queryStringToObject(query: string): Record<string, string> {
  const params = new URLSearchParams(query);
  const obj: Record<string, string> = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

/**
 * 日付をJP形式にフォーマット（YYYY年M月D日）
 */
export function formatDateJP(date: Date | string): string {
  try {
    const d = new Date(date);
    
    // 無効な日付をチェック
    if (isNaN(d.getTime())) {
      console.warn(`Invalid date: ${date}`);
      return "-";
    }
    
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}年${month}月${day}日`;
  } catch (error) {
    console.warn(`Error formatting date: ${date}`, error);
    return "-";
  }
}

/**
 * 通貨をフォーマット（¥1,234,567形式）
 * @param value - フォーマット対象の数値
 * @returns フォーマット済みの通貨文字列
 */
export function formatCurrency(
  value: number | string | null | undefined
): string {
  try {
    // nullまたはundefinedをチェック
    if (value === null || value === undefined) {
      return "¥0";
    }
    
    const num = typeof value === "string" ? parseInt(value, 10) : value;
    
    // 数値が有効か確認
    if (isNaN(num)) {
      console.warn(`Invalid number for currency formatting: ${value}`);
      return "¥0";
    }
    
    return `¥${num.toLocaleString("ja-JP")}`;
  } catch (error) {
    console.warn(`Error formatting currency: ${value}`, error);
    return "¥0";
  }
}

/**
 * 日付をYYYY-MM-DD形式にフォーマット
 */
export function formatDate(date: Date | string): string {
  try {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
      console.warn(`Invalid date: ${date}`);
      return "-";
    }
    
    return d.toISOString().split("T")[0];
  } catch (error) {
    console.warn(`Error formatting date: ${date}`, error);
    return "-";
  }
}

/**
 * 数値を3桁カンマ区切りに変換
 */
export function formatNumber(value: number | string | null | undefined): string {
  try {
    if (value === null || value === undefined) {
      return "0";
    }
    
    const num = typeof value === "string" ? parseInt(value, 10) : value;
    
    if (isNaN(num)) {
      console.warn(`Invalid number: ${value}`);
      return "0";
    }
    
    return num.toLocaleString("ja-JP");
  } catch (error) {
    console.warn(`Error formatting number: ${value}`, error);
    return "0";
  }
}

/**
 * 日付の差分日数を計算
 */
export function getDaysDifference(
  date1: Date | string,
  date2: Date | string
): number {
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      console.warn(`Invalid dates: ${date1}, ${date2}`);
      return 0;
    }
    
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.warn(`Error calculating days difference: ${date1}, ${date2}`, error);
    return 0;
  }
}

/**
 * 日付を比較（date1 > date2 なら true）
 */
export function isAfter(date1: Date | string, date2: Date | string): boolean {
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      console.warn(`Invalid dates: ${date1}, ${date2}`);
      return false;
    }
    
    return d1 > d2;
  } catch (error) {
    console.warn(`Error comparing dates: ${date1}, ${date2}`, error);
    return false;
  }
}

/**
 * 日付を比較（date1 < date2 なら true）
 */
export function isBefore(date1: Date | string, date2: Date | string): boolean {
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      console.warn(`Invalid dates: ${date1}, ${date2}`);
      return false;
    }
    
    return d1 < d2;
  } catch (error) {
    console.warn(`Error comparing dates: ${date1}, ${date2}`, error);
    return false;
  }
}

/**
 * 日付が今日か確認
 */
export function isToday(date: Date | string): boolean {
  try {
    const d = new Date(date);
    const today = new Date();
    
    if (isNaN(d.getTime())) {
      console.warn(`Invalid date: ${date}`);
      return false;
    }
    
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  } catch (error) {
    console.warn(`Error checking if today: ${date}`, error);
    return false;
  }
}
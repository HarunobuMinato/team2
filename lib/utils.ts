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
 * 請求書番号を生成
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
 * 相対時間を取得（「2時間前」など）
 */
export function getRelativeTime(date: Date): string {
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
 * 仕入れ番号を生成（PUR-YYYY-NNNN形式）
 */
export function generatePurchaseNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `PUR-${year}-${random}`;
}

/**
 * 日付をJP形式にフォーマット（YYYY年M月D日）
 */
export function formatDateJP(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}年${month}月${day}日`;
}

/**
 * 通貨をフォーマット
 */
export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseInt(value) : value;
  return `¥${num.toLocaleString('ja-JP')}`;
}

/**
 * 日付をYYYY-MM-DD形式にフォーマット
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * 受注番号を生成（既存）
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ORD-${year}-${random}`;
}

/**
 * 納品書番号を生成（既存）
 */
export function generateDeliveryNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `DEL-${year}-${random}`;
}



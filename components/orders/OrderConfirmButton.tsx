export function OrderConfirmButton({
  orderId,
  status,
  onConfirm,
}: OrderConfirmButtonProps) {
  const { confirmOrder, loading } = useOrderConfirm();

  if (status !== 'order_pending') {
    return null;
  }

  const handleConfirm = async () => {
    const result = await confirmOrder(orderId);
    if (result.success) {
      alert(result.data.message);
      window.location.reload();
      onConfirm?.();
    } else {
      alert(`エラー: ${result.error}`);
    }
  };

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
    >
      {loading ? '処理中...' : '受注を承認'}
    </button>
  );
}
export enum UserRole {
  ADMIN = 'Admin',
  USER = 'User',
  SHIPPER = 'Shipper',
}

export enum PaymentMethodEnum {
  CREDIT = 'Thẻ tín dụng / thẻ ghi nợ',
  PAYPAL = 'Paypal',
  MOMO = 'Momo',
  COD = 'Thanh toán khi nhận hàng',
  ZALOPAY = 'ZaloPay',
}

export enum PaymentStatusEnum {
  PENDING = 'Đang chờ thanh toán',
  COMPLETED = 'Đã thanh toán',
  FAILED = 'Thanh toán không thành công',
}

export enum SortBy {
  PRICE = 'price',
  CREATED_AT = 'created_at',
  VIEW = 'view',
  SOLD = 'sold',
}

export enum Order {
  ASC = 'asc',
  DESC = 'desc',
}

export enum Status {
  InCart = -1, // Sản phẩm đang trong giỏ hàng
  AllProducts = 0, // Tất cả sản phẩm
  WaitingForConfirmation = 1, // Sản phẩm đang đợi xác nhận từ chủ shop
  Picking = 2, // Sản phẩm đang được lấy hàng
  Shipping = 3, // Sản phẩm đang vận chuyển
  Delivered = 4, // Sản phẩm đã được giao
  Canceled = 5, // Sản phẩm đã bị hủy
}

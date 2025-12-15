// 車両情報
export interface Vehicle {
  id: string;
  orderId: string;
  vehicleName: string;
  maker?: string;
  model?: string;
  year?: number;
  mileage?: number;
  inspectionDate?: Date;
  color?: string;
  chassisNumber?: string;
  registrationNumber?: string;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
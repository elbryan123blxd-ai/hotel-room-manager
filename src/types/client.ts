export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  assignedRoomId: string | null;
  checkIn: string | null;
  checkOut: string | null;
  notes: string;
}

import { AdminOrderView } from "@/components/admin/admin-order-view";

export const metadata = { title: "Order details" };

export default function AdminOrderPage({ params }: { params: { id: string } }) {
  return <AdminOrderView id={params.id} />;
}

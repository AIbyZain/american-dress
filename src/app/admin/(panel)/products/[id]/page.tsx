import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Edit product" };

export default function EditProductPage({ params }: { params: { id: string } }) {
  return <ProductForm productId={params.id} />;
}

import AppLayout from "@/components/AppLayout";
import ContentDetailPage from "@/components/ContentDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppLayout>
      <ContentDetailPage id={id} />
    </AppLayout>
  );
}
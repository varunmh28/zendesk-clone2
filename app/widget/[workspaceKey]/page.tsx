import { WidgetContainer } from "@/components/widget/widget-container";

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ workspaceKey: string }>;
}) {
  const { workspaceKey } = await params;

  return (
    <main className="h-screen w-screen overflow-hidden bg-transparent flex flex-col">
      <WidgetContainer workspaceKey={workspaceKey} />
    </main>
  );
}
export default async function WidgetPage({
  params,
}: {
  params: Promise<{ workspaceKey: string }>;
}) {
  const { workspaceKey } = await params;
  return (
    <div className="flex items-center justify-center h-screen text-muted-foreground text-sm">
      Widget for workspace {workspaceKey} — Phase 2
    </div>
  );
}
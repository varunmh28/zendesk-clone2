import { TaskChooseOrganization } from "@clerk/nextjs";

export default function ChooseOrganizationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <TaskChooseOrganization redirectUrlComplete="/dashboard" />
    </div>
  );
}

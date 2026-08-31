"use client";

import { InboxView } from "@/components/inbox/inbox-view";

interface InboxClientPageProps {
  orgId: string;
  slug: string;
}

export function InboxClientPage({ orgId, slug }: InboxClientPageProps) {
  return <InboxView orgId={orgId} />;
}

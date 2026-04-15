import { notFound } from "next/navigation";
import { LeadDetail } from "@/components/leads/lead-detail";
import { getLeadById } from "@/lib/search/leads";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  return (
    <main>
      <LeadDetail lead={lead} />
    </main>
  );
}

import { LiveContent } from "@/components/live/LiveContent";

export const dynamic = "force-dynamic";

export default async function LivePage({
  params,
}: {
  params: Promise<{ teacherId: string }>;
}) {
  const { teacherId } = await params;
  return <LiveContent teacherId={teacherId} />;
}

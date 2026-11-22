import { Suspense } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import MissionBrief from "@/components/MissionBrief";
import { MISSION_IDS, getMission } from "@/data/missions";

type Params = Promise<{ jobId: string }>;

export function generateStaticParams() {
  return MISSION_IDS.map((jobId) => ({ jobId }));
}

export default function MissionBriefPage({ params }: { params: Params }) {
  return (
    <>
      <Header variant="mission" />
      <Suspense fallback={<main className="min-h-[80vh]" />}>
        <MissionBriefLoader params={params} />
      </Suspense>
    </>
  );
}

async function MissionBriefLoader({ params }: { params: Params }) {
  const { jobId } = await params;
  const mission = getMission(jobId);
  if (!mission) notFound();
  return <MissionBrief mission={mission} />;
}

import { Suspense } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import MissionPlay from "@/components/MissionPlay";
import { MISSION_IDS, getMission } from "@/data/missions";

type Params = Promise<{ jobId: string }>;

export function generateStaticParams() {
  return MISSION_IDS.map((jobId) => ({ jobId }));
}

export default function MissionPlayPage({ params }: { params: Params }) {
  return (
    <>
      <Header variant="mission" />
      <Suspense fallback={<main className="min-h-[80vh]" />}>
        <MissionPlayLoader params={params} />
      </Suspense>
    </>
  );
}

async function MissionPlayLoader({ params }: { params: Params }) {
  const { jobId } = await params;
  const mission = getMission(jobId);
  if (!mission) notFound();
  return <MissionPlay mission={mission} />;
}

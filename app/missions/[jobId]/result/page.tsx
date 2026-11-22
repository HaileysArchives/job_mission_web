import { Suspense } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import MissionResult from "@/components/MissionResult";
import { MISSION_IDS, getMission } from "@/data/missions";

type Params = Promise<{ jobId: string }>;

export function generateStaticParams() {
  return MISSION_IDS.map((jobId) => ({ jobId }));
}

export default function MissionResultPage({ params }: { params: Params }) {
  return (
    <>
      <Header variant="mission" />
      <Suspense fallback={<main className="min-h-[80vh]" />}>
        <MissionResultLoader params={params} />
      </Suspense>
    </>
  );
}

async function MissionResultLoader({ params }: { params: Params }) {
  const { jobId } = await params;
  const mission = getMission(jobId);
  if (!mission) notFound();
  return <MissionResult mission={mission} />;
}

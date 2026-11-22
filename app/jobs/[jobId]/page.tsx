import { Suspense } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import JobDetailView from "@/components/JobDetailView";
import { JOB_IDS, getJob } from "@/data/jobs";

type Params = Promise<{ jobId: string }>;

export function generateStaticParams() {
  return JOB_IDS.map((jobId) => ({ jobId }));
}

// 헤더는 URL과 무관한 공통 셸, params 읽기는 Suspense 안쪽에서 한다 (Next 16 partialPrefetching 권장 구조).
export default function JobDetailPage({ params }: { params: Params }) {
  return (
    <>
      <Header variant="job" />
      <Suspense fallback={<main className="min-h-[80vh]" />}>
        <JobDetail params={params} />
      </Suspense>
    </>
  );
}

async function JobDetail({ params }: { params: Params }) {
  const { jobId } = await params;
  const job = getJob(jobId);
  if (!job) notFound();
  return <JobDetailView job={job} />;
}

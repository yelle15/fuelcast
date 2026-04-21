import PredictionConfidenceDistribution from "@/components/prediction-confidence-distribution";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full flex-col items-center justify-center py-32 px-16">
        <PredictionConfidenceDistribution />
      </main>
    </div>
  );
}

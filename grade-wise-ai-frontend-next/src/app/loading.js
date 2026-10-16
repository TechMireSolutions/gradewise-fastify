import LoadingSpinner from "@/components/ui/LoadingSpinner.jsx";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" color="blue" />
    </div>
  );
}


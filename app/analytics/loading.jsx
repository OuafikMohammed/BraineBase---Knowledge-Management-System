import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <Skeleton className="h-12 w-64 mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>

      <Skeleton className="h-8 w-48 mt-8" />
      <Skeleton className="h-[400px] w-full rounded-lg" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Skeleton className="h-[300px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg" />
      </div>

      <Skeleton className="h-8 w-48 mt-8" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton"
import Navbar from "@/components/navbar"

export default function Loading() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center mb-8">
          <Skeleton className="h-10 w-10 mr-2" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64">
            <Skeleton className="h-10 w-full mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>

          <div className="flex-grow">
            <Skeleton className="h-10 w-full mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

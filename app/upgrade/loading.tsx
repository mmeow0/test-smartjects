import { Skeleton } from "@/components/ui/skeleton"

export default function UpgradeLoading() {
  return (
    <div className="container max-w-6xl py-12">
      <div className="text-center mb-12">
        <Skeleton className="h-10 w-[300px] mx-auto mb-4" />
        <Skeleton className="h-6 w-[500px] mx-auto" />
      </div>

      <div className="flex justify-center mb-8">
        <Skeleton className="h-10 w-[200px]" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-8 w-[150px] mb-2" />
          <Skeleton className="h-6 w-[200px] mb-4" />
          <Skeleton className="h-10 w-[100px] mb-6" />

          <div className="space-y-3">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-2" />
                  <Skeleton className="h-5 w-[200px]" />
                </div>
              ))}
          </div>

          <Skeleton className="h-10 w-full mt-6" />
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-8 w-[150px] mb-2" />
          <Skeleton className="h-6 w-[200px] mb-4" />
          <Skeleton className="h-10 w-[100px] mb-6" />

          <div className="space-y-3">
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-2" />
                  <Skeleton className="h-5 w-[200px]" />
                </div>
              ))}
          </div>

          <Skeleton className="h-10 w-full mt-6" />
        </div>
      </div>

      <div className="mt-12 text-center">
        <Skeleton className="h-8 w-[250px] mx-auto mb-4" />
        <div className="max-w-3xl mx-auto space-y-6">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-[200px] mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%] mt-1" />
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

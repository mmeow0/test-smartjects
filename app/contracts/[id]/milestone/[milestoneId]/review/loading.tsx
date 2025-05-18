import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function MilestoneReviewLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Skeleton className="h-10 w-20 mr-4" />
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-6 w-32" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>

              <Skeleton className="h-px w-full" />

              <div>
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>

              <Skeleton className="h-px w-full" />

              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 mr-3 rounded-md" />
                        <div>
                          <Skeleton className="h-5 w-48 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              </div>

              <Skeleton className="h-px w-full" />

              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="flex space-x-4 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                      <Skeleton className="h-10 w-10 mb-1 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-[150px] w-full rounded-md" />
              </div>
            </CardContent>
            <div className="p-6 flex justify-between">
              <Skeleton className="h-10 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2 rounded-sm" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}

              <Skeleton className="h-px w-full" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-40 mb-2" />
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-2 w-2 mr-2 rounded-full" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ContractModifyLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Skeleton className="h-10 w-24 mr-4" />
        <div className="flex-1">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Contract Modification Request</CardTitle>
          <CardDescription>Submit a request to modify the terms of your contract.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-40 w-full" />
            <div className="flex justify-end gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

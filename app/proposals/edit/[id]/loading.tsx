export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse mr-4"></div>
          <div>
            <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
        <div className="h-8 w-full bg-gray-200 rounded-md animate-pulse mb-8"></div>
        <div className="h-96 w-full bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    </div>
  )
}

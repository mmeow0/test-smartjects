export function CompanyLogos() {
  return (
    <div className="py-8 border-y">
      <p className="text-center text-sm text-muted-foreground mb-6">
        Trusted by innovative companies and research institutions
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {/* Placeholder logos */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-muted rounded-md flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Company {i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

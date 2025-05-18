import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <div className="py-12 md:py-24 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">Innovations direct delivery<br/> from research to business</h1>
      <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
        Smartjects connects cutting-edge AI research with businesses and providers to create real-world implementations.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" asChild>
          <Link href="/hub">Explore Smartjects</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/auth/register">Join the Platform</Link>
        </Button>
      </div>
    </div>
  )
}

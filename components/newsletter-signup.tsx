import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function NewsletterSignup() {
  return (
    <Card className="my-12">
      <CardHeader className="text-center">
        <CardTitle>Stay Updated</CardTitle>
        <CardDescription>Subscribe to our newsletter for the latest AI research and smartject updates</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <Input type="email" placeholder="Enter your email" className="flex-1" />
          <Button type="submit">Subscribe</Button>
        </form>
      </CardContent>
    </Card>
  )
}

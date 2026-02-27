import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Ropero</CardTitle>
          <CardDescription className="text-lg">
            Your Smart Wardrobe
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-center text-muted-foreground">
            Manage your wardrobe, build outfits, log what you wear, and pack smart for trips.
          </p>
          <div className="flex flex-col gap-2">
            <Button size="lg" className="w-full">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="w-full">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

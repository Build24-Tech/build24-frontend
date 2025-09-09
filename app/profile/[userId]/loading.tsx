export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="bg-muted rounded-lg p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-muted-foreground/20 rounded-full"></div>
              <div className="w-48 h-6 bg-muted-foreground/20 rounded"></div>
              <div className="w-32 h-4 bg-muted-foreground/20 rounded"></div>
            </div>
            <div className="mt-8 space-y-3">
              <div className="w-full h-4 bg-muted-foreground/20 rounded"></div>
              <div className="w-3/4 h-4 bg-muted-foreground/20 rounded"></div>
              <div className="w-1/2 h-4 bg-muted-foreground/20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

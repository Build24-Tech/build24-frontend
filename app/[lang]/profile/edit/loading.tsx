export default function ProfileEditLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="bg-muted rounded-lg p-8">
            <div className="w-48 h-6 bg-muted-foreground/20 rounded mb-4"></div>
            <div className="space-y-4">
              <div className="w-full h-10 bg-muted-foreground/20 rounded"></div>
              <div className="w-full h-20 bg-muted-foreground/20 rounded"></div>
              <div className="w-full h-10 bg-muted-foreground/20 rounded"></div>
              <div className="w-full h-10 bg-muted-foreground/20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

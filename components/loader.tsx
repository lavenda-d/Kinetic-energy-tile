export function Loader() {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">Loading 3D scene...</p>
      </div>
    </div>
  )
}

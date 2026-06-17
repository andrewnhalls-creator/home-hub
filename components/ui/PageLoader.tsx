export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-terracotta border-t-transparent" aria-label="Cargando" role="status" />
    </div>
  );
}

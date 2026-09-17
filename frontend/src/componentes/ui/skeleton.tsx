import { cn } from "@/utilitarios/cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-muted/80", className)}
      {...props}
    />
  );
}

export { Skeleton };

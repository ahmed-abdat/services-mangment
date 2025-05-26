interface CardGridProps {
  children: React.ReactNode;
}

export default function CardGrid({ children }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {children}
    </div>
  );
}

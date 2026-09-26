export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-8">
      {children}
    </div>
  );
}
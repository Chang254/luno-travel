import { LunoLogo } from "@/components/LunoLogo";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <LunoLogo />
        </nav>
      </div>
    </main>
  );
}

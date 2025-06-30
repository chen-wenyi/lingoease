import Header from "~/components/header";
import InputContent from "~/components/inputContent";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-dvh touch-none flex-col items-center overscroll-none select-none">
        <Header />
        <div className="flex w-full flex-1 px-4">
          <InputContent />
        </div>
      </main>
    </HydrateClient>
  );
}

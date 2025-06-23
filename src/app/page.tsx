import { api, HydrateClient } from "~/trpc/server";
import { ModalButton } from "./_components/UI/modal";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
          <div className="text-4xl font-bold">LingoEase</div>
          <ModalButton />
        </div>
      </main>
    </HydrateClient>
  );
}

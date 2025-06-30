import Header from "~/components/header";
import InputContent from "~/components/inputContent";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center px-4">
        <Header />
        <InputContent />
      </main>
    </HydrateClient>
  );
}

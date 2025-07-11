import Footer from "~/components/footer";
import Header from "~/components/header";
import StepIndicator from "~/components/stepIndicator";

export default async function Home() {
  return (
    <main className="flex h-dvh touch-none flex-col items-center overscroll-none select-none">
      <Header />
      <StepIndicator />
      <Footer />
    </main>
  );
}

import Keyconfig from "./keyconfig";

export default function Header() {
  return (
    <div className="flex h-16 w-full items-center justify-between px-8">
      <div className="text-lg font-bold">LingoEase</div>
      <Keyconfig />
    </div>
  );
}

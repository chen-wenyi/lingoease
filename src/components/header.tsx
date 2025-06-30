import Keyconfig from "./keyconfig";

export default function Header() {
  return (
    <div className="flex h-16 w-full items-center justify-between">
      <div>LingoEase</div>
      <Keyconfig />
    </div>
  );
}

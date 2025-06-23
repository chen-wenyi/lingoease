import Dropdown from "../_components/UI/dropdown";
import Test from "../_components/UI/test";

export default async function Main() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="container flex flex-col items-center justify-center gap-6">
        <div className="bg-base-100 border-base-300 collapse-plus collapse rounded-none border">
          <input type="checkbox" />
          <div className="collapse-title font-semibold">OpenAI APIKey</div>
          <div className="collapse-content flex text-sm">
            <Dropdown />
            <div className="flex flex-1 flex-col justify-around gap-2 px-4 font-mono">
              <div className="flex items-center justify-center font-bold">
                <div className="w-18">Label</div>
                <input
                  type="text"
                  placeholder="Type here"
                  defaultValue="key 1"
                  className="input h-8"
                />
              </div>
              <div className="flex items-center justify-center font-bold">
                <div className="w-18">Key</div>
                <input
                  type="text"
                  placeholder="Type here"
                  defaultValue={
                    "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"
                  }
                  className="input h-8"
                />
              </div>
            </div>
            {/* <Card /> */}
          </div>
        </div>
        <Test />
      </div>
    </main>
  );
}

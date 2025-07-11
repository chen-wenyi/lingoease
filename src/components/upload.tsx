import { LuFileText } from "react-icons/lu";
import { PiFileAudioBold } from "react-icons/pi";
import { useStore } from "~/store";
import AudioVideoUpload from "./audioAudioUpload";
import TextUpload from "./textUpload";
import { Button } from "./ui/button";

// type ContentType = "audioVideo" | "text";

// const contentTypes: { value: ContentType; label: string }[] = [
//   { value: "audioVideo", label: "Audio/Video" },
//   { value: "text", label: "Text" },
// ];

export default function Upload() {
  const selectedContentType = useStore((state) => state.uploadContentType);
  // const updateUploadContentType = useStore(
  //   (state) => state.updateUploadContentType,
  // );

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <SwapContentType />

      {selectedContentType === "audioVideo" ? (
        <AudioVideoUpload>
          <Button className="h-12 flex-1">Upload Audio/Video</Button>
        </AudioVideoUpload>
      ) : (
        <TextUpload>
          <Button className="h-12 flex-1">Upload Text</Button>
        </TextUpload>
      )}
    </div>
  );
}

function SwapContentType() {
  const selectedContentType = useStore((state) => state.uploadContentType);
  const updateUploadContentType = useStore(
    (state) => state.updateUploadContentType,
  );

  const handleSwap = () => {
    updateUploadContentType(
      selectedContentType === "audioVideo" ? "text" : "audioVideo",
    );
  };

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-md border-2 border-dashed border-gray-400">
      <label className="swap swap-rotate">
        <input
          type="checkbox"
          checked={selectedContentType === "audioVideo"}
          onChange={handleSwap}
        />
        <div className="swap-on text-3xl">
          <PiFileAudioBold />
        </div>
        <div className="swap-off text-3xl">
          <LuFileText />
        </div>
      </label>
    </div>
  );
}

// <div className="flex w-full flex-col items-center justify-center gap-4">
//   <RadioGroup
//     value={selectedContentType}
//     className="flex"
//     onValueChange={(value) => updateUploadContentType(value as ContentType)}
//   >
//     {contentTypes.map(({ value, label }) => (
//       <div key={value} className="flex items-center space-x-2">
//         <RadioGroupItem
//           className="cursor-pointer"
//           value={value}
//           id={value}
//         />
//         <Label className="cursor-pointer" htmlFor={value}>
//           {label}
//         </Label>
//       </div>
//     ))}
//   </RadioGroup>
//   {selectedContentType === "audioVideo" ? (
//     <AudioVideoUpload>
//       <Button className="w-full">Upload Audio/Video</Button>
//     </AudioVideoUpload>
//   ) : (
//     <TextUpload>
//       <Button className="w-full">Upload Text</Button>
//     </TextUpload>
//   )}
// </div>

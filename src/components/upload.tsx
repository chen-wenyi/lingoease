import { useStore } from "~/store";
import AudioVideoUpload from "./audioAudioUpload";
import TextUpload from "./textUpload";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

type ContentType = "audioVideo" | "text";

const contentTypes: { value: ContentType; label: string }[] = [
  { value: "audioVideo", label: "Audio/Video" },
  { value: "text", label: "Text" },
];

export default function Upload() {
  const selectedContentType = useStore((state) => state.uploadContentType);
  const updateUploadContentType = useStore(
    (state) => state.updateUploadContentType,
  );

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <RadioGroup
        value={selectedContentType}
        className="flex"
        onValueChange={(value) => updateUploadContentType(value as ContentType)}
      >
        {contentTypes.map(({ value, label }) => (
          <div key={value} className="flex items-center space-x-2">
            <RadioGroupItem
              className="cursor-pointer"
              value={value}
              id={value}
            />
            <Label className="cursor-pointer" htmlFor={value}>
              {label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {selectedContentType === "audioVideo" ? (
        <AudioVideoUpload>
          <Button className="w-full">Upload Audio/Video</Button>
        </AudioVideoUpload>
      ) : (
        <TextUpload>
          <Button className="w-full">Upload Text</Button>
        </TextUpload>
      )}
    </div>
  );
}

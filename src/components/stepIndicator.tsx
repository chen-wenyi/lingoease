"use client";

import { FaCheck } from "react-icons/fa";
import { useStore } from "~/store";
import AudioVideoUpload from "./audioAudioUpload";
import Keyconfig from "./keyconfig";
import TextUpload from "./textUpload";

export default function StepIndicator() {
  const currentStep = useStore((state) => state.currentStep);
  const selectedContentType = useStore((state) => state.uploadContentType);

  const stepInfo = [
    {
      desc: "Set key",
      step: (
        <Keyconfig>
          <div>Set Key</div>
        </Keyconfig>
      ),
      status: getStepStatus(currentStep, 0),
    },
    {
      desc: "Upload",
      step:
        selectedContentType === "audioVideo" ? (
          <AudioVideoUpload>
            <div>Upload</div>
          </AudioVideoUpload>
        ) : (
          <TextUpload>
            <div>Upload</div>
          </TextUpload>
        ),
      status: getStepStatus(currentStep, 1),
    },
    {
      desc: "Simplify",
      step: "Simplify",
      status: getStepStatus(currentStep, 2),
    },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <ul className="steps steps-vertical">
        {stepInfo.map((info, index) => (
          <li key={index} className={getStepClass(info.status)}>
            <span className="step-icon">
              {info.status === "completed" && <FaCheck />}
              {info.status === "inprogress" && (
                <span className="loading loading-ring loading-lg"></span>
              )}
            </span>
            {info.status === "pending" ? (
              <span className="font-semibold text-gray-400">{info.desc}</span>
            ) : (
              <span className="cursor-pointer font-semibold">{info.step}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function getStepClass(status: string) {
  switch (status) {
    case "completed":
      return "step step-neutral";
    case "inprogress":
      return "step step-neutral";
    case "pending":
      return "step";
    default:
      return "step";
  }
}

function getStepStatus(currentStep: number, stepIndex: number) {
  if (stepIndex < currentStep) {
    return "completed";
  }
  if (stepIndex === currentStep) {
    return "inprogress";
  }
  return "pending";
}

"use client";

import { useStore } from "~/store";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FaEyeSlash, FaPaste, FaQuestionCircle } from "react-icons/fa";
import { IoMdEye } from "react-icons/io";
import { MdVpnKey } from "react-icons/md";
import type { ApiKey } from "~/typings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";

type PartialApiKey = Omit<ApiKey, "id"> & Partial<Pick<ApiKey, "id">>;

export default function Keyconfig() {
  const [isOpen, setIsOpen] = useState(false);
  const activeApiKeyId = useStore((state) => state.activeApiKeyId);
  const apikeys = useStore((state) => state.apikeys);
  const selectedApiKey = apikeys.find((key) => key.id === activeApiKeyId);
  const [currentApiKey, setCurrentApiKey] = useState<PartialApiKey | undefined>(
    selectedApiKey,
  );

  useEffect(() => {
    const selectedApiKey = apikeys.find((key) => key.id === activeApiKeyId);
    setCurrentApiKey(!selectedApiKey ? undefined : { ...selectedApiKey });
  }, [activeApiKeyId, isOpen, apikeys]);

  return (
    <Drawer onOpenChange={setIsOpen} open={isOpen}>
      <DrawerTrigger>
        <MdVpnKey className="cursor-pointer" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center justify-center gap-2">
            OpenAI APIKey Setting
            <Instructions />
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="px-8">
          <div className="flex">
            <div className="flex-1 pr-2">
              <KeySelector />
            </div>
            <AddKey setCurrentApiKey={setCurrentApiKey} />
          </div>
          <Separator className="my-6" />
          <div>
            <KeyDetails apiKey={currentApiKey} />
          </div>
        </div>
        <DrawerFooter>
          {/* <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose> */}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function KeySelector() {
  const apikeys = useStore((state) => state.apikeys);
  const activeApiKeyId = useStore((state) => state.activeApiKeyId);
  const selectApiKey = useStore((state) => state.selectApiKey);
  return (
    <Select value={activeApiKeyId} onValueChange={selectApiKey}>
      <SelectTrigger className="w-48 overflow-hidden sm:w-full">
        <SelectValue placeholder="Select API Key" />
      </SelectTrigger>
      <SelectContent>
        {apikeys.length > 0 ? (
          apikeys.map((key) => (
            <SelectItem key={key.id} value={key.id}>
              {key.label}
            </SelectItem>
          ))
        ) : (
          <SelectItem disabled value="noValue">
            No API Keys Available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}

function AddKey({
  setCurrentApiKey,
}: {
  setCurrentApiKey: (key: PartialApiKey) => void;
}) {
  return (
    <Button
      onClick={() => {
        setCurrentApiKey({
          label: `New API Key(${dayjs().format("DD/MM/YY HH:mm:ss")})`,
          value: "",
        });
      }}
    >
      Add API Key
    </Button>
  );
}

function KeyDetails({ apiKey }: { apiKey?: PartialApiKey }) {
  const [label, setLabel] = useState(apiKey?.label ?? "");
  const [value, setValue] = useState(apiKey?.value ?? "");
  const [hidden, setHidden] = useState(true);
  const hiddenValue = value ? value.replace(/./g, "*") : "";

  const shouldUpdate =
    value !== "" &&
    label !== "" &&
    (value !== apiKey?.value || label !== apiKey?.label);

  const addApiKey = useStore((state) => state.addApiKey);
  const selectApiKey = useStore((state) => state.selectApiKey);
  const removeApiKey = useStore((state) => state.removeApiKey);
  const updateApiKey = useStore((state) => state.updateApiKey);

  useEffect(() => {
    setLabel(apiKey?.label ?? "");
    setValue(apiKey?.value ?? "");
  }, [apiKey]);

  const pasteApiKey = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setValue(clipboardText.trim());
    } catch (error) {
      console.error("Failed to read clipboard contents: ", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid w-full max-w-sm items-center gap-3">
        <Label htmlFor="label">Label</Label>
        <Input
          key={`label-${apiKey?.id}`}
          type="text"
          id="label"
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onFocus={(e) => (e.target as HTMLInputElement).select()}
          // onBlur={onBlur}
        />
      </div>
      <div className="grid w-full gap-3">
        <Label>
          API Key
          <span className="flex gap-2">
            <span
              className="block cursor-pointer"
              onClick={() => {
                setHidden(!hidden);
              }}
            >
              {!hidden ? <IoMdEye /> : <FaEyeSlash />}
            </span>
            <FaPaste className="cursor-pointer" onClick={pasteApiKey} />
          </span>
        </Label>
        <Textarea
          className="h-[115px] font-mono text-xs"
          key={`apikey-${apiKey?.id}`}
          placeholder="Type your API Key here."
          id="apikey"
          value={hidden ? hiddenValue : value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={(e) => {
            (e.target as HTMLTextAreaElement).select();
            setHidden(false);
          }}
          // onBlur={onBlur}
        />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        {apiKey?.id ? (
          <>
            <Button
              variant="destructive"
              onClick={() => {
                if (apiKey.id) removeApiKey(apiKey.id);
              }}
            >
              Delete
            </Button>
            <Button
              disabled={!shouldUpdate}
              onClick={() => {
                if (label && value && apiKey.id) {
                  updateApiKey(apiKey.id, label, value);
                }
              }}
            >
              Update
            </Button>
          </>
        ) : (
          <Button
            disabled={!label || !value}
            onClick={() => {
              if (label && value) {
                const id = addApiKey(label, value);
                selectApiKey(id);
              }
            }}
          >
            Add & Apply
          </Button>
        )}
      </div>
    </div>
  );
}

function Instructions() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <FaQuestionCircle className="cursor-pointer" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Why need a API Key?</AlertDialogTitle>
          <AlertDialogDescription>
            An OpenAI API key is a unique key that allows application to access
            and utilize OpenAI's models.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <a
              href="https://platform.openai.com/docs/quickstart/add-your-api-key"
              target="_blank"
              rel="noopener noreferrer"
            >
              Create Api Key
            </a>
            <AlertDialogCancel>Got it</AlertDialogCancel>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

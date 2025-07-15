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

import clsx from "clsx";
import { useEffect, useState, useTransition } from "react";
import { BiSolidError } from "react-icons/bi";
import { FaEyeSlash, FaPaste, FaQuestionCircle } from "react-icons/fa";
import { GrValidate } from "react-icons/gr";
import { IoMdEye } from "react-icons/io";
import { toast } from "sonner";
import { validateOpenAIAPIKey } from "~/actions/keyValidation";
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
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Toaster } from "./ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";

export default function Keyconfig({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"select" | "create">("select");

  return (
    <Drawer onOpenChange={setIsOpen} open={isOpen}>
      <DrawerTrigger className="cursor-pointer" asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center justify-center gap-2">
            OpenAI APIKey Setting
            <Instructions />
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <Tabs
          value={mode}
          className="mx-4"
          onValueChange={(v) => setMode(v as "select" | "create")}
        >
          <TabsList>
            <TabsTrigger value="select">Existing Config</TabsTrigger>
            <TabsTrigger value="create">New Config</TabsTrigger>
          </TabsList>
          <SelectConfigTab />
          <CreateConfigTab closeDrawer={() => setIsOpen(false)} />
        </Tabs>

        <DrawerFooter></DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function KeySelector() {
  const apikeys = useStore((state) => state.apikeys);
  const activeApiKeyId = useStore((state) => state.activeApiKeyId);
  const selectApiKey = useStore((state) => state.selectApiKey);
  const updateCurrentStep = useStore((state) => state.updateCurrentStep);

  const applyApiKey = (id: string) => {
    selectApiKey(id);
    const activeApiKey = apikeys.find((key) => key.id === id);
    if (activeApiKey?.status === "invalid") {
      toast.error("Current API Key is invalid. Please check.");
    }
    updateCurrentStep();
  };

  return (
    <Select value={activeApiKeyId} onValueChange={applyApiKey}>
      <SelectTrigger className="w-full overflow-hidden sm:w-full">
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

function SelectConfigTab() {
  const apiKey = useStore((state) =>
    state.apikeys.find((key) => key.id === state.activeApiKeyId),
  );

  const [label, setLabel] = useState(apiKey?.label ?? "");
  const [value, setValue] = useState(apiKey?.value ?? "");
  const [status, setStatus] = useState(apiKey?.status ?? "pending");
  const [hidden, setHidden] = useState(true);
  const hiddenValue = value ? value.replace(/./g, "*") : "";

  const shouldUpdate =
    value !== "" &&
    label !== "" &&
    (value !== apiKey?.value || label !== apiKey?.label);

  const removeApiKey = useStore((state) => state.removeApiKey);
  const updateApiKey = useStore((state) => state.updateApiKey);

  const updateCurrentStep = useStore((state) => state.updateCurrentStep);

  const [isValidating, startTransition] = useTransition();

  const tryValidateApiKey = async () => {
    if (!value) {
      setStatus("pending");
      return;
    }
    if (status === "valid" && !shouldUpdate) {
      return;
    }
    void validateApiKey(value);
  };

  const validateApiKey = async (value: string) => {
    setStatus("pending");
    startTransition(async () => {
      const isValid = await validateOpenAIAPIKey(value);
      if (!isValid) {
        toast.error("Invalid API Key. Please check your key and try again.");
      }
      startTransition(() => {
        setStatus(isValid ? "valid" : "invalid");
      });
    });
  };

  useEffect(() => {
    setLabel(apiKey?.label ?? "");
    setValue(apiKey?.value ?? "");
    setStatus(apiKey?.status ?? "pending");
  }, [apiKey]);

  const pasteApiKey = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setValue(clipboardText.trim());
      void validateApiKey(clipboardText.trim());
    } catch (error) {
      console.error("Failed to read clipboard contents: ", error);
    }
  };

  return (
    <TabsContent value="select">
      <Card className="gap-0 py-2">
        <CardHeader></CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex flex-1 flex-col gap-2 pr-2">
            <div>
              <Toaster />
              <div className="flex flex-col gap-4">
                <div className="grid w-full items-center gap-3">
                  <Label className="flex items-center" htmlFor="">
                    Select API Key Config
                  </Label>
                  <KeySelector />
                  <div className="w-full border-b border-gray-200"></div>
                  <Label htmlFor="label">Label</Label>
                  <Input
                    key={`label-${apiKey?.id}`}
                    type="text"
                    id="label"
                    placeholder="Label"
                    disabled={!apiKey?.id}
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onFocus={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
                <div className="grid w-full gap-3">
                  <Label className="flex items-center" htmlFor="">
                    API Key
                    <APIKeyValidity status={status} />
                  </Label>
                  <Textarea
                    className={clsx("h-[115px] font-mono text-xs", {
                      "border-red-500": status === "invalid",
                    })}
                    disabled={!apiKey?.id}
                    key={`apikey-${apiKey?.id}`}
                    placeholder="Type your API Key here."
                    id="apikey"
                    value={hidden ? hiddenValue : value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={(e) => {
                      (e.target as HTMLTextAreaElement).select();
                      setHidden(false);
                    }}
                    onBlur={tryValidateApiKey}
                  />
                  <div className="flex gap-2">
                    <Button
                      disabled={!apiKey?.id}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-1 border-gray-300 bg-transparent"
                      onClick={() => {
                        setHidden(!hidden);
                      }}
                    >
                      {!hidden ? (
                        <IoMdEye className="text-black" />
                      ) : (
                        <FaEyeSlash className="text-black" />
                      )}
                    </Button>
                    <Button
                      disabled={!apiKey?.id}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-1 border-gray-300 bg-transparent"
                      onClick={pasteApiKey}
                    >
                      <FaPaste className="text-black" />
                    </Button>
                  </div>
                </div>
                <div className="mb-2 flex justify-end gap-2">
                  <Button
                    variant="destructive"
                    disabled={!apiKey?.id}
                    onClick={() => {
                      if (apiKey?.id) {
                        removeApiKey(apiKey.id);
                        updateCurrentStep();
                      }
                    }}
                  >
                    Delete
                  </Button>
                  <div className="w-30">
                    {isValidating ? (
                      <Button className="w-full" disabled>
                        Validating...
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        disabled={
                          !shouldUpdate ||
                          ["invalid", "pending"].includes(status)
                        }
                        onClick={() => {
                          if (apiKey && label && value && apiKey.id) {
                            updateApiKey({
                              id: apiKey.id,
                              label,
                              value,
                              status,
                            });
                          }
                        }}
                      >
                        Update
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

function CreateConfigTab({ closeDrawer }: { closeDrawer: () => void }) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<ApiKey["status"]>("pending");
  const [hidden, setHidden] = useState(true);
  const hiddenValue = value ? value.replace(/./g, "*") : "";

  const shouldUpdate = value !== "" && label !== "";

  const addApiKey = useStore((state) => state.addApiKey);
  const selectApiKey = useStore((state) => state.selectApiKey);

  const updateCurrentStep = useStore((state) => state.updateCurrentStep);

  const [isValidating, startTransition] = useTransition();

  const tryValidateApiKey = async () => {
    if (!value) {
      setStatus("pending");
      return;
    }
    if (status === "valid" && !shouldUpdate) {
      return;
    }
    void validateApiKey(value);
  };

  const validateApiKey = async (value: string) => {
    setStatus("pending");
    startTransition(async () => {
      const isValid = await validateOpenAIAPIKey(value);
      if (!isValid) {
        toast.error("Invalid API Key. Please check your key and try again.");
      }
      startTransition(() => {
        setStatus(isValid ? "valid" : "invalid");
      });
    });
  };

  const applyApiKey = (key: string) => {
    selectApiKey(key);
    updateCurrentStep();
  };

  const pasteApiKey = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setValue(clipboardText.trim());
      void validateApiKey(clipboardText.trim());
    } catch (error) {
      console.error("Failed to read clipboard contents: ", error);
    }
  };

  return (
    <TabsContent value="create">
      <Card className="gap-0 py-2">
        <CardHeader></CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex flex-1 flex-col gap-2 pr-2">
            <div>
              <Toaster />
              <div className="flex flex-col gap-4">
                <div className="grid w-full items-center gap-3">
                  <Label className="flex items-center" htmlFor="">
                    Create New API Key Config
                  </Label>
                  <div className="item-center flex h-9 text-xs sm:text-sm sm:leading-9">
                    Create a labeled API key configuration for easy management
                  </div>
                  <div className="w-full border-b border-gray-200"></div>
                  <Label htmlFor="label">Label</Label>
                  <Input
                    // key={`label-${apiKey?.id}`}
                    type="text"
                    id="label"
                    placeholder="Label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onFocus={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
                <div className="grid w-full gap-3">
                  <Label className="flex items-center" htmlFor="">
                    API Key
                    <APIKeyValidity status={status} />
                  </Label>
                  <Textarea
                    className={clsx("h-[115px] font-mono text-xs", {
                      "border-red-500": status === "invalid",
                    })}
                    // key={`apikey-${apiKey?.id}`}
                    placeholder="Type your API Key here."
                    id="apikey"
                    value={hidden ? hiddenValue : value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={(e) => {
                      (e.target as HTMLTextAreaElement).select();
                      setHidden(false);
                    }}
                    onBlur={tryValidateApiKey}
                  />
                  <div className="flex gap-2">
                    <div
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-1 border-gray-300"
                      onClick={() => {
                        setHidden(!hidden);
                      }}
                    >
                      {!hidden ? <IoMdEye /> : <FaEyeSlash />}
                    </div>
                    <div
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-1 border-gray-300"
                      onClick={pasteApiKey}
                    >
                      <FaPaste />
                    </div>
                  </div>
                </div>
                <div className="mb-2 flex justify-end gap-2">
                  <div className="flex gap-2">
                    <Button
                      disabled={checkDisabledStatus(label, value, status)}
                      onClick={() => {
                        if (label && value) {
                          addApiKey(label, value);
                        }
                      }}
                    >
                      Add
                    </Button>
                    {isValidating ? (
                      <Button className="w-30" disabled>
                        Validating...
                      </Button>
                    ) : (
                      <Button
                        className="w-30"
                        disabled={checkDisabledStatus(label, value, status)}
                        onClick={() => {
                          if (label && value) {
                            const id = addApiKey(label, value);
                            applyApiKey(id);
                            closeDrawer();
                          }
                        }}
                      >
                        Add & Apply
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
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
            <div className="flex items-start text-left">
              {`An OpenAI API key is a unique key that allows application to access
            and utilize OpenAI's models.`}
            </div>
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
          </AlertDialogAction>
          <AlertDialogCancel>Got it</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function checkDisabledStatus(label: string, value: string, status: string) {
  return !label || !value || ["invalid", "pending"].includes(status);
}

function APIKeyValidity({
  status,
}: {
  status: "valid" | "invalid" | "pending";
}) {
  return (
    <div>
      {status === "valid" ? (
        <div className="tooltip" data-tip="Valid API Key">
          <GrValidate className="text-green-600" />
        </div>
      ) : status === "invalid" ? (
        <div className="tooltip" data-tip="Invalid API Key">
          <BiSolidError className="text-red-600" />
        </div>
      ) : (
        <div className="tooltip" data-tip="Validation Pending...">
          <GrValidate className="opacity-35" />
        </div>
      )}
    </div>
  );
}

"use client";

import { useStore } from "~/store";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

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

export default function Keyconfig() {
  return (
    <Drawer>
      <DrawerTrigger>Key</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>OpenAI APIKey Setting</DrawerTitle>
          {/* <DrawerDescription></DrawerDescription> */}
        </DrawerHeader>
        <div className="px-8">
          <div className="flex">
            <div className="flex-1 pr-2">
              <KeySelector />
            </div>
            <AddKey />
          </div>
          <Separator className="my-6" />
          <div>
            <KeyDetails />
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

  return (
    <Select>
      <SelectTrigger className="w-full">
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

function AddKey() {
  const addApiKey = useStore((state) => state.addApiKey);
  return (
    <Button onClick={() => addApiKey("New API Key", "")}>Add API Key</Button>
  );
}

function KeyDetails() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid w-full max-w-sm items-center gap-3">
        <Label htmlFor="label">Label</Label>
        <Input type="text" id="label" placeholder="Label" />
      </div>
      <div className="grid w-full gap-3">
        <Label htmlFor="apikey">API Key</Label>
        <Textarea placeholder="Type your API Key here." id="apikey" />
      </div>
    </div>
  );
}

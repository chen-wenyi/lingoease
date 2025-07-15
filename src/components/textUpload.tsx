"use client";

import { useState } from "react";
import { useStore } from "~/store";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Textarea } from "./ui/textarea";

export default function TextUpload({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = useStore((state) => state.content);
  const setContent = useStore((state) => state.setContent);
  const updateCurrentStep = useStore((state) => state.updateCurrentStep);

  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = () => {
    setContent(content);
    updateCurrentStep();
    setIsOpen(false);
  };

  return (
    <Drawer onOpenChange={setIsOpen} open={isOpen}>
      <DrawerTrigger className="cursor-pointer" asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center justify-center gap-2">
            Upload Text
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="flex h-[60dvh] flex-col px-8">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1"
            placeholder="Type your text here..."
          />
        </div>
        <DrawerFooter>
          <DrawerClose asChild onClick={onSubmit}>
            <Button>Submit</Button>
            {/* <Button variant="outline">Cancel</Button> */}
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

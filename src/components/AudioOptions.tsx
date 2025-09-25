'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getProviderFromApiKey } from '@/lib/utils';
import { useStore } from '@/store';
import {
  OUTPUT_LEVELS,
  OUTPUT_STYLES,
  OUTPUT_VOICES,
  type OutputStyle,
  type OutputVoice,
} from '@/store/typing';
import React from 'react';

type Voice = OutputVoice;

export default function AudioOptions() {
  const levelObj = useStore((s) => s.outputOptions.level);
  const voice = useStore((s) => s.outputOptions.voice);
  const setOutputOptions = useStore((s) => s.setOutputOptions);
  const outputStyle = useStore((s) => s.outputOptions.style as OutputStyle);
  const isDevMode = useStore((s) => s.development);

  // Fixed-width label container to keep left column aligned
  const LabelCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className='w-32 shrink-0'>
      <Label className='text-sm text-left font-bold'>{children}</Label>
    </div>
  );

  return (
    <div className='w-full flex justify-center p-12'>
      <div className=' flex flex-col gap-4'>
        {/* English Level */}
        <div className='grid grid-cols-[9rem_auto] items-center justify-items-start'>
          <LabelCell>English Level</LabelCell>
          <RadioGroup
            className='flex flex-row items-center gap-2'
            value={levelObj.level}
            onValueChange={(v) => {
              const next = OUTPUT_LEVELS.find((l) => l.level === v);
              if (next) setOutputOptions({ level: next });
            }}
          >
            {(['Beginner', 'Elementary'] as const).map((opt) => {
              const id = `level-${opt.toLowerCase()}`;
              const selected = levelObj.level === opt;
              return (
                <div key={opt} className='flex items-center'>
                  <RadioGroupItem id={id} value={opt} className='sr-only' />
                  <Label
                    htmlFor={id}
                    className={`cursor-pointer select-none rounded-md border px-3 py-1 text-sm transition-colors ${
                      selected
                        ? 'bg-black text-white border-black'
                        : 'bg-transparent text-foreground border-input hover:bg-muted'
                    }`}
                  >
                    {opt}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* Audio Voice */}
        <div className='grid grid-cols-[9rem_auto] items-center justify-items-start'>
          <LabelCell>Voice</LabelCell>
          <Select
            value={voice}
            onValueChange={(v) => setOutputOptions({ voice: v as Voice })}
          >
            <SelectTrigger className='min-w-40 capitalize'>
              <SelectValue placeholder='Select a voice' />
            </SelectTrigger>
            <SelectContent>
              {OUTPUT_VOICES.map((v) => (
                <SelectItem key={v} value={v} className='capitalize'>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Output Style */}
        <div className='grid grid-cols-[9rem_auto] items-center justify-items-start'>
          <LabelCell>Output Style</LabelCell>
          <Select
            value={outputStyle?.name}
            onValueChange={(v) => {
              const next = OUTPUT_STYLES.find((s) => s.name === v);
              if (next) setOutputOptions({ style: next });
            }}
          >
            <SelectTrigger className='min-w-40'>
              <SelectValue placeholder='Select a style' />
            </SelectTrigger>
            <SelectContent>
              {OUTPUT_STYLES.map((s) => (
                <SelectItem key={s.name} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Style description line (full width under label + options) */}
        <div className='grid grid-cols-[9rem_auto] items-start justify-items-start'>
          {(() => {
            const current = outputStyle;
            return (
              <p
                className='w-80 col-span-2 text-xs text-muted-foreground mt-1 break-words whitespace-normal'
                title={current?.instruction}
              >
                {current?.instruction}
              </p>
            );
          })()}
        </div>
        {isDevMode && <ModelSelector />}
      </div>
    </div>
  );
}

function ModelSelector() {
  const apikeys = useStore((state) => state.apikeys);
  const activeApiKeyId = useStore((state) => state.activeApiKeyId);
  const activeApiKey = apikeys.find((key) => key.id === activeApiKeyId);
  const provider = activeApiKey
    ? getProviderFromApiKey(activeApiKey.value)
    : undefined;
  const selectedModel = useStore((state) => state.selectedModel);
  const setSelectedModel = useStore((state) => state.setSelectedModel);

  // Example model lists
  const openaiModels = [
    'gpt-5',
    'gpt-5-mini',
    'gpt-5-nano',
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    'gpt-4o',
    'gpt-3.5-turbo',
  ];
  const geminiModels = [
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  let modelOptions: string[] | undefined;
  if (provider === 'openai') {
    modelOptions = openaiModels;
  } else if (provider === 'google') {
    modelOptions = geminiModels;
  }

  if (!provider || !modelOptions || modelOptions.length === 0) return null;

  return (
    <div className='grid grid-cols-[9rem_auto] items-center justify-items-start'>
      <div className='w-32 shrink-0'>
        <Label className='text-sm text-left font-bold'>Model</Label>
      </div>
      <Select
        value={selectedModel || ''}
        onValueChange={(v) => setSelectedModel(v)}
      >
        <SelectTrigger className='min-w-40 capitalize'>
          <SelectValue placeholder='Select a model' />
        </SelectTrigger>
        <SelectContent>
          {modelOptions.map((m) => (
            <SelectItem key={m} value={m} className='capitalize'>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

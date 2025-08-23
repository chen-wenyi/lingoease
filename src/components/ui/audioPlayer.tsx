import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bug,
  Download,
  Loader2,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function AudioPlayer({
  src = '/sample.mp3',
  title = 'Sample Audio',
  downloadUrl,
  crossOrigin = 'anonymous',
  className = '',
  type = 'audio/mpeg',
  debug = true,
}: {
  src: string;
  title?: string;
  downloadUrl?: string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  className?: string;
  type?: string;
  debug?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [bufferedPct, setBufferedPct] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [rate, setRate] = useState(1);
  const [userSeeking, setUserSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<{
    readyState: number;
    networkState: number;
  }>({ readyState: 0, networkState: 0 });

  const fmt = (sec: number) => {
    if (!isFinite(sec)) return '00:00';
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
  };

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.readyState === 0) a.load();
    if (a.paused) {
      await a.play();
    } else {
      a.pause();
    }
  };

  const tick = () => {
    const a = audioRef.current;
    if (!a) return;
    if (!userSeeking) {
      setCurrentTime(a.currentTime);
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const updateBuffered = () => {
    const a = audioRef.current;
    if (!a || !a.duration || a.buffered.length === 0) return setBufferedPct(0);
    const end = a.buffered.end(a.buffered.length - 1);
    setBufferedPct(Math.min(100, (end / a.duration) * 100));
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onLoadedMeta = () => {
      setDuration(a.duration || 0);
      updateBuffered();
      setLoading(false);
      setDebugInfo({ readyState: a.readyState, networkState: a.networkState });
    };
    const onLoadedData = () => {
      setReady(true);
      setLoading(false);
    };
    const onCanPlay = () => {
      setReady(true);
      setLoading(false);
    };
    const onCanPlayThrough = () => {
      setReady(true);
      setLoading(false);
    };

    const onPlay = () => {
      setPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    const onErr = () => {
      const mediaErr = a.error;
      let msg = 'Unknown error';
      if (mediaErr) {
        switch (mediaErr.code) {
          case mediaErr.MEDIA_ERR_ABORTED:
            msg = 'Loading aborted';
            break;
          case mediaErr.MEDIA_ERR_NETWORK:
            msg = 'Network error';
            break;
          case mediaErr.MEDIA_ERR_DECODE:
            msg = 'Media decoding failed (possibly MIME type mismatch)';
            break;
          case mediaErr.MEDIA_ERR_SRC_NOT_SUPPORTED:
            msg = 'Unsupported audio source (URL or type)';
            break;
          default:
            msg = 'Playback error';
        }
      }
      setErrorMsg(msg);
      setLoading(false);
      setDebugInfo({ readyState: a.readyState, networkState: a.networkState });
    };
    const onRSUpdate = () =>
      setDebugInfo({ readyState: a.readyState, networkState: a.networkState });

    a.addEventListener('loadedmetadata', onLoadedMeta);
    a.addEventListener('loadeddata', onLoadedData);
    a.addEventListener('canplay', onCanPlay);
    a.addEventListener('canplaythrough', onCanPlayThrough);
    a.addEventListener('progress', updateBuffered);
    a.addEventListener('playing', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('error', onErr);
    a.addEventListener('stalled', onRSUpdate);
    a.addEventListener('suspend', onRSUpdate);
    a.addEventListener('waiting', onRSUpdate);

    // ✅ Immediate readiness check (handles cached fast paths and missed early events)
    try {
      const rs = a.readyState; // 0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA, 3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA
      // If metadata is already available but our handler missed it, populate duration
      if (rs >= 1 && !Number.isFinite(duration)) {
        setDuration(a.duration || 0);
      }
      // If we already have current/future/enough data, mark as ready and stop loading spinner
      if (rs >= 2) {
        setReady(true);
        setLoading(false);
      }
    } catch {}

    const t = window.setTimeout(() => {
      if (!ready && a.readyState < 1) {
        setErrorMsg(
          (prev) =>
            prev ??
            'Failed to get metadata for a long time, possibly due to CORS, MIME, Range, or mixed content issues'
        );
        setDebugInfo({
          readyState: a.readyState,
          networkState: a.networkState,
        });
        setLoading(false);
      }
    }, 3000);

    return () => {
      window.clearTimeout(t);
      a.removeEventListener('loadedmetadata', onLoadedMeta);
      a.removeEventListener('loadeddata', onLoadedData);
      a.removeEventListener('canplay', onCanPlay);
      a.removeEventListener('canplaythrough', onCanPlayThrough);
      a.removeEventListener('progress', updateBuffered);
      a.removeEventListener('playing', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('error', onErr);
      a.removeEventListener('stalled', onRSUpdate);
      a.removeEventListener('suspend', onRSUpdate);
      a.removeEventListener('waiting', onRSUpdate);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = muted ? 0 : volume;
  }, [volume, muted]);
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.playbackRate = rate;
  }, [rate]);
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.loop = loop;
  }, [loop]);

  const seekTo = (sec: number) => {
    const a = audioRef.current;
    if (!a || !isFinite(duration)) return;
    a.currentTime = Math.min(Math.max(0, sec), duration);
    setCurrentTime(a.currentTime);
  };
  const seekBy = (delta: number) => seekTo(currentTime + delta);

  return (
    <TooltipProvider>
      <Card
        className={`w-full mx-auto shadow-md border bg-background ${className} py-3`}
      >
        <CardContent className='pt-2'>
          <div className='px-2'>
            <div className='flex items-center justify-between mb-2 gap-2 min-w-0'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='flex-1 basis-48 min-w-0 truncate text-sm font-medium text-foreground/90'>
                    {title}
                  </div>
                </TooltipTrigger>
                <TooltipContent>{title}</TooltipContent>
              </Tooltip>
              <div className='shrink-0 flex items-center gap-1'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={loop ? 'default' : 'ghost'}
                      size='icon'
                      className='rounded-lg h-7 w-7'
                      onClick={() => setLoop((v) => !v)}
                    >
                      <Repeat className='h-3.5 w-3.5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Loop</TooltipContent>
                </Tooltip>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      className='rounded-lg px-2 h-7 text-xs'
                    >
                      {rate.toFixed(2)}x
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                      <DropdownMenuItem key={r} onClick={() => setRate(r)}>
                        {r}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='rounded-lg h-7 w-7'
                    >
                      {muted || volume === 0 ? (
                        <VolumeX className='h-3.5 w-3.5' />
                      ) : (
                        <Volume2 className='h-3.5 w-3.5' />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align='end'
                    className='w-14 !min-w-0 p-2'
                  >
                    <div className='p-1 flex flex-col items-center'>
                      <Slider
                        orientation='vertical'
                        value={[muted ? 0 : volume * 100]}
                        max={100}
                        step={1}
                        aria-label='Volume'
                        onValueChange={(v) => {
                          const next = (v[0] ?? 0) / 100;
                          setMuted(next === 0);
                          setVolume(next);
                        }}
                      />
                      <div className='mt-1 text-xs text-muted-foreground'>
                        {Math.round((muted ? 0 : volume) * 100)}%
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='rounded-lg h-7 w-7'
                      onClick={() => {
                        const a = audioRef.current;
                        const url = downloadUrl ?? a?.currentSrc ?? src;
                        if (!url) return;
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'lingoease-simplified.ogg';
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                      }}
                    >
                      <Download className='h-3.5 w-3.5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {debug && errorMsg && (
              <div className='mb-2 text-xs text-destructive flex items-center gap-1'>
                <Bug className='h-3.5 w-3.5' /> {errorMsg}（readyState:{' '}
                {debugInfo.readyState}, networkState: {debugInfo.networkState}）
              </div>
            )}

            <div className='relative mb-2'>
              <div className='absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-muted/60 overflow-hidden pointer-events-none'>
                <div
                  className='h-full bg-muted-foreground/20 pointer-events-none'
                  style={{ width: `${bufferedPct}%` }}
                />
              </div>
              <Slider
                className='relative z-10 pointer-events-auto'
                value={[
                  ((userSeeking ? seekTime : currentTime) / (duration || 1)) *
                    100,
                ]}
                max={100}
                step={0.1}
                aria-label='Progress'
                onPointerDownCapture={() => setUserSeeking(true)}
                onValueChange={(v) => {
                  if (!ready || !Number.isFinite(duration) || duration <= 0)
                    return;
                  setUserSeeking(true);
                  const pct = Array.isArray(v) ? v[0] : 0;
                  setSeekTime((pct / 100) * duration);
                }}
                onValueCommit={(v) => {
                  if (!ready || !Number.isFinite(duration) || duration <= 0)
                    return;
                  const pct = Array.isArray(v) ? v[0] : 0;
                  const next = (pct / 100) * duration;
                  seekTo(next);
                  setUserSeeking(false);
                }}
              />
            </div>

            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-lg h-8 w-8'
                  onClick={() => seekBy(-10)}
                >
                  <SkipBack className='h-4 w-4' />
                </Button>
                <Button
                  variant='default'
                  size='icon'
                  className='rounded-xl h-10 w-10'
                  onClick={toggle}
                >
                  {loading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : playing ? (
                    <Pause className='h-5 w-5' />
                  ) : (
                    <Play className='h-5 w-5' />
                  )}
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-lg h-8 w-8'
                  onClick={() => seekBy(10)}
                >
                  <SkipForward className='h-4 w-4' />
                </Button>
              </div>
              <div className='ml-auto text-xs tabular-nums text-muted-foreground select-none'>
                {fmt(currentTime)} / {fmt(duration)}
              </div>
            </div>
          </div>
          <audio
            ref={audioRef}
            preload='metadata'
            crossOrigin={crossOrigin}
            className='hidden'
          >
            <source src={src} type={type} />
          </audio>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

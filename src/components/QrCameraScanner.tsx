"use client";

import { Camera, CameraOff, Video } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface QrCameraScannerProps {
  onScan: (decodedText: string) => void;
  disabled?: boolean;
  startLabel: string;
  stopLabel: string;
  scanningHint: string;
  permissionDeniedText: string;
  unavailableText: string;
}

export function QrCameraScanner({
  onScan,
  disabled = false,
  startLabel,
  stopLabel,
  scanningHint,
  permissionDeniedText,
  unavailableText,
}: QrCameraScannerProps) {
  const regionId = useId().replaceAll(":", "_");
  const [active, setActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const lastDecodedRef = useRef<{ value: string; at: number }>({
    value: "",
    at: 0,
  });
  const scannerRef = useRef<{
    stop: () => Promise<void>;
    clear: () => void;
  } | null>(null);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    async function startCamera() {
      setCameraError(null);
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        const instance = new Html5Qrcode(regionId, { verbose: false });
        scannerRef.current = instance;

        await instance.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            const now = Date.now();
            if (
              lastDecodedRef.current.value === decodedText &&
              now - lastDecodedRef.current.at < 3000
            ) {
              return;
            }
            lastDecodedRef.current = { value: decodedText, at: now };
            onScanRef.current(decodedText);
          },
          () => {
            // Ignore frame-level decode misses
          },
        );
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setCameraError(
          msg.includes("Permission") || msg.includes("NotAllowed")
            ? permissionDeniedText
            : unavailableText,
        );
        setActive(false);
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      const current = scannerRef.current;
      scannerRef.current = null;
      if (current) {
        current
          .stop()
          .then(() => current.clear())
          .catch(() => {
            // Ignore cleanup errors if stream never started
          });
      }
    };
  }, [active, regionId, permissionDeniedText, unavailableText]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setActive((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors active:scale-[0.96] disabled:opacity-60 ${
            active
              ? "bg-crimson-500 text-white hover:bg-crimson-600"
              : "bg-royal-900 text-gold-300 hover:bg-royal-800"
          }`}
        >
          {active ? (
            <>
              <CameraOff className="h-4 w-4" />
              <span>{stopLabel}</span>
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              <span>{startLabel}</span>
            </>
          )}
        </button>

        {active ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <Video className="h-3.5 w-3.5 animate-pulse" />
            <span>{scanningHint}</span>
          </span>
        ) : null}
      </div>

      <div
        className={`overflow-hidden rounded-2xl border bg-royal-950/95 transition-colors ${
          active ? "border-gold-400/50 p-2" : "border-slate-200 bg-ivory p-6"
        }`}
      >
        {!active ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-ink-muted">
            <Camera className="h-9 w-9 text-royal-900/40" />
            <p className="mt-2 max-w-xs text-xs">{scanningHint}</p>
          </div>
        ) : null}
        <div
          id={regionId}
          className={active ? "mx-auto max-w-xs overflow-hidden rounded-xl" : "hidden"}
        />
      </div>

      {cameraError ? (
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-900"
        >
          {cameraError}
        </p>
      ) : null}
    </div>
  );
}

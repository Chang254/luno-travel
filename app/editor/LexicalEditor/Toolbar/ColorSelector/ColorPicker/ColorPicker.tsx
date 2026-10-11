"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { clampRatio, hexToHsv, hsvToHex, normalizeHex, type HSV } from "./ColorPicker.helpers";
import { styles } from "./ColorPicker.styles";

export interface ColorPickerProps {
  /** The current color, as a `#rrggbb` hex string */
  color: string;
  /** Called with a new `#rrggbb` hex string whenever the picker's color changes */
  onChange: (hex: string) => void;
}

/** A saturation/value gradient box, hue slider, and hex input for picking any color. */
export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(color));
  const [hexInput, setHexInput] = useState(color);
  const svBoxRef = useRef<HTMLDivElement>(null);
  const hueBarRef = useRef<HTMLDivElement>(null);

  const updateHsv = (updater: (prev: HSV) => HSV) => {
    setHsv((prev) => {
      const next = updater(prev);
      const hex = hsvToHex(next);
      setHexInput(hex);
      onChange(hex);
      return next;
    });
  };

  const handleSvPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const box = svBoxRef.current;
    if (!box) {
      return;
    }
    const rect = box.getBoundingClientRect();
    const s = clampRatio((event.clientX - rect.left) / rect.width);
    const v = clampRatio(1 - (event.clientY - rect.top) / rect.height);
    updateHsv((prev) => ({ ...prev, s, v }));
  };

  const handleHuePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bar = hueBarRef.current;
    if (!bar) {
      return;
    }
    const rect = bar.getBoundingClientRect();
    const h = clampRatio((event.clientX - rect.left) / rect.width) * 360;
    updateHsv((prev) => ({ ...prev, h }));
  };

  const commitHexInput = () => {
    const normalized = normalizeHex(hexInput);
    if (!normalized) {
      setHexInput(hsvToHex(hsv));
      return;
    }
    setHsv(hexToHsv(normalized));
    setHexInput(normalized);
    onChange(normalized);
  };

  return (
    <div className={styles.container}>
      <div
        ref={svBoxRef}
        role="slider"
        aria-label="Saturation and brightness"
        aria-valuenow={Math.round(hsv.v * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={hsvToHex(hsv)}
        className={styles.svBox}
        style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          handleSvPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) {
            handleSvPointer(event);
          }
        }}
      >
        <div
          className={styles.svThumb}
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
        />
      </div>

      <div
        ref={hueBarRef}
        role="slider"
        aria-label="Hue"
        aria-valuenow={Math.round(hsv.h)}
        aria-valuemin={0}
        aria-valuemax={360}
        className={styles.hueBar}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          handleHuePointer(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) {
            handleHuePointer(event);
          }
        }}
      >
        <div className={styles.hueThumb} style={{ left: `${(hsv.h / 360) * 100}%` }} />
      </div>

      <input
        type="text"
        value={hexInput}
        aria-label="Hex color"
        className={styles.hexInput}
        onChange={(event) => setHexInput(event.target.value)}
        onBlur={commitHexInput}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "Enter") {
            event.preventDefault();
            commitHexInput();
          }
        }}
      />
    </div>
  );
}

"use client"
import { styles } from "./LunoLogo.styles";

interface LunoLogoProps {
  size?: "sm" | "md" | "lg";
}

export default function LunoLogo({ size = "lg" }: LunoLogoProps) {
  return <h1 className={styles.logoText(size)}>LUNO</h1>;
}

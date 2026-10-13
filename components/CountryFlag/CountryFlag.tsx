import { cn } from "@/lib/utils";
import { getCountryName, getFlagUrl } from "./CountryFlag.helpers";
import { styles } from "./CountryFlag.styles";

interface CountryFlagProps {
  /** ISO 3166-1 alpha-2, e.g. "JP" */
  countryCode: string;
  className?: string;
}

/** SVG flag rather than emoji, since Windows doesn't render flag emoji. Sized to the surrounding text. */
export default function CountryFlag({ countryCode, className }: CountryFlagProps) {
  const countryName = getCountryName(countryCode);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny static SVG; next/image adds nothing here
    <img
      src={getFlagUrl(countryCode)}
      alt={countryName}
      title={countryName}
      className={cn(styles.flag, className)}
    />
  );
}

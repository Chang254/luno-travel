"use client";

import { ChevronsUpDown, MapPin, X } from "lucide-react";

import CountryFlag from "@/components/CountryFlag";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type CityPickerValue, type PickedCity, useCityPicker } from "./CityPicker.helpers";
import { styles } from "./CityPicker.styles";

interface CityPickerProps {
  /** Id for the trigger, so a `<label htmlFor>` can name it. */
  id?: string;
  /** Accessible name when there's no visible `<label>`. */
  "aria-label"?: string;
  value: CityPickerValue | null;
  onSelect: (city: PickedCity) => void;
  /** Shows a remove button while a city is set. */
  onClear?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

/** City combobox backed by Google Places autocomplete. */
export default function CityPicker({
  id,
  "aria-label": ariaLabel,
  value,
  onSelect,
  onClear,
  disabled,
  placeholder = "Where to?",
}: CityPickerProps) {
  const { open, setOpen, query, setQuery, suggestions, statusMessage, selectSuggestion } =
    useCityPicker(onSelect);

  return (
    <div className={styles.root}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-label={ariaLabel}
            aria-expanded={open}
            className={styles.trigger}
            disabled={disabled}
          >
            {value?.countryCode ? <CountryFlag countryCode={value.countryCode} /> : <MapPin />}
            {value ? (
              <>
                <span className={styles.value}>{value.name}</span>
                {value.detail && <span className={styles.detail}>{value.detail}</span>}
              </>
            ) : (
              <span className={styles.placeholder}>{placeholder}</span>
            )}
            <ChevronsUpDown className={styles.chevron} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={styles.content} align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Search cities…" value={query} onValueChange={setQuery} />
            <CommandList>
              {statusMessage && <p className={styles.status}>{statusMessage}</p>}
              {suggestions.length > 0 && (
                <CommandGroup>
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.placeId}
                      value={suggestion.placeId}
                      onSelect={() => selectSuggestion(suggestion)}
                    >
                      <MapPin />
                      <span className={styles.suggestion}>
                        <span>{suggestion.primaryText}</span>
                        <span className={styles.suggestionDetail}>{suggestion.secondaryText}</span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            <p className={styles.attribution}>Powered by Google</p>
          </Command>
        </PopoverContent>
      </Popover>
      {value && onClear && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClear}
          disabled={disabled}
          aria-label="Remove city"
        >
          <X />
        </Button>
      )}
    </div>
  );
}

"use client";

import { type KeyboardEvent, useId, useRef, useState } from "react";
import { MapPin } from "lucide-react";

import CountryFlag from "@/components/CountryFlag";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import {
  type CityPickerValue,
  type PickedCity,
  useActiveOptionId,
  useCityPicker,
} from "./CityPicker.helpers";
import { styles } from "./CityPicker.styles";

interface CityPickerProps {
  /** Id for the input, so a `<label htmlFor>` can name it. */
  id?: string;
  /** Accessible name when there's no visible `<label>`. */
  "aria-label"?: string;
  value: CityPickerValue | null;
  onSelect: (city: PickedCity) => void;
  /** Called when the input is emptied and left, or Enter is pressed while empty. */
  onClear?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * City combobox backed by the GeoNames city list: type into the input and
 * pick from the suggestions below it. A plain input (not cmdk's, which
 * overrides `id` and labelling) with cmdk handling list navigation.
 */
export default function CityPicker({
  id,
  "aria-label": ariaLabel,
  value,
  onSelect,
  onClear,
  disabled,
  placeholder = "Where to?",
}: CityPickerProps) {
  const {
    open,
    setOpen,
    inputValue,
    isEmptyQuery,
    changeQuery,
    commit,
    cancel,
    suggestions,
    statusMessage,
    selectSuggestion,
  } = useCityPicker({ value, onSelect, onClear });
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const popupId = useId();
  const [highlighted, setHighlighted] = useState("");
  const activeOptionId = useActiveOptionId(listRef, highlighted);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      cancel();
    } else if (event.key === "Enter" && isEmptyQuery) {
      // Handled here so cmdk doesn't swallow it; nothing to pick from an empty query.
      event.preventDefault();
      commit();
    } else if (event.key === "Home" || event.key === "End") {
      // Keep caret movement instead of cmdk jumping to the first/last option.
      event.stopPropagation();
    }
  };

  return (
    <Command
      className={styles.root}
      shouldFilter={false}
      value={highlighted}
      onValueChange={setHighlighted}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className={styles.field}>
            <span className={styles.icon}>
              {value?.countryCode ? <CountryFlag countryCode={value.countryCode} /> : <MapPin />}
            </span>
            <Input
              ref={inputRef}
              id={id}
              type="text"
              role="combobox"
              aria-label={ariaLabel}
              aria-expanded={open}
              aria-controls={open ? popupId : undefined}
              aria-autocomplete="list"
              aria-activedescendant={open ? activeOptionId : undefined}
              autoComplete="off"
              className={styles.input}
              value={inputValue}
              placeholder={placeholder}
              disabled={disabled}
              onChange={(event) => changeQuery(event.target.value)}
              onFocus={(event) => event.currentTarget.select()}
              onBlur={commit}
              onKeyDown={handleKeyDown}
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          className={styles.content}
          align="start"
          onOpenAutoFocus={(event) => event.preventDefault()}
          // Keeps focus in the input when an option is clicked.
          onMouseDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (event.target === inputRef.current) event.preventDefault();
          }}
        >
          <div id={popupId}>
            <CommandList ref={listRef}>
              {statusMessage && <p className={styles.status}>{statusMessage}</p>}
              {suggestions.length > 0 && (
                <CommandGroup>
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.geonameId}
                      value={String(suggestion.geonameId)}
                      className={styles.option}
                      onSelect={() => selectSuggestion(suggestion)}
                    >
                      <MapPin className={styles.optionIcon} />
                      <span className={styles.suggestion}>
                        <span>{suggestion.primaryText}</span>
                        <span className={styles.suggestionDetail}>{suggestion.secondaryText}</span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </div>
        </PopoverContent>
      </Popover>
    </Command>
  );
}

export const styles = {
    logoText: (size: "sm" | "md" | "lg" = "lg") => {
        const sizeClass =
            size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : "text-4xl";
        return `${sizeClass} font-bold font-cinzel text-espresso`;
    },
}

import { i18nObject as Dictionary } from "@/lib/locales/translation";

const d: Dictionary = {
    Marking: {
        Name: "Adnotacja",
        Keys: {
            id: "ID",
            label: "Znacznik",
            angleRad: "Kąt",
            origin: "Źródło",
            endpoint: "Koniec",
            type: {
                Name: "Typ",
                Keys: {
                    point: "Punkt",
                    ray: "Linia skierowana",
                    line_segment: "Odcinek",
                },
            },
            characteristicId: "ID charakterystyki",
        },
    },
    MarkingCharacteristic: {
        Name: "Cecha adnotacji",
        Keys: {
            id: "ID",
            name: "Nazwa",
            type: "Typ cechy",
        },
        Style: {
            Name: "Styl",
            Keys: {
                backgroundColor: "Kolor tła",
                textColor: "Kolor tekstu",
                size: "Rozmiar",
            },
        },
        Metadata: {
            Name: "Metadane",
            Keys: {
                category: "Kategoria",
            },
        },
    },
    PrerenderingRadius: {
        Name: "Promień pre-renderowania",
        Keys: {
            "very high": "Bardzo wysoki",
            high: "Wysoki",
            auto: "Auto (domyślny)",
            low: "Niski",
            medium: "Średni",
            none: "Brak",
        },
    },
    Theme: {
        Name: "Motyw",
        Keys: {
            system: "System",
            dark: "Ciemny",
            light: "Jasny",
        },
    },
};

export default d;

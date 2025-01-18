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
            markingClass: {
                Name: "Klasa Oznaczenia",
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
            displayName: "Nazwa Lokalna",
            characteristicName: "Cecha",
            markingClass: "Klasa Oznaczenia",
            category: "Kategoria",
            backgroundColor: "Kolor tła",
            textColor: "Kolor tekstu",
            size: "Rozmiar",
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

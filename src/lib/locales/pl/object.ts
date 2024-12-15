import { i18nObject as Dictionary } from "@/lib/locales/translation";

const d: Dictionary = {
    Marking: {
        Name: "Adnotacja",
        Keys: {
            id: "ID",
            label: "Znacznik",
            angleRad: "Kąt",
            backgroundColor: "Kolor tła",
            boundMarkingId: "ID powiązanej adnotacji",
            origin: "Źródło",
            size: "Rozmiar",
            textColor: "Kolor tekstu",
            type: {
                Name: "Typ",
                Keys: {
                    point: "Punkt",
                    ray: "Linia skierowana",
                },
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

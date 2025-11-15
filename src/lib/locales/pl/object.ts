import { i18nObject as Dictionary } from "@/lib/locales/translation";

const d: Dictionary = {
    Marking: {
        Name: "Adnotacja",
        Keys: {
            ids: "ID-y",
            label: "Znacznik",
            angleRad: "Kąt",
            origin: "Źródło",
            endpoint: "Koniec",
            markingClass: {
                Name: "Klasa adnotacji",
                Keys: {
                    point: "Punkt",
                    ray: "Linia skierowana",
                    line_segment: "Odcinek",
                    bounding_box: "Prostokąt (legacy)",
                    rectangle: "Prostokąt",
                    polygon: "Wielokąt",
                },
            },
            typeId: "ID typu",
        },
        Actions: {
            merge: {
                enabled: "Połącz adnotacje",
                disabled: "Nie można połączyć - znaleziono pasujące ID",
            },
        },
    },
    MarkingType: {
        Name: "Typ adnotacji",
        Keys: {
            id: "ID",
            displayName: "Nazwa lokalna",
            name: "Nazwa",
            markingClass: "Klasa adnotacji",
            category: "Kategoria",
            backgroundColor: "Kolor tła",
            textColor: "Kolor tekstu",
            size: "Rozmiar",
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

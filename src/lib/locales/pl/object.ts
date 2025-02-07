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
                Name: "Klasa adnotacji",
                Keys: {
                    point: "Punkt",
                    ray: "Linia skierowana",
                    line_segment: "Odcinek",
                    bounding_box: "Prostokąt",
                },
            },
            characteristicId: "ID charakterystyki",
        },
    },
    MarkingCharacteristic: {
        Name: "Cecha adnotacji",
        Keys: {
            id: "ID",
            displayName: "Nazwa lokalna",
            characteristicName: "Cecha",
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

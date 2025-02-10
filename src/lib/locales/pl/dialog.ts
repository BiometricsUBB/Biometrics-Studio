import { i18nDialog as Dictionary } from "@/lib/locales/translation";

const d: Dictionary = {
    "Are you sure you want to load this image?\n\nIt will remove the previously loaded image and all existing forensic marks.":
        "Czy na pewno chcesz załadować ten obraz?\n\nSpowoduje to usunięcie wcześniej załadowanego obrazu i wszystkich istniejących adnotacji śladów.",
    "Are you sure you want to load markings data?\n\nIt will remove all existing forensic marks.":
        "Czy na pewno chcesz załadować dane dotyczące adnotacji?\n\nSpowoduje to usunięcie wszystkich istniejących adnotacji śladów.",
    "The markings data was created with a different version of the application ({{version}}). Loading it might not work.\n\nAre you sure you want to load it?":
        "Dane dotyczące adnotacji zostały utworzone za pomocą innej wersji aplikacji ({{version}}). Ich załadowanie może nie działać.\n\nCzy na pewno chcesz je załadować?",
    "Marking types were exported from a different version of the application ({{version}}). Loading it might not work.\n\nAre you sure you want to load it?":
        "Typy adnotacji zostały wyeksportowane z innej wersji aplikacji ({{version}}). Ich załadowanie może nie działać.\n\nCzy na pewno chcesz je załadować?",
    "The imported marking types have conflicts with the existing ones:\n{{conflicts}}\n\nDo you want to overwrite them?":
        "Importowane typy adnotacji mają konflikty z istniejącymi:\n{{conflicts}}\n\nCzy chcesz je nadpisać?",
    "Overwrite marking types?": "Nadpisać typy adnotacji?",
    "The imported markings data contains types that are not present in the application. Would you like to:\n1. Automatically create default types for the missing ones?\n2. Cancel and manually import the types from a file?":
        "Importowane dane dotyczące adnotacji zawierają typy, które nie są obecne w aplikacji. Czy chcesz:\n1. Automatycznie utworzyć domyślne typy dla brakujących?\n2. Anulować i ręcznie zaimportować typy z pliku?",
    "Missing marking types detected": "Wykryto brakujące typy adnotacji",
    "The markings data was created with a different working mode ({{mode}}). Change the working mode to ({{mode}}) to load the data.":
        "Dane dotyczące adnotacji zostały utworzone w innym trybie pracy ({{mode}}). Zmień tryb pracy na ({{mode}}), aby załadować dane.",
    "Please select your working mode": "Proszę wybrać tryb pracy",
    "You are trying to load marking types for a non-existing working mode.":
        "Próbujesz załadować typy dla nieistniejącego trybu pracy.",
};

export default d;

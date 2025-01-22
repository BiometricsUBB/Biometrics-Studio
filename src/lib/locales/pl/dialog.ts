import { i18nDialog as Dictionary } from "@/lib/locales/translation";

const d: Dictionary = {
    "Are you sure you want to load this image?\n\nIt will remove the previously loaded image and all existing forensic marks.":
        "Czy na pewno chcesz załadować ten obraz?\n\nSpowoduje to usunięcie wcześniej załadowanego obrazu i wszystkich istniejących adnotacji śladów.",
    "Are you sure you want to load markings data?\n\nIt will remove all existing forensic marks.":
        "Czy na pewno chcesz załadować dane dotyczące adnotacji?\n\nSpowoduje to usunięcie wszystkich istniejących adnotacji śladów.",
    "The markings data was created with a different version of the application ({{version}}). Loading it might not work.\n\nAre you sure you want to load it?":
        "Dane dotyczące adnotacji zostały utworzone za pomocą innej wersji aplikacji ({{version}}). Ich załadowanie może nie działać.\n\nCzy na pewno chcesz je załadować?",
    "Marking characteristics were exported from a different version of the application ({{version}}). Loading it might not work.\n\nAre you sure you want to load it?":
        "Cechy adnotacji zostały wyeksportowane z innej wersji aplikacji ({{version}}). Ich załadowanie może nie działać.\n\nCzy na pewno chcesz je załadować?",
    "The imported marking characteristics have conflicts with the existing ones:\n{{conflicts}}\n\nDo you want to overwrite them?":
        "Importowane cechy adnotacji mają konflikty z istniejącymi:\n{{conflicts}}\n\nCzy chcesz je nadpisać?",
    "Overwrite marking characteristics?": "Nadpisać cechy adnotacji?",
    "The imported markings data contains characteristics that are not present in the application. Would you like to:\n1. Automatically create default characteristics for the missing ones?\n2. Cancel and manually import the characteristics from a file?":
        "Importowane dane dotyczące adnotacji zawierają cechy, które nie są obecne w aplikacji. Czy chcesz:\n1. Automatycznie utworzyć domyślne cechy dla brakujących?\n2. Anulować i ręcznie zaimportować cechy z pliku?",
    "Missing marking characteristics detected":
        "Wykryto brakujące cechy adnotacji",
    "The markings data was created with a different working mode ({{mode}}). Change the working mode to ({{mode}}) to load the data.":
        "Dane dotyczące adnotacji zostały utworzone w innym trybie pracy ({{mode}}). Zmień tryb pracy na ({{mode}}), aby załadować dane.",
    "Please select your working mode": "Proszę wybrać tryb pracy",
    "You are trying to load marking characteristics for a non-existing working mode.":
        "Próbujesz załadować charakterystyki dla nieistniejącego trybu pracy.",
};

export default d;

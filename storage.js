// =====================================
// IOB Tracker v7.5 RC1
// js/storage.js
// =====================================

// ---------- Storage Keys ----------

const STORAGE_KEY = "iob_entries";
const SETTINGS_KEY = "iob_settings";

// ---------- Load Entries ----------

function loadEntries() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {

        return [];
    }

    try {

        return JSON.parse(saved);

    } catch (e) {

        console.error("Unable to load entries", e);

        return [];

    }

}

// ---------- Save Entries ----------

function saveEntries(entries) {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(entries)

    );

}

// ---------- Add Entry ----------

function addEntry(entry) {

    const entries = loadEntries();

    entry.id = Date.now();

    entries.push(entry);

    saveEntries(entries);

}

// ---------- Update Entry ----------

function updateEntry(updatedEntry) {

    const entries = loadEntries();

    const index = entries.findIndex(

        e => e.id === updatedEntry.id

    );

    if (index >= 0) {

        entries[index] = updatedEntry;

        saveEntries(entries);

    }

}

// ---------- Delete Entry ----------

function deleteEntry(id) {

    const entries = loadEntries().filter(

        e => e.id !== id

    );

    saveEntries(entries);

}

// ---------- Settings ----------

function loadSettings() {

    const saved = localStorage.getItem(SETTINGS_KEY);

    if (!saved) {

        return {

            rapidDuration: 5,

            rapidName: "NovoRapid",

            longName: "Optisulin"

        };

    }

    try {

        return JSON.parse(saved);

    }

    catch {

        return {

            rapidDuration: 5,

            rapidName: "NovoRapid",

            longName: "Optisulin"

        };

    }

}

function saveSettings(settings) {

    localStorage.setItem(

        SETTINGS_KEY,

        JSON.stringify(settings)

    );

}

// ---------- Export ----------

function exportBackup() {

    const entries = loadEntries();

    const blob = new Blob(

        [

            JSON.stringify(

                entries,

                null,

                2

            )

        ],

        {

            type: "application/json"

        }

    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    const date = new Date()

        .toISOString()

        .slice(0,10);

    link.download = `IOB_Backup_${date}.json`;

    link.click();

}

// ---------- Import ----------

function importBackup(file) {

    const reader = new FileReader();

    reader.onload = function(event) {

        try {

            const imported = JSON.parse(

                event.target.result

            );

            if (!Array.isArray(imported)) {

                throw "Invalid";

            }

            saveEntries(imported);

            if (typeof refreshUI === "function") {

                refreshUI();

            }

            showToast("Backup imported");

        }

        catch {

            showToast("Import failed");

        }

    };

    reader.readAsText(file);

}
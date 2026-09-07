// =====================================
// IOB Tracker v7.5 RC1
// app.js
// =====================================

function refreshApplication() {
    if (typeof refreshUI === "function") refreshUI();
    if (typeof renderCalendar === "function") renderCalendar();
}

function saveRapid() {
    const insulin = document.getElementById("rapidType")?.value || "NovoRapid";
    const units = parseFloat(document.getElementById("rapidUnits")?.value);
    if (!units || units <= 0) {
        if (typeof showToast === "function") showToast("Please enter rapid insulin units.");
        return;
    }

    addEntry({
        type: "rapid",
        insulin,
        units,
        bg: document.getElementById("rapidBG")?.value || "",
        duration: parseFloat(document.getElementById("rapidDuration")?.value) || 5,
        note: document.getElementById("rapidNote")?.value.trim() || "",
        time: Date.now()
    });

    document.getElementById("rapidUnits").value = "";
    document.getElementById("rapidBG").value = "";
    document.getElementById("rapidNote").value = "";
    refreshApplication();
    if (typeof showToast === "function") showToast("Rapid dose saved");
}

function saveLong() {
    const insulin = document.getElementById("longType")?.value || "Optisulin";
    const units = parseFloat(document.getElementById("longUnits")?.value);
    if (!units || units <= 0) {
        if (typeof showToast === "function") showToast("Please enter long-acting units.");
        return;
    }

    addEntry({
        type: "long",
        insulin,
        units,
        time: Date.now()
    });

    document.getElementById("longUnits").value = "";
    refreshApplication();
    if (typeof showToast === "function") showToast("Long acting dose saved");
}

function closeEditModal() {
    const modal = document.getElementById("editModal");
    if (modal) modal.classList.add("hidden");
    window.editingCalendarId = null;
}

function saveEdit() {
    const id = window.editingCalendarId;
    if (!id) {
        if (typeof showToast === "function") showToast("No entry selected.");
        return;
    }

    const entry = loadEntries().find(e => e.id === id);
    if (!entry) {
        if (typeof showToast === "function") showToast("Entry not found.");
        return;
    }

    const units = parseFloat(document.getElementById("editUnits")?.value);
    if (!units || units <= 0) {
        if (typeof showToast === "function") showToast("Please enter valid units.");
        return;
    }

    entry.units = units;

    if (entry.type === "rapid") {
        entry.bg = document.getElementById("editBG")?.value || "";
        entry.duration = parseFloat(document.getElementById("editDuration")?.value) || 5;
        entry.note = document.getElementById("editNote")?.value.trim() || "";
    }

    updateEntry(entry);

    const date = new Date(entry.time);
    closeEditModal();
    refreshApplication();

    // Re-open the day detail with fresh data.
    if (typeof showDayEntries === "function") showDayEntries(date);

    if (typeof showToast === "function") showToast("Entry updated");
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("saveRapidBtn")?.addEventListener("click", saveRapid);
    document.getElementById("saveLongBtn")?.addEventListener("click", saveLong);
    document.getElementById("saveEditBtn")?.addEventListener("click", saveEdit);
    document.getElementById("cancelEditBtn")?.addEventListener("click", closeEditModal);
    document.getElementById("exportBtn")?.addEventListener("click", exportBackup);

    const importInput = document.getElementById("importFile");
    if (importInput) {
        importInput.addEventListener("change", () => {
            if (importInput.files?.length) importBackup(importInput.files[0]);
        });
    }

    refreshApplication();
});

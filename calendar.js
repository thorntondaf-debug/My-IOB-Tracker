// =====================================
// IOB Tracker v7.5 RC1
// calendar.js
// Calendar + Day Summary + Edit/Delete
// =====================================

function renderCalendar() {
    const calendar = document.getElementById("calendar");
    if (!calendar || typeof loadEntries !== "function") return;

    // 0 = current month, -1 = previous month, etc.
    if (typeof window.calendarMonthOffset !== "number") {
        window.calendarMonthOffset = 0;
    }

    calendar.innerHTML = "";

    const entries = loadEntries();
    const today = new Date();

    const displayedMonth = new Date(
        today.getFullYear(),
        today.getMonth() + window.calendarMonthOffset,
        1
    );

    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // =====================================
    // Month Navigation
    // =====================================

    const navigation = document.createElement("div");
    navigation.className = "calendarNavigation";

    const previousButton = document.createElement("button");
    previousButton.type = "button";
    previousButton.className = "calendarNavButton";
    previousButton.textContent = "‹ Previous";
    previousButton.setAttribute("aria-label", "Previous month");
    previousButton.addEventListener("click", () => {
        window.calendarMonthOffset--;
        renderCalendar();
    });

    const monthTitle = document.createElement("h3");
    monthTitle.className = "calendarMonthTitle";
    monthTitle.textContent = displayedMonth.toLocaleDateString("en-AU", {
        month: "long",
        year: "numeric"
    });

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "calendarNavButton";
    nextButton.textContent = "Next ›";
    nextButton.setAttribute("aria-label", "Next month");

    // Don't allow the user to move into future months.
    nextButton.disabled = window.calendarMonthOffset >= 0;

    nextButton.addEventListener("click", () => {
        if (window.calendarMonthOffset < 0) {
            window.calendarMonthOffset++;
            renderCalendar();
        }
    });

    navigation.appendChild(previousButton);
    navigation.appendChild(monthTitle);
    navigation.appendChild(nextButton);
    calendar.appendChild(navigation);

    // =====================================
    // Calendar Grid
    // =====================================

    const grid = document.createElement("div");
    grid.className = "calendarGrid";

    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(day => {
        const cell = document.createElement("div");
        cell.className = "calendarDay";
        cell.style.fontWeight = "bold";
        cell.textContent = day;
        grid.appendChild(cell);
    });

    for (let i = 0; i < startWeekday; i++) {
        const blank = document.createElement("div");
        blank.className = "calendarDay calendarEmpty";
        blank.setAttribute("aria-hidden", "true");
        grid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.className = "calendarDay";
        cell.textContent = day;

        const thisDate = new Date(year, month, day);

        if (thisDate.toDateString() === today.toDateString()) {
            cell.classList.add("calendarToday");
        }

        if (entries.some(entry =>
            new Date(entry.time).toDateString() === thisDate.toDateString()
        )) {
            cell.classList.add("calendarLogged");
        }

        cell.addEventListener("click", () => showDayEntries(thisDate));
        grid.appendChild(cell);
    }

    calendar.appendChild(grid);
}

function showDayEntries(date) {
    const modal = document.getElementById("dayModal");
    const title = document.getElementById("dayTitle");
    const list = document.getElementById("dayEntries");
    if (!modal || !title || !list || typeof loadEntries !== "function") return;

    title.textContent = date.toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const entries = loadEntries()
        .filter(entry => new Date(entry.time).toDateString() === date.toDateString())
        .sort((a,b) => b.time - a.time);

    let rapidTotal = 0, longTotal = 0, bgTotal = 0, bgCount = 0;

    entries.forEach(entry => {
        const units = Number(entry.units) || 0;
        if (entry.type === "rapid") {
            rapidTotal += units;
            if (entry.bg !== "" && entry.bg != null && !isNaN(Number(entry.bg))) {
                bgTotal += Number(entry.bg);
                bgCount++;
            }
        }
        if (entry.type === "long") longTotal += units;
    });

    const averageBG = bgCount ? (bgTotal / bgCount).toFixed(1) : "--";

    let html = `
        <div class="daySummary">
            <div class="summaryRow"><span>Rapid Total</span><strong>${rapidTotal.toFixed(1)} U</strong></div>
            <div class="summaryRow"><span>Long Acting</span><strong>${longTotal.toFixed(1)} U</strong></div>
            <div class="summaryRow"><span>Average BG</span><strong>${averageBG}</strong></div>
        </div>
        <hr>
        <h3>Entries</h3>
    `;

    if (!entries.length) {
        html += `<p>No entries for this day.</p>`;
    }

    entries.forEach(entry => {
        const time = new Date(entry.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        html += `
            <div class="activeDose">
                <div class="activeDoseTitle">${time}</div>
                <strong>${entry.units}U ${entry.insulin}</strong>
        `;

        if (entry.bg) html += `<div>BG: ${entry.bg}</div>`;
        if (entry.duration) html += `<div>Duration: ${entry.duration}h</div>`;
        if (entry.note) html += `<div>${entry.note}</div>`;

        html += `
                <div class="entryActions">
                    <button type="button" class="editEntryBtn" data-entry-id="${entry.id}">Edit</button>
                    <button type="button" class="deleteEntryBtn" data-entry-id="${entry.id}">Delete</button>
                </div>
            </div>
        `;
    });

    list.innerHTML = html;

    // Event listeners are attached after the HTML is inserted.
    list.querySelectorAll(".editEntryBtn").forEach(button => {
        button.addEventListener("click", () => {
            editCalendarEntry(Number(button.dataset.entryId));
        });
    });

    list.querySelectorAll(".deleteEntryBtn").forEach(button => {
        button.addEventListener("click", () => {
            deleteCalendarEntry(Number(button.dataset.entryId));
        });
    });

    modal.classList.remove("hidden");
}

function editCalendarEntry(id) {
    const entry = loadEntries().find(e => e.id === id);
    if (!entry) return;

    const editModal = document.getElementById("editModal");
    const editUnits = document.getElementById("editUnits");
    const editBG = document.getElementById("editBG");
    const editDuration = document.getElementById("editDuration");
    const editNote = document.getElementById("editNote");

    if (!editModal || !editUnits || !editBG || !editDuration || !editNote) {
        alert("Edit screen is not available yet.");
        return;
    }

    window.editingCalendarId = id;
    window.editingCalendarDate = new Date(entry.time);

    editUnits.value = entry.units ?? "";
    editBG.value = entry.bg ?? "";
    editDuration.value = entry.duration ?? "";
    editNote.value = entry.note ?? "";

    // Keep the day popup open underneath, but place the edit popup above it.
    editModal.style.zIndex = "1001";
    editModal.classList.remove("hidden");

    // Focus the first editable field so the modal opening is obvious.
    requestAnimationFrame(() => {
        editUnits.focus();
        editUnits.select();
    });
}

function deleteCalendarEntry(id) {
    const entry = loadEntries().find(e => e.id === id);
    if (!entry) return;

    if (!confirm(`Delete ${entry.units}U ${entry.insulin}?`)) return;

    deleteEntry(id);

    const date = new Date(entry.time);
    renderCalendar();
    showDayEntries(date);

    if (typeof refreshUI === "function") refreshUI();
    if (typeof showToast === "function") showToast("Entry deleted");
}

function closeDayModal() {
    const modal = document.getElementById("dayModal");
    if (modal) modal.classList.add("hidden");
}

window.renderCalendar = renderCalendar;
window.showDayEntries = showDayEntries;
window.editCalendarEntry = editCalendarEntry;
window.deleteCalendarEntry = deleteCalendarEntry;
window.closeDayModal = closeDayModal;

document.addEventListener("DOMContentLoaded", () => {
    const close = document.getElementById("closeDayBtn");
    if (close) close.addEventListener("click", closeDayModal);
});

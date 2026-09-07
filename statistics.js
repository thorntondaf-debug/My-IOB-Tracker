// =====================================
// IOB Tracker v7.5
// statistics.js
// =====================================

(function () {
    let selectedDays = 30;

    function getEntriesForPeriod(days) {
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        return (typeof loadEntries === "function" ? loadEntries() : [])
            .filter(entry => Number(entry.time) >= cutoff);
    }

    function updateStatistics() {
        const entries = getEntriesForPeriod(selectedDays);
        const bgValues = entries
            .map(e => Number(e.bg))
            .filter(v => Number.isFinite(v));

        const rapidTotal = entries
            .filter(e => e.type === "rapid")
            .reduce((sum, e) => sum + (Number(e.units) || 0), 0);

        const longTotal = entries
            .filter(e => e.type === "long")
            .reduce((sum, e) => sum + (Number(e.units) || 0), 0);

        const dayCount = Math.max(1, selectedDays);
        const avgBG = bgValues.length
            ? (bgValues.reduce((a, b) => a + b, 0) / bgValues.length).toFixed(1)
            : "--";

        const highBG = bgValues.length ? Math.max(...bgValues).toFixed(1) : "--";
        const lowBG = bgValues.length ? Math.min(...bgValues).toFixed(1) : "--";

        const set = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        set("statAvgBG", avgBG);
        set("statHighBG", highBG);
        set("statLowBG", lowBG);
        set("statBGCount", String(bgValues.length));
        set("statRapidDaily", `${(rapidTotal / dayCount).toFixed(1)} U`);
        set("statRapidTotal", `${rapidTotal.toFixed(1)} U`);
        set("statLongDaily", `${(longTotal / dayCount).toFixed(1)} U`);

        const range = document.getElementById("statsDateRange");
        if (range) {
            const start = new Date(Date.now() - (selectedDays - 1) * 24 * 60 * 60 * 1000);
            range.textContent = `${start.toLocaleDateString("en-AU")} – ${new Date().toLocaleDateString("en-AU")}`;
        }
    }

    function openStats() {
        const panel = document.getElementById("statsPanel");
        if (!panel) return;
        updateStatistics();
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
        document.body.classList.add("statsOpen");
    }

    function closeStats() {
        const panel = document.getElementById("statsPanel");
        if (!panel) return;
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
        document.body.classList.remove("statsOpen");
    }

    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("openStatsBtn")?.addEventListener("click", openStats);
        document.getElementById("closeStatsBtn")?.addEventListener("click", closeStats);

        document.querySelectorAll(".statsPeriod button").forEach(button => {
            button.addEventListener("click", () => {
                selectedDays = Number(button.dataset.period) || 30;
                document.querySelectorAll(".statsPeriod button").forEach(b => b.classList.remove("active"));
                button.classList.add("active");
                updateStatistics();
            });
        });
    });

    window.updateStatistics = updateStatistics;
})();

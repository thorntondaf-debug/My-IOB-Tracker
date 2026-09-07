// =====================================
// IOB Tracker v7.5 RC1
// dashboard.js
// =====================================

// ---------- Dashboard ----------

function refreshDashboard() {

    // Active Insulin
    document.getElementById("iobValue").textContent =
        getCurrentIOB().toFixed(2) + " U";

    // Countdown
    const mins = getCountdownMinutes();

    document.getElementById("countdown").textContent =
        mins > 0
            ? "Inactive in " + formatRemaining(mins)
            : "No active insulin";

    // Today's totals
    document.getElementById("todayRapid").textContent =
        getTodayRapidTotal().toFixed(1) + " U";

    document.getElementById("todayLong").textContent =
        getTodayLongTotal().toFixed(1) + " U";

    document.getElementById("lastBG").textContent =
        getLastBG();

    // Optisulin reminder
    const longDose = getLastLongDose();

    const reminder =
        document.getElementById("optisulinReminder");

    if (longDose) {

        reminder.textContent =
            "✓ " +
            longDose.insulin +
            " " +
            longDose.units +
            "U @ " +
            new Date(longDose.time)
                .toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });

    } else {

        reminder.textContent =
            "⚠ No Optisulin logged today";

    }

    renderActiveDoses();

}

// ---------- Active Dose Cards ----------

function renderActiveDoses() {

    const container =
        document.getElementById("activeDoses");

    container.innerHTML = "";

    const active =
        getActiveDoses();

    if (active.length === 0) {

        container.innerHTML =
            "<p>No active doses</p>";

        return;

    }

    active.forEach(entry => {

        const remaining =
            calculateRemaining(entry);

        const minsLeft =
            Math.max(
                0,
                Math.round(
                    (
                        (
                            entry.time +
                            entry.duration * 3600000
                        ) -
                        Date.now()
                    ) / 60000
                )
            );

        container.innerHTML += `
            <div class="activeDose">

                <div class="activeDoseTitle">

                    ${entry.units}U ${entry.insulin}

                </div>

                <div class="activeDoseRemaining">

                    ${remaining.toFixed(2)}U remaining

                </div>

                <div class="activeDoseTime">

                    ${formatRemaining(minsLeft)} left

                </div>

            </div>
        `;

    });

}

// ---------- Refresh Everything ----------

function refreshUI() {

    refreshDashboard();

    if (typeof renderCalendar === "function") {
        renderCalendar();
    }

}

// ---------- Live Updates ----------

// Update every second so the countdown feels live.
setInterval(refreshUI, 1000);
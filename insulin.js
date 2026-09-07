// =====================================
// IOB Tracker v7.5 RC1
// js/insulin.js
// =====================================

// ---------- Remaining Insulin ----------

function calculateRemaining(entry) {

    if (entry.type !== "rapid") {
        return 0;
    }

    const elapsedHours =
        (Date.now() - entry.time) / 3600000;

    if (elapsedHours >= entry.duration) {
        return 0;
    }

    const remainingFraction =
        1 - (elapsedHours / entry.duration);

    return entry.units * remainingFraction;
}

// ---------- Total Active Insulin ----------

function getCurrentIOB() {

    const entries = loadEntries();

    let total = 0;

    entries.forEach(entry => {

        total += calculateRemaining(entry);

    });

    return total;
}

// ---------- Countdown ----------

function getCountdownMinutes() {

    const entries = loadEntries();

    let latestExpiry = 0;

    entries.forEach(entry => {

        if (entry.type !== "rapid") {
            return;
        }

        const expiry =
            entry.time +
            (entry.duration * 3600000);

        if (expiry > latestExpiry) {
            latestExpiry = expiry;
        }

    });

    if (latestExpiry <= Date.now()) {
        return 0;
    }

    return Math.round(

        (latestExpiry - Date.now()) / 60000

    );
}

// ---------- Active Doses ----------

function getActiveDoses() {

    const entries = loadEntries();

    return entries

        .filter(entry => {

            return calculateRemaining(entry) > 0;

        })

        .sort((a, b) => b.time - a.time);

}

// ---------- Today's Rapid ----------

function getTodayRapidTotal() {

    const today = new Date().toDateString();

    return loadEntries()

        .filter(entry =>

            entry.type === "rapid" &&

            new Date(entry.time)
                .toDateString() === today

        )

        .reduce(

            (sum, entry) =>

                sum + Number(entry.units),

            0

        );

}

// ---------- Today's Long ----------

function getTodayLongTotal() {

    const today = new Date().toDateString();

    return loadEntries()

        .filter(entry =>

            entry.type === "long" &&

            new Date(entry.time)
                .toDateString() === today

        )

        .reduce(

            (sum, entry) =>

                sum + Number(entry.units),

            0

        );

}

// ---------- Last BG ----------

function getLastBG() {

    const rapid = loadEntries()

        .filter(entry =>

            entry.type === "rapid" &&

            entry.bg !== "" &&

            entry.bg != null

        )

        .sort((a, b) => b.time - a.time);

    if (rapid.length === 0) {

        return "--";

    }

    return rapid[0].bg;

}

// ---------- Optisulin Reminder ----------

function getLastLongDose() {

    const today = new Date().toDateString();

    const doses = loadEntries()

        .filter(entry =>

            entry.type === "long" &&

            new Date(entry.time)
                .toDateString() === today

        )

        .sort((a, b) => b.time - a.time);

    if (doses.length === 0) {

        return null;

    }

    return doses[0];

}

// ---------- Format Countdown ----------

function formatRemaining(minutes) {

    const hrs = Math.floor(minutes / 60);

    const mins = minutes % 60;

    return `${hrs}h ${mins}m`;

}
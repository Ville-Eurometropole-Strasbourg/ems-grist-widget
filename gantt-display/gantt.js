grist.ready({
  columns: [
    { name: "title", title: "Titre", type: "Text" },
    { name: "activity", title: "Activité" },
    { name: "startDate", title: "Date de début", type: "Date" },
    { name: "endDate", title: "Date de fin", type: "Date" },
  ],
  requiredAccess: "read table",
});

const title = document.getElementsByTagName("h1")[0];
const thead = document.getElementsByTagName("thead")[0];
const tbody = document.getElementsByTagName("tbody")[0];
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");

startDateInput.addEventListener("change", () => {
  renderGantt(gristData);
});
endDateInput.addEventListener("change", () => {
  renderGantt(gristData);
});

grist.onRecords((records, mappings) => {
  const mapped = grist.mapColumnNames(records);
  setDatePickers();
  let gristData = processGristData(mapped, mappings);
  title.innerText = gristData[0].title;
  renderGantt(gristData);
});

function setDatePickers() {
  let today = new Date();
  startDateInput.value = today.toISOString().split("T")[0];
  let inThreeMonths = new Date(today.setMonth(today.getMonth() + 3));
  endDateInput.value = inThreeMonths.toISOString().split("T")[0];
}

// Traitement des données Grist
function processGristData(records) {
  gristData = records.map((record) => {
    const title = record.title || "";
    const activity = record.activity || "";
    const startDate = record.startDate || null;
    const endDate = record.endDate || null;
    return {
      title: String(title).trim(),
      activity: String(activity).trim(),
      startDate: startDate,
      endDate: endDate,
    };
  });
  return gristData;
}

function renderGantt(data) {
  let dateLimits = getDateLimits(data);
  renderHeader(dateLimits);
  renderBody(dateLimits, data);
  renderActiveTasks(data);
}

function renderHeader(dateLimits) {
  let firstWeek = dateToIsoWeek(dateLimits.minDate).isoWeek;
  let lastWeek = dateToIsoWeek(dateLimits.maxDate).isoWeek;
  let firstMonth = getMondayFromDate(dateLimits.minDate).month;
  let lastMonth = dateLimits.maxDate.getMonth();
  let firstYear = dateLimits.minDate.getFullYear();
  let lastYear = dateLimits.maxDate.getFullYear();

  htmlHead = `<tr>
            <th scope="col" rowspan="2">Activité</th>
            <th scope="col" rowspan="2">Début</th>
            <th scope="col" rowspan="2">Fin</th>`;
  for (let year = firstYear; year <= lastYear; year++) {
    let starter = year == firstYear ? firstMonth : 0;
    let finisher = year == lastYear ? lastMonth : 11;
    for (let month = starter; month <= finisher; month++) {
      let firstDay =
        month == firstMonth ? getMondayFromDate(dateLimits.minDate).day : 1;
      htmlHead += `<th scope="col" colspan="${getIsoWeeksPerMonth(year, month, firstDay)}">${new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(new Date(0, month))}</th>`;
    }
  }

  htmlHead += `</tr><tr>`;

  for (let year = firstYear; year <= lastYear; year++) {
    let starter = year == firstYear ? firstWeek : 1;
    let finisher = year == lastYear ? lastWeek : getMaxWeeksInYear(year);

    for (let i = starter; i <= finisher; i++) {
      htmlHead += `<th scope="col">S${i}</th>`;
    }
  }
  htmlHead += `</tr>`;

  thead.innerHTML = htmlHead;
}

function renderBody(dateLimits, data) {
  let firstWeek = dateToIsoWeek(dateLimits.minDate).isoWeek;
  let lastWeek = dateToIsoWeek(dateLimits.maxDate).isoWeek;
  let firstYear = dateLimits.minDate.getFullYear();
  let lastYear = dateLimits.maxDate.getFullYear();
  let htmlBody = ``;

  for (const task of data) {
    htmlBody += `<tr id="${task.activity}">
                  <th scope="row">${task.activity}</th>
                  <th scope="row">${task.startDate}</th>
                  <th scope="row">${task.endDate}</th>`;
    for (let year = firstYear; year <= lastYear; year++) {
      let starter = year == firstYear ? firstWeek : 1;
      let finisher = year == lastYear ? lastWeek : getMaxWeeksInYear(year);

      for (let i = starter; i <= finisher; i++) {
        htmlBody += `<td class="week-${i}"></td>`;
      }
    }
    htmlBody += `</tr>`;
  }

  tbody.innerHTML = htmlBody;
}

function renderActiveTasks(data) {
  for (const task of data) {
    let startWeek = dateToIsoWeek(task.startDate).isoWeek;
    let endWeek = dateToIsoWeek(task.endDate).isoWeek;
    let row = document.getElementById(task.activity);
    for (let i = startWeek; i <= endWeek; i++) {
      let activeBloc = row.getElementsByClassName("week-" + i)[0];
      activeBloc?.classList.add("active");
    }
  }
}
function getDateLimits(data) {
  let minDate = new Date(startDateInput.value);
  let maxDate = new Date(endDateInput.value);
  return { minDate, maxDate };
}

function getMaxWeeksInYear(year) {
  // Une année a 53 semaines si le 1er janvier est un Jeudi (4)
  const jan1 = new Date(year, 0, 1);
  if (dateToIsoWeek(jan1).isoDay === 4) return 53;

  // ... ou si le 31 décembre est un Jeudi (4)
  const dec31 = new Date(year, 11, 31);
  if (dateToIsoWeek(dec31).isoDay === 4) return 53;

  return 52;
}

function getIsoWeeksPerMonth(year, month, day) {
  let firstIsoWeek = dateToIsoWeek(new Date(year, month, day));
  let lastIsoWeek = dateToIsoWeek(new Date(year, month + 1, 0));
  let countIsoWeeks = lastIsoWeek.isoWeek - firstIsoWeek.isoWeek;
  if (firstIsoWeek.isoWeek > 51) {
    countIsoWeeks = lastIsoWeek.isoWeek;
  }
  if (lastIsoWeek.isoWeek == 1) {
    countIsoWeeks = 53 - firstIsoWeek.isoWeek;
  }
  // - Si le premier jour est lundi (getDay() === 1), on compte une semaine complète.
  if (firstIsoWeek.isoDay == 1) {
    countIsoWeeks += 1;
  }
  return countIsoWeeks;
}

function getMondayFromDate(date) {
  const isoDate = dateToIsoWeek(date);
  const monday = isoWeekToDate(isoDate.isoYear, isoDate.isoWeek, 1);
  return monday;
}

function isoWeekToDate(year, week, day) {
  // 1. January 4th is always in ISO Week 1
  const date = new Date(year, 0, 4);

  const dayOfWeek = date.getDay();
  const dayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  date.setDate(date.getDate() + dayOffset);

  // 3. Add weeks and days (subtracting 1 because we are already on Day 1 of Week 1)
  const daysToAdd = (week - 1) * 7 + (day - 1);
  date.setDate(date.getDate() + daysToAdd);

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
}

function dateToIsoWeek(dateInput) {
  // Create a copy to avoid mutating the original date object
  const date = new Date(dateInput);

  // Set to midnight UTC to avoid timezone shift bugs
  date.setHours(0, 0, 0, 0);

  const dayNum = date.getDay();
  // Convert Sunday from 0 to 7 to match ISO standard
  const isoDay = dayNum === 0 ? 7 : dayNum;

  // 2. Change date to the Thursday of this week (Day 4)
  // The ISO year always matches the year of the week's Thursday.
  date.setDate(date.getDate() + 4 - isoDay);
  const isoYear = date.getFullYear();

  // 3. Find the first Thursday of that ISO year (Jan 4 is always in Week 1)
  const firstThursday = new Date(isoYear, 0, 4);
  const firstThursdayDayNum = firstThursday.getDay();
  const firstThursdayIsoDay =
    firstThursdayDayNum === 0 ? 7 : firstThursdayDayNum;
  firstThursday.setDate(firstThursday.getDate() + 4 - firstThursdayIsoDay);

  // 4. Calculate weeks between the two Thursdays
  const timeDifference = date.getTime() - firstThursday.getTime();
  const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
  const isoWeek = 1 + Math.round(daysDifference / 7);

  // 5. Format string with padding (e.g., Week 4 becomes "04")
  const paddedWeek = String(isoWeek).padStart(2, "0");

  return { isoYear, isoWeek, isoDay };
}

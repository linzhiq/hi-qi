const $ = require("jquery");
const moment = require("moment-timezone");

const getAvailability = () => {
  return {
    available: true,
    slot: {
      end: moment.tz([2020, 3, 25, 18, 0, 0, 0], 0).unix() * 1000
    }
  };
  // return {
  //   available: false,
  //   slot: {
  //     start: moment.tz([2020, 3, 25, 18, 0, 0, 0], 0).unix() * 1000,
  //     end: moment.tz([2020, 3, 25, 20, 0, 0, 0], 0).unix() * 1000
  //   }
  // };
};

const initTime = ($time, time) => {
  $time.empty();

  const $hour = $("<span>", { class: "hour" }).text("hh");
  const $colon = $("<span>", { class: "colon" }).text(":");
  const $minute = $("<span>", { class: "minute" }).text("mm");
  const $timezone = $("<span>", { class: "timezone" }).text("TZ");

  $time
    .append($hour)
    .append($colon)
    .append($minute)
    .append($timezone);

  setTime($time, time);
};

const setTime = ($time, time, flash = false) => {
  time = moment(time);

  if (!time) {
    return;
  }

  [$hour, $colon, $minute, $timezone] = [
    $time.find(".hour"),
    $time.find(".colon"),
    $time.find(".minute"),
    $time.find(".timezone")
  ];

  $hour.text(time.format("hh"));
  $minute.text(time.format("mm A"));
  flash && $colon.toggleClass("hidden");
  $timezone.text(time.format("z"));
};

const $timeStart = $(".time.start");
const $timeEnd = $(".time.end");

const updateAvailability = () => {
  const $availability = $(".availability");
  const availability = getAvailability();

  const $slotFree = $(".slot.free");
  const $slotBusy = $(".slot.busy");

  if (availability.available) {
    $availability.attr("data-available", "true");

    $slotBusy.hide();
    $slotFree.show();

    setTime(
      $timeEnd,
      moment.tz(availability.slot.end, 0).tz(moment.tz.guess())
    );
  } else {
    $availability.attr("data-available", "false");

    $slotBusy.show();
    $slotFree.hide();
  
    setTime(
      $timeStart,
      moment.tz(availability.slot.start, 0).tz(moment.tz.guess())
    );
    setTime(
      $timeEnd,
      moment.tz(availability.slot.end, 0).tz(moment.tz.guess())
    );
  }
};

const getCurrentTimeInET = () => moment().tz("America/New_York");

const $currentTime = $(".time.current");

initTime($currentTime, getCurrentTimeInET());
initTime($timeStart);
initTime($timeEnd);

updateAvailability();

setInterval(() => {
  setTime($currentTime, getCurrentTimeInET(), true);
}, 1000);

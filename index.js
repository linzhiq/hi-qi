const $ = require("jquery");
const moment = require("moment-timezone");

const getAvailability = callback => {
  $.get("/cal", data => {
    callback(data);
  });
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
  getAvailability(availability => {
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
  });
};

const getCurrentTimeInET = () => moment().tz("America/New_York");

const $currentTime = $(".time.current");

initTime($currentTime, getCurrentTimeInET());
initTime($timeStart);
initTime($timeEnd);

setInterval(() => {
  setTime($currentTime, getCurrentTimeInET(), true);
}, 1000);

updateAvailability();

setTimeout(() => {
  setInterval(() => {
    setTime($currentTime, getCurrentTimeInET(), true);
  }, 1000 * 60); // Check calendar again every minute
}, Math.min(0, 1000 * (60 - moment().second() + 1))); // align intervals to exact minutes and give a one-second buffer
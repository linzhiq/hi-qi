const $ = require("jquery");
const moment = require("moment-timezone");

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
  $timezone.text(time.format('z'));
};

const getCurrentTimeInET = () => moment().tz("America/New_York");

const $currentTime = $(".time#current");

initTime($currentTime, getCurrentTimeInET());

setInterval(() => {
  setTime($currentTime, getCurrentTimeInET(), true);
}, 1000);
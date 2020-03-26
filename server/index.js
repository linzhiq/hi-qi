const express = require("express");
const moment = require("moment");
const app = express();
const { google } = require("googleapis");

require("dotenv").config();
const credentials = JSON.parse(
  new Buffer(process.env.CREDENTIALS, "base64").toString("ascii")
);
const token = JSON.parse(
  new Buffer(process.env.TOKEN, "base64").toString("ascii")
);

const { client_secret, client_id, redirect_uris } = credentials.installed;
const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
auth.setCredentials(token);
const calendar = google.calendar({ version: "v3", auth });

app.get("/", (req, res) => {
  console.log("Hello world received a request.");

  const target = process.env.TARGET || "World";
  res.send(`Hello ${target}!`);
});

app.get("/cal", (req, res) => {
  res.set('Cache-Control', 'no-cache, public, max-age=0, s-maxage=0');
  
  calendar.calendarList.list((err, listData) => {
    const calendars = listData.data.items.filter(cal => cal.selected);
    const calendarIds = calendars.map(cal => cal.id)
    
    const buffer = 15; // Show as unavailable 15 minutes after events
    const now = moment();
    const queryStart = moment(now).subtract(buffer, "minute");
    const queryEnd = moment(now).add(2, "day");

    calendar.freebusy.query(
      {
        requestBody: {
          timeMin: queryStart,
          timeMax: queryEnd,
          items: calendarIds.map(id => ({
            id: id
          }))
        }
      },
      (err, freebusyData) => {
        console.log(err, freebusyData);
        
        const calBusy = Object.values(freebusyData.data.calendars).map(cal => cal.busy);
        const combinedBusy = [].concat(...calBusy);
        combinedBusy.sort((b1, b2) => b1.start.localeCompare(b2.start));
        
        console.log(combinedBusy);
        
        let [busy, busyUntil] = [false, queryStart];
        let [freeEnd] = [queryEnd];
        
        for (let slot of combinedBusy) {
          let [start, end] = [moment(slot.start), moment(slot.end)];
          
          if (start < busyUntil && end > busyUntil) {
            // Currently busy or extending busy slot
            busy = true;
            busyUntil = moment.max(end, busyUntil);
          }
        }
        for (let slot of combinedBusy) {
          let [start, end] = [moment(slot.start), moment(slot.end)];
          
          if (start > busyUntil) {
            // Event in the future
            freeEnd = moment.min(start, freeEnd);
          }
        }
  
        res.json({
          available: !busy,
          slot: {
            start: busyUntil,
            end: freeEnd
          }
        });
      }
    );
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Hello world listening on port", port);
});

# Privacy Policy

**Last updated:** 27 September 2026

This policy explains what the **Boreas** app does with data. It is published by
**Kiet Le**, an individual developer, who is the data controller for
the limited processing described here.

## The short version

We run no servers and we receive no data from you. Boreas talks only to the
server address you type in, and everything it stores stays on your device. Only one
exception leaves your device and is described below: push notifications go
through Google.

## 1. What stays on your device

The App stores the following on the device, and nowhere else:

| Stored value             | What it is                                 | Why                                        |
| ------------------------ | ------------------------------------------ | ------------------------------------------ |
| `boreas-server`          | The server address you entered             | so the App reconnects without asking again |
| `boreas-token`           | Your session token for that server         | to stay signed in                          |
| `boreas-theme`           | Light, dark or automatic                   | for appearance                             |
| `boreas-log-level`       | How much the App logs to the console       | only if set by hand, for troubleshooting   |
| `boreas-welcomed`        | Whether you finished the intro             | so it is not shown twice                   |
| `boreas-pins`            | Projects you pinned to the sidebar         | to keep them there                         |
| `boreas-recent-tasks`    | The last five tasks you opened from Search | to offer them again                        |
| `boreas-monitor`         | Last CPU, memory and network samples       | to draw the chart before new data arrives  |
| `boreas-live-folded`     | Whether you folded or opened Home's chart  | to keep it that way next time              |
| `boreas-push`            | Whether you enabled notifications          | to remember your choice                    |
| `boreas-push-registered` | Whether the device registered for push     | to avoid registering twice                 |

Uninstalling the App removes all of it.

## 2. What goes to your own server

When you sign in and use the App, it sends requests to the server address you
chose. That traffic contains your username and password at sign-in, your
session token afterwards, and whatever you do in the App — creating tasks,
editing environment variables, reading logs.

That server is yours. We have no access to it, and this policy does not cover
what it logs or stores. If you did not set it up yourself, ask whoever did.

## 3. Push notifications (Google)

If you turn on notifications, the App registers with **Firebase Cloud
Messaging**, a Google service, and receives a device push token. That token is
sent to your Boreas server so it can deliver alerts to your device.

- Google receives the push token and technical information about the device as
  part of operating the service. See Google's privacy policy at
  <https://policies.google.com/privacy>.
- Notification content is composed by your server, not by us.
- You can turn notifications off at any time in **Settings**, or in your
  device's system settings. Turning them off stops the registration.

## 4. What we do not do

- We do not collect analytics, telemetry, crash reports, or usage statistics.
- We do not use advertising or tracking of any kind.
- We do not sell or share personal data, because we do not receive any.
- We do not have accounts. Accounts exist only on your server.

## 5. Children

Boreas is a tool for operating server infrastructure. It is not directed at
children and we do not knowingly collect data from anyone.

## 6. Your rights

Because the data described in section 1 never leaves your device, you control
it directly: signing out removes your session token, and uninstalling the App
removes all of it.

## 7. Data on your own server

If you operate a Boreas server for other people, **you** are the controller of
the data on it, including the push tokens their devices send you. Your own
privacy obligations apply to that data.

## 8. Changes

We may update this policy. The current version always ships inside the App and
is published at <https://boreas.zenkiet.dev/legal/privacy>. The date at the top
tells you when it last changed.

## 9. Contact

**Zen Le** — **zenkiet0906@gmail.com**

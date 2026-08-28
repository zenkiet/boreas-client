# Help

## Connecting to a server

Boreas does not come with a server. On first launch it asks for the address of
the Boreas server you want to manage — for example `https://boreas.example.com`
or `http://localhost:8080` while developing.

The address is checked against the server's health endpoint before it is saved,
so a typo is caught immediately rather than at sign-in.

To point the app somewhere else, open **Settings › Server › Change server**.
Switching servers signs you out of the current one.

## Signing in

Accounts live on the server, not with us. Ask whoever runs your server for a
username and password. There is no self-registration and no password reset in
the app — an administrator resets passwords from **Settings › Users**.

## Tasks

A task is one container. From a task you can:

- **Start / Stop / Restart** it, from the row's swipe actions, the long-press
  menu, or the task page.
- **Open** it, which loads the task's proxy URL in your browser.
- **Edit** its image, port, description, and environment variables.
- Set a **dev status** — Ready, In progress, or Blocked — by tapping the status
  row. Project and home screens sort by it, most urgent first.
- Write a **note** in Markdown: headings, lists, quotes, links, and inline code.

Some changes need the container rebuilt. When that happens the task shows
_"Changes are waiting for a container recreate"_ — they apply on the next start
or restart.

## Environment variables

The Environment tab has two views of the same data:

- **List** shows each variable as a row. Values whose names look secret
  (`TOKEN`, `PASSWORD`, `KEY`, and similar) are masked until you reveal them.
- **Raw** is a `.env` text editor, which is also where **Import .env** puts a
  file you pick.

Edits are only sent when you tap **Apply environment**. Until then the tab
carries a dot to remind you there is an unsaved draft.

## Logs

The Logs tab streams the container's output live. You can filter lines, toggle
wrapping, and download the buffer as a file. If the stream shows
_"disconnected"_, the container is not running or the server dropped the
connection — the app reconnects on its own when it comes back.

## Notifications

Turn them on in **Settings › Notifications**. The device registers with the
server, which then pushes deploy alerts to it.

If notifications do not arrive:

1. Check that the switch in Settings is still on.
2. Check your device's system notification settings for Boreas.
3. Confirm the server can reach Firebase and has push configured.
4. Sign out and back in — this re-registers the device.

Alerts also appear in the **Alerts** tab whether or not push is enabled.

## API tokens

**Settings › Your API tokens** creates tokens for scripts and CI. A token is
shown once, at creation. Copy it then; it cannot be retrieved afterwards, only
revoked and replaced.

## Where your data lives

Everything the app stores is on your device: the server address, your session
token, and a few preferences. Nothing is sent anywhere except the server you
chose. The full list is in the **Privacy Policy**.

## Reporting a problem

Open **Settings › About › Report a problem**
and describe what you did and what happened instead. The diagnostics carry the
app version, build, server address, and platform — no credentials.

## Contact

**Zen Le** — **zenkiet0906@gmail.com**

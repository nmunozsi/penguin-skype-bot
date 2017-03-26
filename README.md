🐧 Penguin Skype Bot
====================

![Penguin](https://uitraining.zemoga.com/penguin-report/images/penguin-icon.png)

![Build Status](http://jenkins.zemoga.com/jenkins/buildStatus/icon?job=zemoga-training/penguin/penguin-bot-ci)
[![Code Climate](https://codeclimate.com/github/andreszorro/penguin-skype-bot/badges/gpa.svg)](https://codeclimate.com/github/andreszorro/penguin-skype-bot)
[![Issue Count](https://codeclimate.com/github/andreszorro/penguin-skype-bot/badges/issue_count.svg)](https://codeclimate.com/github/andreszorro/penguin-skype-bot)
[![Known Vulnerabilities](https://snyk.io/test/github/andreszorro/penguin-skype-bot/badge.svg)](https://snyk.io/test/github/andreszorro/penguin-skype-bot)
---

Talk with **Penguin** and see who has not reported hours yet!

This bot is built using [Microsoft Bot Framework](https://dev.botframework.com/).

🛠 Developing
-------------

You can fork this repository and submit Pull Requests here. `master` branch is built
automatically on every new PR merge.
You will need an `.env` file, in which you can store local development variables.
The file looks like this:

```

APP_ID=<Microsoft Bot Framework App Id>
APP_ID=<Microsoft Bot Framework App Password>
ENV=local
LOG_LEVEL=<Log Level>

```

Please ask @andreszorro for Bot Framework APP ID and APP PWD for local development.

Start your local development environment running `npm start`.
Alternatively you can run `YOUR_ENV_VARS=here node .`.

On local development, you can interact with the bot using your command line interface.
The bot will respond to messages over the CLI.

🐜 Debugging
-----------

This project uses `debug`. You can run `DEBUG=* node .` to get all output stream.
But it can get noisy. Use `LOG_LEVEL` environment variable instead.

**Log Levels:** Choose from `trace`, `log`, `info`, `warn`, `error`.

---

☝️ Contributing
--------------

We're keeping track of ideas [here](https://github.com/andreszorro/penguin-skype-bot/projects/1).
You can grab one from there and make it an issue (to keep track of work)
or create new ones. Submit yours!

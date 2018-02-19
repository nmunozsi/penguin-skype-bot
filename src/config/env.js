module.exports = Object.assign({
    ENV: 'local',
    SERVER_PORT: 3004,
    LOG_LEVEL: 'log',
    DATE_FORMAT: 'YY/MM/DD HH:mm:ss',
    HOLIDAYS_API_URL: 'https://habitual-skull.glitch.me/holidays',
    PENGUIN_REPORT_API: 'https://uitraining.zemoga.com/penguin-report/api?department=PMO',
    PENGUIN_REPORT_URL: 'https://uitraining.zemoga.com/penguin-pmo-report',
    DB_NAME: 'penguin-bot-db',
    DB_PATH: '.'
}, process.env);

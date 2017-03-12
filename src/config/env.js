module.exports = Object.assign({
    ENV: 'local',
    PORT: 3978,
    LOG_LEVEL: 'log',
    DATE_FORMAT: 'YY/MM/DD HH:mm:ss',
    HOLIDAYS_API_KEY: '01ca9cd6-d676-4c60-93df-a2cfffb29c2a',
    HOLIDAYS_API_URL: 'https://holidayapi.com/v1/holidays',
    PENGUIN_REPORT_API: 'http://localhost:3000/api',
    PENGUIN_REPORT_URL: 'http://localhost:3000/'
}, process.env);

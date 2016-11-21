const { isEmpty } = require("lodash");
const { load } = require("cheerio");

const TESTERS = {
    links (msg) {
        const text = load(msg.text).text();
        return text.split(" ").reduce((arr, w) => {
            if (/^https?:\/\/.*/.test(w) && !/penguin-report/.test(w)) {
                arr.push({
                    sharedBy: msg.user.id,
                    sharedAt: msg.timestamp,
                    sharedOn: msg.address.conversation.id,
                    link: w,
                    type: /.*\.(jpe?g|gif|png|webp|bmp)$/.test(w) ? "image" : "link"
                });
            }
            return arr;
        }, []);
    }
}

module.exports = function (msg) {
    return Object.keys(TESTERS).reduce((results, next) => {
        const testRun = TESTERS[next](msg);

        if (!testRun || !testRun.length) {
            return results;
        }

        return Object.assign(results, { [next] : testRun });
    }, {});
};

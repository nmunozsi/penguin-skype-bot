const { isEmpty } = require("lodash");

const TESTERS = {
    links (msg) {
        return msg.text.split(" ").reduce((arr, w) => {
            if (/^https?:\/\/.*/.test(w)) {
                arr.push({
                    sharedBy: msg.user.id,
                    sharedAt: msg.timestamp,
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

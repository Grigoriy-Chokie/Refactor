const fs = require('fs');
const os = require('os');
const chalk = require('chalk');
const child_process = require('child_process');
const process = require('process');
const open = require('open');
const { tokens } = require('@shopify/polaris-tokens');

info("Theme checker v1");

log("Running Shopify theme check...");

let fileCache = {};

function debug(...msg) {
    console.log(chalk.gray(...msg));
}

function log(...msg) {
    console.log(chalk.white(...msg));
}

function info(...msg) {
    console.info(chalk.green(...msg));
}

function warn(...msg) {
    console.warn(chalk.yellow(...msg));
}

function error(...msg) {
    console.error(chalk.red.bold(...msg));
}

function readFileFromCache(filename) {
    if (fileCache[filename]) {
        return fileCache[filename];
    } else {
        let content = fs.readFileSync(filename, {
            encoding: 'utf8',
            flag: 'r'
        })

        fileCache[filename] = content;
        debug("Processing file", filename);
        return content;
    }
}

if (!process.argv.includes('--nolive')) {
    const httpServer = child_process.exec('npx http-server . -p 8080')
}

const child = child_process.exec('theme-check -o json dist > results.json')

child.stdout.pipe(process.stdout)
child.on('exit', function() {
    log("Analyzing output...");

    let totalOffenses = { errors: 0, suggestions: 0, codestyles: 0 };
    let rawdata = fs.readFileSync('results.json');
    let data = JSON.parse(rawdata);
    let html = /* html */ `
        <!DOCTYPE HTML>
        <html>
            <head>
                <meta charset="utf-8">
                <title>Theme check results</title>
                <script src="https://cdn.socket.io/4.5.0/socket.io.min.js" integrity="sha384-7EyYLQZgWBi67fBtVxw60/OWl1kjsfrPFcaU0pp0nAh+i8FD068QogUvg85Ewy1k" crossorigin="anonymous"></script>
            </head>
            <body>
    `;

    log("Generating HTML file...");

    html += /* html */ `
        <style>
            html {
                box-sizing: border-box;
            }

            *,
            *::before,
            *::after {
                box-sizing: inherit;
            }

            html, body, h1, h2, h3, h4, h5, h6 {
                margin: 0;
                padding: 0;
            }

            body {
                font-family: ${tokens.typography['font-family-sans'].value};
                font-size: ${tokens.typography['font-size-3'].value};
                max-width: 1200px;
                margin: 20px auto;
                background: #fafafa;
            }

            pre {
                border: 1px solid #ccc;
                overflow-x: auto;
                margin: 0;
                position: relative;
                scrollbar-width: thin;
            }

            pre code {
                padding: 4px;
            }

            pre code.active {
                background: #f5deb3;
            }

            pre code .highlight {
                background: #ff9090;
                padding: 4px 2px;
            }

            .line-num {
                width: 50px;
                display: inline-block;
                border-right: 1px solid #ccc;
                background: #f1f1f1;
                padding: 4px 8px 4px 12px;
                position: sticky;
                left: 0;
            }

            .line-num.active {
                display: inline-block;
                background: #f5deb3;
                color: #372502;
                border: none;
            }

            .rerun-btn {
                display: flex;
                padding: 8px;
                line-height: 24px;
                background: #2196f3;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                color: #fff;
                font-weight: 600;
            }

            .rerun-btn.loading {
                background: #64b1ee;
                cursor: default;
            }

            .rerun-btn img {
                margin-right: 8px;
            }

            .rerun-btn.loading img {
                animation: 1s linear rotate infinite;
            }

            @keyframes rotate {
                to {
                    transform: rotate(360deg);
                }
            }

            .card {
                border-radius: 8px;
                background: #ffffff;
                box-shadow: ${tokens.depth['shadow-card'].value};
                outline: ${tokens.shape['border-width-1'].value} solid transparent;
                padding: 20px;
                margin-top: 20px;
            }

            .card .title {
                font-size: ${tokens.typography['font-size-5'].value};
                font-weight: ${tokens.typography['font-weight-semibold'].value};
                line-height: ${tokens.typography['line-height-3'].value};
            }

            .card .content {
                width: 100%;
                display: inline-flex;
                flex-wrap: wrap;
                padding-top: 4px;
                font-size: 1em;
                margin: 0;
            }

            details {
                width: fit-content;
                margin-top: 16px;
                margin-right: 16px;
            }

            details[open] {
                width: 100%;
                flex-grow: 1;
            }

            details summary {
                cursor: pointer;
            }

            details[open] summary {
                width: 100%;
            }

            .summary {
                display: flex;
                font-weight: ${tokens.typography['font-weight-semibold'].value};
                padding: 8px;
                box-shadow: ${tokens.depth['shadow-button'].value};
                border-radius: ${tokens.shape['border-radius-1'].value};
                border: ${tokens.shape['border-width-1'].value} solid black;
                border-top-color: var(--p-border-subdued);
                border-bottom-color: var(--p-border-shadow-subdued);
                width: fit-content;
                line-height: 24px;
            }

            .offense {
                padding: 8px;
                margin-top: 24px;
                margin-bottom: 8px;
            }

            .offense:nth-child(even) {
                background: #f1f1f1;
            }

            .errors summary {
                color: #f44336;
                border-color: #f44336;
            }

            .errors .offense {
                background: #ffdfdf;
            }

            .suggestions summary {
                color: #2196f3;
                border-color: #2196f3;
            }

            .suggestions .offense {
                background: #cfe6ff
            }

            .codestyle summary {
                color: #F9A825;
                border-color: #F9A825;
            }

            .codestyle .offense {
                background: #fff3d0
            }
        </style>
    `;

    html += /* html */ `
        <h1 style="display: flex">
            Theme check results (${new Date().toLocaleString()})
            <div style="flex-grow: 1"></div>
            <button class="rerun-btn js-rerun-btn" type="button">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAV1BMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////+ORg7oAAAAHHRSTlMA7vOZgA2/JOPXrXU8JhMK2MJEp0VDNSyPiYMpyODrPgAAAJ1JREFUKM+1kUkWgzAMQ+NMQIBAoEAH3f+cXcQlQ7ssWun529ZLLP6vm5ql7NRSlccAlm3y+kBo+9GbQRNoyPoJq4nWO1CaCVhTl4M9c9GaBEyLja1Cnwf2UOxmjDk40LGTMDmYIE8wpbKOz3nGVbuoyIPDtSjJPboF5AuiPs7CiZ9qCI7zvdVfn3hMZtcE2RQzFqzwqtZtqouHukBvJSoJaui/60UAAAAASUVORK5CYII=" />
                <span class="msg">Check theme again</span>
            </button>
        </h1>
    `;

    html += /* html */ `
        <script>
            const socket = io("ws://localhost:3214");

            socket.emit("connected", {});

            socket.on("reload", (...args) => {
                location.reload();
            });

            const rerunBtn = document.querySelector(".js-rerun-btn");
            rerunBtn && rerunBtn.addEventListener("click", function (event) {
                rerunBtn.disabled = true;
                rerunBtn.classList.add("loading");
                rerunBtn.querySelector("span.msg").innerHTML = "Please wait, running check...";
                socket.emit("rerun", {});
            });
        </script>
    `;

    html += /* html */ `
        <b>
            Total files: ${data.length}
            <br/>Errors: %1%
            <br/>Suggestions: %2%
            <br/>Code style: %3%
        </b>
    `;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * String.prototype.replaceAll() polyfill
     * https://gomakethings.com/how-to-replace-a-section-of-a-string-with-another-one-with-vanilla-js/
     * @author Chris Ferdinandi
     * @license MIT
     */
    if (!String.prototype.replaceAll) {
        String.prototype.replaceAll = function(str, newStr){

            // If a regex pattern
            if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
                return this.replace(str, newStr);
            }

            // If a string
            return this.replace(new RegExp(str, 'g'), newStr);

        };
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
    
    function insertAt(str, sub, pos) { 
        return `${str.slice(0, pos)}${sub}${str.slice(pos)}`
    }

    function renderOffense(file, offense) {
        const fileLines = readFileFromCache("./dist/" + file.path).toString().split(os.EOL); //fs.readFileSync("./dist/" + file.path).toString().split(os.EOL);
        const lineNumber = offense.start_row;
        const rawLineContent = fileLines[offense.start_row];
        let lineContent = insertAt(rawLineContent, "<span class='highlight'>", offense.start_column);
        lineContent = insertAt(lineContent, "</nespan>", offense.end_column + ("<span class='highlight'>".length));

        lineContent = escapeHtml(lineContent);

        lineContent = lineContent.replaceAll("&lt;span class=&#039;highlight&#039;&gt;", "<span class='highlight'>");
        lineContent = lineContent.replaceAll("&lt;/nespan&gt;", "</span>");
        const prevLineContent = fileLines[offense.start_row - 1] || "";
        const nextLineContent = fileLines[offense.start_row + 1] || "";

        return `
            <p class="offense">
                <b>Line ${+lineNumber + 1} | Column ${+offense.start_column + 1}</b>
                <br/>
                <b>${offense.check}:</b> ${offense.message}
                <pre><span class="line-num">${+lineNumber + 0}</span><code>${escapeHtml(prevLineContent)}</code>
<span class="line-num active">${+lineNumber + 1}</span><code class="active">${lineContent}</code>
<span class="line-num">${+lineNumber + 2}</span><code>${escapeHtml(nextLineContent)}</code></pre>
            </p>
        `;
    }

    data.forEach(file => {
        html += /* html */`
            <section class="card">
                <h2 class="title">${file.path}</h2>
                <div class="content">
                    ${
                        file.errorCount > 0
                        ?
                        /* html */ `<details class="details errors">
                            <summary class="summary">
                                <img style="margin-right: 8px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAANlBMVEUAAAD0Qjb0RTX0Qjb/UTP0Qzb1Qzb1QzbzQjXzQjbyRjP0RDX0Qzb0Qzf0QzX0RDbzRDj0Qzasz1PeAAAAEXRSTlMA6izXBVLz3VZCKIukjKemQLt9MyMAAACJSURBVCjPnVFREoUgCERR05ev4v6XrSUra4Y+2g9n2IVFgD4j5IlT4jmHOx8HaRhin/6XDuNVBL5XTh95IDYj+PPiQLnC6LObZTCFvNt4TwVRVmESUern9EFUVWBpivcoA1iFJIeCfEUyhXer2WhufrcNWG4D2it5XyKF0Vi7eSg9bcVpawz0FSvGAQ/5Ogq5/AAAAABJRU5ErkJggg==" />
                                ${file.errorCount > 0 ? file.errorCount + (file.errorCount > 1 ? " errors" : " error") : "No errors"}
                            </summary>
                            <div class="details-content">
                                ${file.offenses.filter(x => x.severity == 0).map(offense => {totalOffenses.errors++; return renderOffense(file, offense)}).join("")}
                            </div>
                        </details>`
                        :
                        ""
                    }
                    
                    ${
                        file.suggestionCount > 0
                        ?
                        /* html */ `<details class="details suggestions">
                            <summary class="summary">
                                <img style="margin-right: 8px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYBAMAAAASWSDLAAAAMFBMVEUAAAAhlvQglvQhlvMglvMhlvMqqv8gl/MhlvIhl/QglfIAjv8hlfMzmf8hlvIhlvP5zGOZAAAAD3RSTlMA89zYVlMGpoyJTwKkBaNsWt7EAAAAd0lEQVQY02PAC9jcDYVLEqCcoP9AoAph7/gPBt1gTj+E8xPEZv0PBQuAnCQg/YEfSKgBOf4wzhcgpx6m7A+QYw/jfAZy5GHKPqJz7MEcqLJ6GOcfstFfgZxLcEtRnIPuUIadEM5siIcWgdhaUJ/y+hgKH72AN2QAgqmO13OeQqgAAAAASUVORK5CYII=" />
                                ${file.suggestionCount > 0 ? file.suggestionCount + (file.suggestionCount > 1 ? " suggestions" : " suggestion") : "No suggestions"}
                            </summary>
                            <div class="details-content">
                                ${file.offenses.filter(x => x.severity == 1).map(offense => {totalOffenses.suggestions++; return renderOffense(file, offense)}).join("")}
                            </div>
                        </details>`
                        :
                        ""
                    }

                    ${
                        file.styleCount > 0
                        ?
                        /* html */ `<details class="details codestyle">
                            <summary class="summary">
                                <img style="margin-right: 8px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAXVBMVEUAAAD/wQf/wQf/wQf/wQf/wgf/wQf/wQb/wQf/wQf/wQf/wQj/wAf/wgb/wgf/wgj/wAX/vgj/wgv/wwD/vwD/vwD/wQf/wQj/wQj/wQj/wQf/wAf/xAf/vwf/wQd7dfU/AAAAHnRSTlMA+vXx6OLaw7ibjoBlV0o9Mh0XDwoGz8upqHNyJySG7VYpAAAAfklEQVQoz63MRxLCMBQEUck5Z5Pp+x8TMCUkWX+HZ9mvatRf6zq5r1m2inCDu9SnGOJJgBKgDPugARgCyNmW73sLKAW0fl9SA+niQY0BarePkYVodOCCBa6293jrf3D24WR6A+4VNN8+J3tI5g0qglWf/tQh6McbCoQV6sC9ADnVFmqleZsqAAAAAElFTkSuQmCC" />
                                ${file.styleCount > 0 ? file.styleCount + (file.styleCount > 1 ? " code style improvements" : " code style improvement") : "No code style improvements"}
                            </summary>
                            <div class="details-content">
                                ${file.offenses.filter(x => x.severity == 2).map(offense => {totalOffenses.codestyles++; return renderOffense(file, offense)}).join("")}
                            </div>
                        </details>`
                        :
                        ""
                    }
                </div>
            </section>
        `;
    });

    html += /* html */ `
            </body>
        </html>
    `;

    html = html.replace("%1%", totalOffenses.errors);
    html = html.replace("%2%", totalOffenses.suggestions);
    html = html.replace("%3%", totalOffenses.codestyles);

    fs.writeFileSync('results.html', html);

    info("Theme check results ===> results.html");
    if (!process.argv.includes('--nolive')) {
        open("localhost:8080/results.html");
    }
});

if (!process.argv.includes('--nolive')) {
    info("Starting live reload server...")
    const server = require('http').createServer();
    const io = require('socket.io')(server, {
        cors: {
            origin: "http://localhost:8080"
        }
    });
    io.on('connection', client => {
        client.on('rerun', data => {
            info("Client requested re-checking");
            log("Starting new check...");

            const recheck = child_process.exec('node checker.js - --nolive')

            recheck.stdout.pipe(process.stdout)
            recheck.on('exit', function() {
                info("Check finished, reloading client...");
                client.emit('reload', {});
            });
        });
        client.on('disconnect', () => {
            info("Browser page disconnected")
        });
    });
    server.listen(3214);
}
const db = require('./init_db.js')

class Subscriber {
    constructor() {
        this.name = ""
        this.state = "off"
        this.handler = () => {
            this.state = this.state === "off" ? "on" : "off";
            console.log(`${this.name} is now ${this.state}!`);
            db.run(`UPDATE components SET state = ? WHERE name = ?`, [this.state, this.name], (err) => {
                if (err) {
                    return console.error(err.message);
                }
            });
        };
    }
}

class Publisher {
    constructor() {
        this.name = ""
        this.state = "inactive"
        this.handler = () => {
            this.state = this.state === "inactive" ? "active" : "inactive";
            db.run(`UPDATE components SET state = ? WHERE name = ?`, [this.state, this.name], (err) => {
                if (err) {
                    return console.error(err.message);
                }
            });
            return `${this.name} is now ${this.state}!`;
        }
    }
}

module.exports = { Subscriber, Publisher }
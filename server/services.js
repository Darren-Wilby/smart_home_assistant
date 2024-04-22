const db = require('./init_db.js');
const eventBus = require('./eventBus.js');
const { Subscriber, Publisher } = require('./models.js')
const componentInstances = {}; // Stores reference for each component

function fetchData() {
    return new Promise((resolve, reject) => {
        db.all('SELECT name, type, state FROM components', [], function (err, rows) {
            if (err) {
                reject(err.message);
            } else {
                resolve(rows);
            }
        })
    })
}

function addComponent(name, type, state) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO components(name, type, state) VALUES(?, ?, ?)', [name, type, state], function (err) {
            if (err) {
                reject(`Error: Component already exists. Each component must have a unique name.`);
            } else {
                const lastId = this.lastID;
                if (type === "publisher") {
                    const component = new Publisher();
                    component.name = name;
                    componentInstances[name] = component;
                    resolve(`Added publisher component -> ${name}`);
                } else {
                    db.run('INSERT INTO subscriptions(subscriber_id, subscriber_name, publisher_subscribed_to_name) VALUES(?, ?, ?)', [lastId, name, null], (subErr) => {
                        if (subErr) {
                            reject(subErr.message);
                        } else {
                            const component = new Subscriber();
                            component.name = name;
                            componentInstances[name] = component;
                            resolve(`Added subscriber component -> ${name}`);
                        }
                    });
                }
            }
        });
    });
}

function removeSubscriberComponent(name) {
    return new Promise((resolve, reject) => {
        db.get('SELECT publisher_subscribed_to_name FROM subscriptions WHERE subscriber_name = ?', [name], function (err, result) {
            if (err) {
                reject(err.message);
            } else if (result && result.publisher_subscribed_to_name !== null) {
                reject(`Error: Component is subscribed to an event`);
            } else {
                db.run('DELETE FROM subscriptions WHERE subscriber_name = ?', [name], function (subErr) {
                    if (subErr) {
                        reject(subErr.message);
                    } else {
                        db.run('DELETE FROM components WHERE name = ?', [name], function (anotherErr) {
                            if (anotherErr) {
                                reject(anotherErr.message);
                            } else {
                                delete componentInstances[name];
                                resolve(`Removed subscriber -> ${name}`);
                            }
                        });
                    }
                });
            }
        });
    });
}

function removePublisherComponent(name) {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) AS count FROM subscriptions WHERE publisher_subscribed_to_name = ?', [name], function (err, result) {
            if (err) {
                reject(err.message);
            } else if (result && result.count !== 0) {
                reject(`Error: Component has one or more subscribers`);
            } else {
                db.run('DELETE FROM components WHERE name = ?', [name], function (subErr) {
                    if (subErr) {
                        reject(subErr.message);
                    } else {
                        delete componentInstances[name];
                        resolve(`Removed publisher -> ${name}`);
                    }
                });
            }
        });
    });
}

function subscribeToEvent(subscriberName, publisherName) {
    return new Promise((resolve, reject) => {
        db.get('SELECT publisher_subscribed_to_name FROM subscriptions WHERE subscriber_name = ?', [subscriberName], function (err, result) {
            if (err) {
                reject(err.message);
            } else if (result && result.publisher_subscribed_to_name !== null) {
                reject(`Error: Component is already subscribed to an event`);
            } else {
                db.run('UPDATE subscriptions SET publisher_subscribed_to_name = ? WHERE subscriber_name = ?', [publisherName, subscriberName], function (subErr) {
                    if (subErr) {
                        reject(subErr.message);
                    } else {
                        eventBus.on(publisherName, componentInstances[subscriberName].handler);
                        resolve(`${subscriberName} subscribed to ${publisherName}`);
                    }
                })
            }
        })
    })
}

function unsubscribeFromEvent(subscriberName, publisherName) {
    return new Promise((resolve, reject) => {
        db.get('SELECT publisher_subscribed_to_name FROM subscriptions WHERE subscriber_name = ?', [subscriberName], function (err, result) {
            if (err) {
                reject(err.message);
            } else if (result && result.publisher_subscribed_to_name !== publisherName) {
                reject("Error: Component is not subscribed to this event");
            } else {
                db.run('UPDATE subscriptions SET publisher_subscribed_to_name = NULL WHERE subscriber_name = ?', [subscriberName], function (subErr) {
                    if (subErr) {
                        reject(subErr.message);
                    } else {
                        eventBus.off(publisherName, componentInstances[subscriberName].handler)
                        resolve(`${subscriberName} unsubscribed from ${publisherName}`);
                    }
                })
            }
        })
    })
}

function publishEvent(publisherName) {
    return new Promise((resolve, reject) => {
        try {
            const component = componentInstances[publisherName];
            if (component && typeof component.handler === 'function') {
                eventBus.emit(publisherName);
                const output = component.handler();
                resolve(output);
            } else {
                reject("Error: Does not exist");
            }
        } catch (error) {
            reject(error.message);
        }
    });
}

module.exports = {
    fetchData,
    addComponent,
    removeSubscriberComponent,
    removePublisherComponent,
    subscribeToEvent,
    unsubscribeFromEvent,
    publishEvent
};

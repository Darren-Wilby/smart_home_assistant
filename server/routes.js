const express = require('express');
const router = express.Router();
const {
    addComponent,
    removeSubscriberComponent,
    removePublisherComponent,
    subscribeToEvent,
    unsubscribeFromEvent,
    publishEvent,
    fetchData
} = require('./services.js');

router.get('/components', async (req, res) => {
    try {
        const data = await fetchData();
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ error: 'Error fetching components data\n', details: error })
    }
});

router.post('/add_component', async (req, res) => {
    const { name, type, state } = req.body;
    try {
        const componentName = await addComponent(name, type, state);
        res.status(200).json({ message: componentName });
    } catch (error) {
        res.status(500).json({ message: 'Error adding component\n', details: error });
    }
});

router.post('/remove_component', async (req, res) => {
    const { name, type } = req.body;
    try {
        let response;
        if (type === 'subscriber') {
            response = await removeSubscriberComponent(name);
        } else if (type === 'publisher') {
            response = await removePublisherComponent(name);
        } else {
            throw new Error('Invalid component type');
        }
        res.status(200).json({ message: response });
    } catch (error) {
        res.status(500).json({ message: `Error removing ${type} component ${name}\n`, details: error });
    }
});

router.post('/event', async (req, res) => {
    const { subscriberName, publisherName, action } = req.body;
    try {
        switch (action) {
            case 'subscribe':
                const subscribeResult = await subscribeToEvent(subscriberName, publisherName);
                res.status(200).send({ message: subscribeResult });
                break;
            case 'unsubscribe':
                const unsubscribeResult = await unsubscribeFromEvent(subscriberName, publisherName);
                res.status(200).send({ message: unsubscribeResult });
                break;
            case 'publish':
                const publishResult = await publishEvent(publisherName);
                res.status(200).send({ message: publishResult });
                break;
            default:
                res.status(400).send('Invalid action type\n');
        }
    } catch (error) {
        res.status(500).send({ error: `Error performing ${action}\n`, details: error });
    }
});

module.exports = router;
# smart_home_assistant

# Instructions
1. From root directory run ```docker-compose build```
2. Then run ```docker-compose up```
3. Go to localhost:3000 to use UI and make requests to the backend

# How to use the UI and what to expect
1. Enter names for components (must be unique)
2. Choose whether component will be a subscriber or a publisher
3. Select subscriber components to subscribe/unsubscribe to/from publisher components
4. Components cannot be removed if they are subscribed to an event or have other components subscribed to them
5. Publish events (check the terminal logs to see the output from subscriber components, I wasn't able to get this available on the frontend just yet)

# Database
1. Run ```sqlite3 event_management.db``` to access the database
2. Run ```SELECT * FROM components``` and ```SELECT * FROM subscriptions``` to query database and check status of components
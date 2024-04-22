import React, { useState, useEffect } from 'react';
import ResponseBox from './components/ResponseBox';

function App() {
  const [components, setComponents] = useState([]); // Array of component names
  const [subscribers, setSubscribers] = useState([]); // Array of subscriber component names
  const [publishers, setPublishers] = useState([]); // Array of publisher component names
  const [addComponentName, setAddComponentName] = useState('');
  const [addComponentType, setAddComponentType] = useState('subscriber'); // default to 'subscriber'
  const [removeComponentName, setRemoveComponentName] = useState('');
  const [subSubscriberName, setSubSubscriberName] = useState('');
  const [subPublisherName, setSubPublisherName] = useState('');
  const [unsubSubscriberName, setUnsubSubscriberName] = useState('');
  const [unsubPublisherName, setUnsubPublisherName] = useState('');
  const [publishPublisherName, setPublishPublisherName] = useState('');
  const [serverResponses, setServerResponses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:4000/components', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const result = await response.json();
        setComponents(result.map(item => item.name));
        setSubscribers(result.filter(item => item.type === "subscriber").map(filteredItem => filteredItem.name));
        setPublishers(result.filter(item => item.type === "publisher").map(filteredItem => filteredItem.name));

      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    fetchData();
  }, []);

  const handleNewResponse = async (newResponse) => {
    setServerResponses([...serverResponses, newResponse]);
  };

  const handleAddComponent = async (name, type) => {
    const state = type === 'publisher' ? 'inactive' : 'off';
    try {
      const response = await fetch('http://localhost:4000/add_component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, type, state }),
      });
      if (response.ok) {
        setComponents([...components, name]);
        if (type === 'subscriber') {
          setSubscribers([...subscribers, name]);
        } else if (type === "publisher") {
          setPublishers([...publishers, name]);
        }
        const data = await response.json()
        await handleNewResponse(data.message);
      } else {
        console.error('Failed to add component:', response);
      }
    } catch (error) {
      console.error('Network error:', error.message);
    }
  };

  const getType = (name) => {
    if (subscribers.includes(name)) {
      return "subscriber";
    } else if (publishers.includes(name)) {
      return "publisher";
    }
  }

  const handleRemoveComponent = async (name) => {
    const type = getType(name);
    if (!type) {
      console.error('Component type not found for name:', name);
      return;
    }
    try {
      const response = await fetch('http://localhost:4000/remove_component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, type }),
      });

      if (response.ok) {
        setComponents(components.filter(component => component !== name));
        if (type === 'subscriber') {
          setSubscribers(subscribers.filter(subscriber => subscriber !== name));
        } else if (type === 'publisher') {
          setPublishers(publishers.filter(publisher => publisher !== name));
        }
        const data = await response.json()
        await handleNewResponse(data.message);
      } else {
        console.error('Failed to remove component:', response);
      }
    } catch (error) {
      console.error('Network error:', error.message);
    }
  };

  const handleEventSubscription = async (subscriberName, publisherName) => {
    try {
      const response = await fetch('http://localhost:4000/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriberName, publisherName, "action": "subscribe" }),
      });
      if (response.ok) {
        const data = await response.json()
        await handleNewResponse(data.message);
      } else {
        console.error('Failed to subscribe to component:', response);
      }
    } catch (error) {
      console.error('Network error:', error.message);
    }
  };

  const handleEventUnsubscription = async (subscriberName, publisherName) => {
    try {
      const response = await fetch('http://localhost:4000/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriberName, publisherName, "action": "unsubscribe" }),
      });
      if (response.ok) {
        const data = await response.json()
        await handleNewResponse(data.message);
      } else {
        console.error('Failed to unsubscribe from component:', response);
      }
    } catch (error) {
      console.error('Network error:', error.message);
    }
  };

  const handleEventPublish = async (publisherName) => {
    try {
      const response = await fetch('http://localhost:4000/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publisherName, "action": "publish" }),
      });
      if (response.ok) {
        const data = await response.json()
        await handleNewResponse(data.message);
      } else {
        console.log(response.json())
        throw new Error('Failed to publish event');
      }
    } catch (error) {
      console.error('Network error:', error.message);
    }
  };

  return (
    <div>
      <form>
        <h3>Add new component</h3>
        <input
          type="text"
          placeholder="Component name"
          onChange={(e) => setAddComponentName(e.target.value)}
        />
        <select
          onChange={(e) => setAddComponentType(e.target.value)}
        >
          <option value="subscriber">Subscriber</option>
          <option value="publisher">Publisher</option>
        </select>
        <button
          type="button"
          onClick={() => handleAddComponent(addComponentName, addComponentType)}
        >
          Add Component
        </button>
      </form>

      <form>
        <h3>Remove component</h3>
        <select onChange={(e) => setRemoveComponentName(e.target.value)}>
          <option value="">Select a component</option>
          {components.map(component => (
            <option key={component} value={component}>{component}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => handleRemoveComponent(removeComponentName)}
        >Remove Component</button>
      </form>

      <form>
        <h3>Subscribe to an event</h3>
        <select onChange={(e) => setSubSubscriberName(e.target.value)}>
          <option value="">Select a subscriber component</option>
          {subscribers.map(subscriber => (
            <option key={subscriber} value={subscriber}>{subscriber}</option>
          ))}
        </select>
        <select onChange={(e) => setSubPublisherName(e.target.value)}>
          <option value="">Select a publisher component</option>
          {publishers.map(publisher => (
            <option key={publisher} value={publisher}>{publisher}</option>
          ))}
        </select>
        <button type="button" onClick={() => handleEventSubscription(subSubscriberName, subPublisherName)}>Subscribe</button>
      </form>

      <form>
        <h3>Unsubscribe from an event</h3>
        <select onChange={(e) => setUnsubSubscriberName(e.target.value)}>
          <option value="">Select a subscriber component</option>
          {subscribers.map(subscriber => (
            <option key={subscriber} value={subscriber}>{subscriber}</option>
          ))}
        </select>
        <select onChange={(e) => setUnsubPublisherName(e.target.value)}>
          <option value="">Select a publisher component</option>
          {publishers.map(publisher => (
            <option key={publisher} value={publisher}>{publisher}</option>
          ))}
        </select>
        <button type="button" onClick={() => handleEventUnsubscription(unsubSubscriberName, unsubPublisherName)}>Unsubscribe</button>
      </form>

      <form>
        <h3>Publish an event</h3>
        <select onChange={(e) => setPublishPublisherName(e.target.value)}>
          <option value="">Select a publisher component</option>
          {publishers.map(publisher => (
            <option key={publisher} value={publisher}>{publisher}</option>
          ))}
        </select>
        <button type="button" onClick={() => handleEventPublish(publishPublisherName)}>Publish</button>
      </form>

      <div className="App">
        {/* Other components */}
        <ResponseBox responses={serverResponses} />
      </div>
    </div>
  );
}

export default App;

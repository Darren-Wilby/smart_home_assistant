import React from 'react';

const ResponseBox = ({ responses }) => {
  return (
    <div
      style={{
        height: '300px', // Set your desired height
        overflowY: 'auto', // Enable vertical scrolling
        border: '1px solid #ccc', // Add a border for visual separation
        padding: '10px', // Add some padding for readability
        width: '90%', /* Adjust the width as needed */
        margin: '20px auto' /* Centers the box and adds space around it */
      }}
    >
      {
        responses.map((response, index) => (
          <div key={index}>{response}</div>
        ))
      }
    </div >
  );
};

export default ResponseBox;

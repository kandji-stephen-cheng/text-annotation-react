import React, { useState, useEffect } from 'react';
import './App.css';

function AnnotationTool({ text, position, onAnnotationChange }) {
  return (
    <div style={{
      position: 'absolute',
      top: position.top,
      left: position.left,
      backgroundColor: 'white',
      border: '1px solid black',
      padding: '5px'
    }}>
      <div>{text}</div>
      <select onChange={(e) => onAnnotationChange(e.target.value)}>
        <option value="">Select annotation key</option>
        <option value="revenue">Revenue</option>
        <option value="expenses">Expenses</option>
        <option value="general">General</option>
      </select>
    </div>
  );
}

function AnnotationsList({ annotations, lastEdit, onDelete }) {
  const groupedAnnotations = React.useMemo(() => {
    return annotations.reduce((acc, annotation) => {
      if (!acc[annotation.key]) {
        acc[annotation.key] = [];
      }
      acc[annotation.key].push(annotation.value);
      return acc;
    }, {});
  }, [annotations]);

  return (
    <div className="annotations">
      <h2>Your Annotations</h2>
      {Object.keys(groupedAnnotations).map(key => (
        <div key={key}>
          <h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
          <ol>
            {groupedAnnotations[key].map((value, index) => (
              <li key={index}>
                {value}
                <button onClick={() => onDelete(key, index)}>Delete</button>
              </li>
            ))}
          </ol>
        </div>
      ))}

      <div>Last Edited: {new Date(lastEdit).toDateString()}</div>
    </div>
  );
}


function App() {
  const [highlightedText, setHighlightedText] = useState('');
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [annotations, setAnnotations] = useState({
    categories: ['revenue', 'expenses', 'general'],
    annotations: [],
    full_text: `The company's revenue increased by 10% last quarter, showing positive growth. 
                However, expenses also rose by 15%, leading to a narrower profit margin compared to the previous period. 
                Analysts are closely monitoring these trends to assess the overall financial health of the business.`,
    date: '2024-04-01T00:00:00Z'
  });

  useEffect(() => {
    const savedAnnotations = localStorage.getItem('annotations');
    if (savedAnnotations) {
      setAnnotations(JSON.parse(savedAnnotations));
    }
  }, []);


  useEffect(() => {
    const handleMouseUp = (event) => {
      const selection = window.getSelection();
      const text = selection.toString();
      if (text) {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        setHighlightedText(text);
        setPopupPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
      } else {
        setHighlightedText('');
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleDeleteAnnotation = (key, index) => {
    setAnnotations(prevAnnotations => {
      const updatedAnnotations = prevAnnotations.annotations.filter((annotation, i) => !(annotation.key === key && i === index));
      const newAnnotations = {
        ...prevAnnotations,
        annotations: updatedAnnotations,
        date: new Date().toISOString()
      };
      localStorage.setItem('annotations', JSON.stringify(newAnnotations));
      return newAnnotations;
    });
  };

  const handleAnnotationChange = (key) => {
    if (key && highlightedText) {
      const currentDateTimeUTC = new Date().toISOString();
      setAnnotations(prevAnnotations => {
        const newAnnotations = {
          ...prevAnnotations,
          annotations: [...prevAnnotations.annotations, { key, value: highlightedText }],
          date: currentDateTimeUTC
        };
        localStorage.setItem('annotations', JSON.stringify(newAnnotations));
        return newAnnotations;
      });
      setHighlightedText('');
    }
  };

  return (
    <div className="main-text">
      <h2>Original Text</h2>
      The company's revenue increased by 10% last quarter, showing positive growth.
      However, expenses also rose by 15%,
      leading to a narrower profit margin compared to the previous period.
      Analysts are closely monitoring these trends to assess the overall financial health of the business.
      {highlightedText && (
        <AnnotationTool
          text={highlightedText}
          position={popupPosition}
          onAnnotationChange={handleAnnotationChange}
        />
      )}

      <div>
        <AnnotationsList annotations={annotations.annotations}
          lastEdit={annotations.date}
          onDelete={handleDeleteAnnotation} />
      </div>
    </div>
  );
}

export default App;
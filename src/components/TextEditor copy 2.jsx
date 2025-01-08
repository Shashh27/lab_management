import React, { useEffect, useRef, useState } from 'react';
import { DocumentEditorContainerComponent, Toolbar, Inject } from '@syncfusion/ej2-react-documenteditor';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const TextEditor = ({ id }) => {
  const editorObj = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      try {
        const { data } = await axios.get(`${API_URL}/documents/${id}`);
        if (editorObj.current?.documentEditor) {
          editorObj.current.documentEditor.open(data.content);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        setSaveStatus('Error loading document');
      }
    };
    fetchContent();

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [id]);

  const saveContent = async (content) => {
    if (!id) return;
    
    setSaveStatus('Saving...');
    try {
      await axios.put(`${API_URL}/documents/${id}`, { content });
      setSaveStatus('Saved');
      
      // Clear the "Saved" status after 3 seconds
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving document:', error);
      setSaveStatus('Error saving');
    }
  };

  const handleContentChange = () => {
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save operation
    saveTimeoutRef.current = setTimeout(() => {
      if (editorObj.current?.documentEditor) {
        const content = editorObj.current.documentEditor.serialize();
        saveContent(content);
      }
    }, 1000); // Wait 1 second after last change before saving
  };

  const handleImageUpload = async (args) => {
    try {
      const file = args.target.files[0];
      
      // Validate file size before upload
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size exceeds 10MB limit');
      }

      const formData = new FormData();
      formData.append('file', file);
  
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const imageUrl = response.data.location;
  
      if (editorObj.current?.documentEditor) {
        editorObj.current.documentEditor.editor.insertImage(imageUrl);
        handleContentChange(); // Trigger save after image insertion
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error.message || 'Error uploading image');
    }
  };

  return (
    <div className="editor-container" style={{ minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
      {saveStatus && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '10px',
          backgroundColor: saveStatus.includes('Error') ? '#ff4444' : '#44ff44',
          color: '#fff',
          borderRadius: '4px',
          zIndex: 1000
        }}>
          {saveStatus}
        </div>
      )}
      <DocumentEditorContainerComponent
        ref={editorObj}
        height="880px"
        enableToolbar={true}
        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
        contentChange={handleContentChange}
        created={() => {
          if (editorObj.current) {
            editorObj.current.documentEditor.editor.insertImageSettings = {
              allowedFormats: ['.jpg', '.jpeg', '.png','.webp'],
              uploadHandler: handleImageUpload
            };
          }
        }}
      >
        <Inject services={[Toolbar]} />
      </DocumentEditorContainerComponent>
    </div>
  );
};

export default TextEditor;
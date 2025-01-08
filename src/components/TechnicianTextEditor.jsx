import React, { useEffect, useRef, useState } from 'react';
import { DocumentEditorContainerComponent, Toolbar, Inject } from '@syncfusion/ej2-react-documenteditor';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const API_URL2 = 'http://localhost:7000/api';

const TextEditor = ({ id, dc_po_number, title }) => {
  const editorObj = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef(null);
  const [isExistingDocument, setIsExistingDocument] = useState(false);

  const handleError = (error, context) => {
    console.error(`Error ${context}:`, error);
    const errorMessage = error.response?.data?.error || error.message || `Error ${context}`;
    setError(errorMessage);
    setSaveStatus(`Error: ${errorMessage}`);
    setIsLoading(false);
  };

  const fetchContent = async () => {
    if (!title || !dc_po_number) {
      setIsLoading(false);
      return;
    }

    try {
      // First try to fetch from API_URL2
      const response = await axios.get(`${API_URL2}/documents/${dc_po_number}/${title}`);
      
      if (response.data?.content && editorObj.current?.documentEditor) {
        editorObj.current.documentEditor.open(response.data.content);
        setIsExistingDocument(true);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // If document not found in API_URL2, try API_URL
        try {
          const fallbackResponse = await axios.get(`${API_URL}/documents/${id}`);
          if (fallbackResponse.data?.content && editorObj.current?.documentEditor) {
            editorObj.current.documentEditor.open(fallbackResponse.data.content);
            
            // Create the document in API_URL2
            await axios.post(`${API_URL2}/documents`, {
              dc_po_number,
              title,
              content: fallbackResponse.data.content,
            });
            setIsExistingDocument(true);
          }
        } catch (fallbackError) {
          handleError(fallbackError, 'fetching from fallback API');
          return;
        }
      } else {
        handleError(error, 'fetching document');
        return;
      }
    }
    
    setIsLoading(false);
    setError(null);
  };

  useEffect(() => {
    fetchContent();

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [id, title, dc_po_number]);

  const saveContent = async (content) => {
    if (!title || !dc_po_number) return;
    
    setSaveStatus('Saving...');
    try {
      if (isExistingDocument) {
        await axios.put(`${API_URL2}/documents/${dc_po_number}/${title}`, {
          content,
        });
      } else {
        await axios.post(`${API_URL2}/documents`, {
          dc_po_number,
          title,
          content,
        });
        setIsExistingDocument(true);
      }
      setSaveStatus('Saved');
      setError(null);
      
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      handleError(error, 'saving document');
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

    saveTimeoutRef.current = setTimeout(() => {
      if (editorObj.current?.documentEditor) {
        const content = editorObj.current.documentEditor.serialize();
        saveContent(content);
      }
    }, 1000);
  };

  const handleImageUpload = async (args) => {
    try {
      const file = args.target.files[0];
      
      if (!file) {
        throw new Error('No file selected');
      }
      
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit');
      }

      const formData = new FormData();
      formData.append('file', file);
  
      const response = await axios.post(`${API_URL2}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const imageUrl = response.data.location;
  
      if (editorObj.current?.documentEditor) {
        editorObj.current.documentEditor.editor.insertImage(imageUrl);
        handleContentChange();
      }
    } catch (error) {
      handleError(error, 'uploading image');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading editor...</div>;
  }

  return (
    <div className="editor-container" style={{ minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
      {(saveStatus || error) && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '10px',
          backgroundColor: error ? '#ff4444' : saveStatus.includes('Error') ? '#ff4444' : '#44ff44',
          color: '#fff',
          borderRadius: '4px',
          zIndex: 1000
        }}>
          {error || saveStatus}
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
              allowedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
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
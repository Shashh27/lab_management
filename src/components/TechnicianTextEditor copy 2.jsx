import React, { useEffect, useRef, useState } from 'react';
import { DocumentEditorContainerComponent, Toolbar, Inject } from '@syncfusion/ej2-react-documenteditor';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const API_URL2 = 'http://localhost:7000/api';

const TechnicianTextEditor = ({ id, dc_po_number, title }) => {
  const editorObj = useRef(null);
  const [isExistingDocument, setIsExistingDocument] = useState(false);
  const [initialContentLoaded, setInitialContentLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const saveTimeoutRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const fetchDocumentContent = async () => {
      if (!title || !dc_po_number) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        try {
          const checkExisting = await axios.get(`${API_URL2}/documents/${dc_po_number}/${title}`);
          console.log("Received content:", checkExisting.data.content);
          
          if (checkExisting.data && checkExisting.data.content && editorObj.current?.documentEditor) {
            let contentToLoad = checkExisting.data.content;
            
            // If content is a string, try to parse it
            if (typeof contentToLoad === 'string') {
              try {
                contentToLoad = JSON.parse(contentToLoad);
              } catch (e) {
                console.log("Content is not JSON string, using as is");
              }
            }
            
            editorObj.current.documentEditor.open(JSON.stringify(contentToLoad));
            setIsExistingDocument(true);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            // If not found in port 7000, fetch from port 5000
            const response = await axios.get(`${API_URL}/documents/${id}`);
            console.log('Fetched from port 5000:', response.data);

            if (editorObj.current?.documentEditor) {
              let contentToLoad = response.data.content;
              
              // If content is a string, try to parse it
              if (typeof contentToLoad === 'string') {
                try {
                  contentToLoad = JSON.parse(contentToLoad);
                } catch (e) {
                  console.log("Content is not JSON string, using as is");
                }
              }
              
              editorObj.current.documentEditor.open(JSON.stringify(contentToLoad));
            }
            
            // Save the template content to port 7000
            await axios.post(`${API_URL2}/documents`, {
              dc_po_number,
              title,
              content: response.data.content,
            });
            setIsExistingDocument(true);
          } else {
            throw error;
          }
        }
        
        setInitialContentLoaded(true);
      } catch (error) {
        console.error('Error loading document:', error);
        setError('Failed to load document. Please try again.');
        setSaveStatus('Error loading document');
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      fetchDocumentContent();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [id, title, dc_po_number]);

  const saveContent = async (content) => {
    if (!title || !dc_po_number) return;

    setSaveStatus('Saving...');
    try {
      const contentToSave = typeof content === 'string' ? content : JSON.stringify(content);
      
      if (isExistingDocument) {
        await axios.put(`${API_URL2}/documents/${dc_po_number}/${title}`, {
          content: contentToSave,
        });
      } else {
        await axios.post(`${API_URL2}/documents`, {
          dc_po_number,
          title,
          content: contentToSave,
        });
        setIsExistingDocument(true);
      }
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving document:', error);
      setSaveStatus('Error saving');
    }
  };

  const handleContentChange = () => {
    if (!initialContentLoaded) return;

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
      console.error('Error uploading image:', error);
      setSaveStatus(error.message || 'Error uploading image');
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

export default TechnicianTextEditor;
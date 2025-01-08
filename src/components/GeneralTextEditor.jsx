import React, { useEffect, useRef, useState } from 'react';
import { DocumentEditorContainerComponent, Toolbar, Inject } from '@syncfusion/ej2-react-documenteditor';
import axios from 'axios';
import { Button } from 'antd';

const API_URL = 'http://localhost:5000/api';
const API_URL2 = 'http://localhost:7000/api';


const TextEditor = ({ id , dc_po_number , title }) => {
  const editorObj = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const saveTimeoutRef = useRef(null);
  const [isExistingDocument, setIsExistingDocument] = useState(false);
  

  useEffect(() => {
    const fetchContent = async () => {
      if (!title || !dc_po_number) return;
      try {
        const { data } = await axios.get(`${API_URL2}/documents/${dc_po_number}/${title}`);
        console.log(data.content);
        if (data.content && editorObj.current?.documentEditor) {
          editorObj.current.documentEditor.open(data.content);
          setIsExistingDocument(true);
        }

        else{
          const response = await axios.get(`${API_URL}/documents/${id}`);
          if (response.data.content && editorObj.current?.documentEditor) {
            editorObj.current.documentEditor.open(response.data.content);
          }
          await axios.post(`${API_URL2}/documents`, {
            dc_po_number,
            title,
            content: response.data.content,
          });
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
  }, [id, title , dc_po_number]);

  const onSave = () => {
    try {
      if (!editorObj.current?.documentEditor) {
        throw new Error('Document editor not initialized');
      }
      editorObj.current.documentEditor.save("Sample", "Docx");
      setSaveStatus('Document saved successfully');
      
      // Clear success message after 3 seconds
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    } catch (error) {
      console.error('Error saving document:', error);
      setSaveStatus('Error saving document');
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


      <Button onClick={onSave}>Download</Button>
      <DocumentEditorContainerComponent
        ref={editorObj}
        height="880px"
        enableToolbar={false}
        isReadOnly={true}
        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
        
      >
        <Inject services={[Toolbar]} />
      </DocumentEditorContainerComponent>
    </div>
  );
};

export default TextEditor;
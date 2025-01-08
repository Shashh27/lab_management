import React, { useRef } from 'react';
import { DocumentEditorContainerComponent, Toolbar, Inject } from '@syncfusion/ej2-react-documenteditor';
import '../App.css';

function OnlyOfficeEditor() {
  const editorObj = useRef(null);

  const onSave = () => {
    if (editorObj.current) {
      editorObj.current.documentEditor.save("Sample", "Docx");
    }
  };

  return (
    <div className="App">
      <button onClick={onSave} style={{ marginBottom: 10 }}>Save</button>
      <DocumentEditorContainerComponent 
        ref={editorObj} 
        height="590" 
        enableToolbar={true} 
        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
      >
        <Inject services={[Toolbar]} />
      </DocumentEditorContainerComponent>
    </div>
  );
}

export default OnlyOfficeEditor;

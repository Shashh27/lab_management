import React, { useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// A4 dimensions
const A4_WIDTH = '21cm';
const A4_HEIGHT = '29.7cm';

const TextEditor = ({id}) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      try {
        const { data } = await axios.get(`${API_URL}/documents/${id}`);
        setContent(data.content);
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };
    fetchContent();
  }, [id]);

  const handleEditorChange = (content) => {
    setContent(content);
    saveContent(content);
  };

  const saveContent = async (newContent) => {
    if (!id) return;
    try {
      await axios.put(`${API_URL}/documents/${id}`, { content: newContent });
      console.log('Content autosaved!');
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const handleImageUpload = async (blobInfo) => {
    try {
      const formData = new FormData();
      formData.append('file', blobInfo.blob(), blobInfo.filename());

      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.location; // Return the URL of the uploaded image
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Image upload failed');
    }
  };

  return (
    <div
      className="editor-container"
      style={{
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
      }}
    >
      <Editor
        apiKey="9l7yi1qi28v5ivwbojon537y06xrh9kh035v21zbyymzquoe"
        value={content}
        onEditorChange={handleEditorChange}
        init={{
          height: A4_HEIGHT,
          width: '100%',
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'image'
          ],
          toolbar: 'blocks | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'table | image | removeformat | help',

          // Image upload settings
          images_upload_handler: handleImageUpload,
          automatic_uploads: true,
          image_advtab: true,
          file_picker_types: 'image',

          // Image toolbar and context menu
          image_toolbar: 'alignleft aligncenter alignright | rotateleft rotateright | imageoptions',
          image_caption: true,

          // Context menu for images
          context_menu: 'link image table',

          content_style: `
            body {
              font-family: Helvetica,Arial,sans-serif;
              font-size: 12pt;
              line-height: 1.5;
              margin: 0 auto;
              padding: 1cm;
              width: ${A4_WIDTH} !important;
              min-height: ${A4_HEIGHT};
              box-sizing: border-box;
              background-color: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.5);
            }
            .mce-content-body {
              max-width: ${A4_WIDTH};
              margin: 0 auto;
            }
            p, h1, h2, h3, h4, h5, h6 {
              margin: 0;
              padding: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            td, th {
              padding: 8px;
              border: 1px solid #ddd;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          `,
          style_formats_autohide: true,
          toolbar_sticky: true,
          toolbar_sticky_offset: 0,
          resize: false,
          table_toolbar:
            'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
          table_appearance_options: true,
          table_grid: true,
          table_resize_bars: true,
          table_default_styles: {
            width: '100%',
          },
          setup: (editor) => {
            editor.on('init', () => {
              const toolbar = document.querySelector('.tox-editor-header');
              if (toolbar) {
                toolbar.style.width = '100%';
                toolbar.style.maxWidth = '100%';
                toolbar.style.backgroundColor = '#f8f9fa';
                toolbar.style.borderBottom = '1px solid #ddd';
              }
            });
          },
        }}
      />
    </div>
  );
};

export default TextEditor;

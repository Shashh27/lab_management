import React, { useState , useEffect } from 'react';
import { Layout, Menu, Table, Button, Modal, Input , message , Form , Select, DatePicker , Space , Spin  } from 'antd';
import { HomeOutlined, FileDoneOutlined, FileSearchOutlined , LogoutOutlined , DeleteOutlined , CloseCircleOutlined , CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import {marked} from 'marked'; // Import the Markdown-to-HTML library


import logo from '../assets/cmti.webp'
import TextEditor from '../components/TextEditor';
import TechnicianTextEditor from '../components/TechnicianTextEditor';
import { useNavigate } from 'react-router-dom';

// import DOCUMENT_TEMPLATES from '../components/DOCUMENT_TEMPLATES';

const { Content, Sider } = Layout;

const API_URL = 'http://localhost:5000/api';
const API_URL2 = 'http://localhost:7000/api';


const DOCUMENT_TEMPLATES = [
  {
    id: 'blank',
    title: 'Blank Template',
    description: 'Start with an empty document',
    content: {
      sections: [{
        blocks: []
      }]
    }
  },
  {
    id: 't1',
    title: 'Template 1 - Coating Thickness Measurement',
    description: 'Template for coating thickness measurement reports',
    content: {
      sections: [{
        blocks: [
          {
            paragraphFormat: { textAlignment: 'Center' },
            inlines: [{
              text: 'Coating Thickness Measurement',
              characterFormat: { bold: true, size: 16 }
            }]
          },
          {
            paragraphFormat: {},
            inlines: [{ text: '\n\n' }]
          },
          {
            paragraphFormat: {},
            inlines: [{ 
              text: 'Report No & Date: \n',
              characterFormat: { bold: true, size: 14 }
            }]
          },
          {
            paragraphFormat: {},
            inlines: [{ 
              text: 'Name & Address: \n',
              characterFormat: { bold: true, size: 14 }
            }]
          },
          {
            paragraphFormat: {},
            inlines: [{ 
              text: 'Ref. & Date: \n',
              characterFormat: { bold: true, size: 14 }
            }]
          },
          {
            paragraphFormat: {},
            inlines: [{ 
              text: 'Sample Received on: \n',
              characterFormat: { bold: true, size: 14 }
            }]
          },
          {
            paragraphFormat: {},
            inlines: [{ 
              text: 'Testing completed on: \n',
              characterFormat: { bold: true, size: 14 }
            }]
          },
          {
            paragraphFormat: {},
            inlines: [{ 
              text: 'Sample Description: \n',
              characterFormat: { bold: true, size: 14 }
            }]
          },
          {
            paragraphFormat: {},
            inlines: [{ 
              text: 'No. Of Samples: \n',
              characterFormat: { bold: true, size: 14 }
            }]
          },
          {
            paragraphFormat: {},
            inlines: [{ 
              text: 'Test Procedure: \n',
              characterFormat: { bold: true, size: 14 }
            }]
          },
          {
            paragraphFormat: {},
            inlines: [{ text: '\n\n' }]
          },
          {
            paragraphFormat: {},
            inlines: [{ 
              text: 'Results:',
              characterFormat: { bold: true, size: 14 }
            }]
          },
          {
            paragraphFormat: {},
            inlines: [{ text: '\n\n' }]
          },
          createTable({
            headers: ['Sl.no', 'Sample ID', 'Reading 1 (µm)', 'Reading 2 (µm)', 'Reading 3 (µm)', 'Avg. Value (µm)'],
            rows: 3,
            widths: [40, 60, 90, 90, 90, 90]
          }),
          {
            paragraphFormat: {},
            inlines: [{ text: '\n\n' }]
          },
          {
            paragraphFormat: {},
            inlines: [{ 
              text: '[Insert microscope image analysis here]\n\n',
              characterFormat: { size: 14 }
            }]
          },
          {
            paragraphFormat: {},
            inlines: [{ 
              text: 'Fig: 01 Image of coating thickness measurement, viewed at 500x mag.',
              characterFormat: { size: 14 }
            }]
          }
        ]
      }]
    }
  },
  {
    id: 't2',
    title: 'Template 2 - Hardness Measurement',
    description: 'Template for hardness measurement reports',
    content: {
      sections: [{
        blocks: [
          {
            paragraphFormat: { textAlignment: 'Center' },
            inlines: [{
              text: 'Hardness Measurement',
              characterFormat: { bold: true, size: 16 }
            }]
          },
          createTable({
            headers: ['Sl.no', 'Sample ID', '1st Value', '2nd Value', '3rd Value'],
            rows: 3,
            widths: [40, 60, 90, 90, 90]
          })
        ]
      }]
    }
  },
  {
    id: 't3',
    title: 'Template 3 - ULTRASONIC TEST',
    description: 'Template for ultrasonic test reports',
    content: {
      sections: [{
        blocks: [
          {
            paragraphFormat: { textAlignment: 'Center' },
            inlines: [{
              text: 'ULTRASONIC TEST',
              characterFormat: { bold: true, size: 16 }
            }]
          },
          createTable({
            headers: ['Sl.no', 'Description', 'Observation', 'Remarks'],
            rows: 3,
            widths: [40, 100, 100, 100]
          })
        ]
      }]
    }
  },
  {
    id: 't4',
    title: 'Template 4 - Particle count & Distribution analysis',
    description: 'Template for particle analysis reports',
    content: {
      sections: [{
        blocks: [
          {
            paragraphFormat: { textAlignment: 'Center' },
            inlines: [{
              text: 'Particle count & Distribution analysis',
              characterFormat: { bold: true, size: 16 }
            }]
          },
          createTable({
            headers: ['Sl.no', 'Particle Range', 'Metallic Particle', 'Non-Metalic particle', 'Total Particle Count'],
            rows: 10,
            widths: [40, 90, 90, 90, 90]
          })
        ]
      }]
    }
  }
];

// Helper function to create table structure
function createTable({ headers, rows, widths }) {
  return {
    rows: [
      // Header row
      {
        rowFormat: { heightType: 'Exactly', height: 20 },
        cells: headers.map((header, index) => ({
          blocks: [{
            inlines: [{
              text: header,
              characterFormat: { bold: true }
            }]
          }],
          cellFormat: {
            preferredWidthType: 'Point',
            preferredWidth: widths[index]
          }
        }))
      },
      // Data rows
      ...Array(rows).fill(0).map((_, rowIndex) => ({
        rowFormat: { heightType: 'Exactly', height: 20 },
        cells: headers.map((_, colIndex) => ({
          blocks: [{
            inlines: [{
              text: colIndex === 0 ? String(rowIndex + 1).padStart(2, '0') : ''
            }]
          }],
          cellFormat: {
            preferredWidthType: 'Point',
            preferredWidth: widths[colIndex]
          }
        }))
      }))
    ],
    tableFormat: {
      borders: {
        top: { lineStyle: 'Single', lineWidth: 1.0 },
        bottom: { lineStyle: 'Single', lineWidth: 1.0 },
        left: { lineStyle: 'Single', lineWidth: 1.0 },
        right: { lineStyle: 'Single', lineWidth: 1.0 },
        horizontal: { lineStyle: 'Single', lineWidth: 1.0 },
        vertical: { lineStyle: 'Single', lineWidth: 1.0 }
      }
    }
  };
}

  

export default function Authorizer() {
  const [selectedMenu, setSelectedMenu] = useState('home');
  const [form] = Form.useForm();
  const [taskData, setTaskData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfigModalVisible , setIsConfigModalVisible] = useState(false);
  const [instruments, setInstruments] = useState([]);
  const [newInstrument, setNewInstrument] = useState('');
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [data2, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isAddResportModal , setAddReportModal] = useState(false);

  const [newDocTitle, setNewDocTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');

  const [isResultModel , setisResultModal] = useState(false);
  const [documentData, setDocumentData] = useState(null);

  const [approvedTasks, setApprovedTasks] = useState([]);

  const [technicians , setTecnicians] = useState([]);

  const [remarksModalVisible, setRemarksModalVisible] = useState(false);
  const [remarks, setRemarks] = useState("");

  const navigate = useNavigate();

  const fetchInstruments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/instruments');
      const instrumentNames = response.data.map(inst => inst.instrument_name);
      setInstruments(instrumentNames);
    } catch (error) {
      message.error('Failed to fetch instruments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchInstruments();
  }, []);

  const fetchApprovedTasks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/get-approved-tasks');
      setApprovedTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch approved tasks");
    }
  };

  useEffect(() => {
    fetchApprovedTasks();
  }, []);

  const handleAddInstrument = async () => {
    if (!newInstrument.trim()) {
      message.warning('Please enter an instrument name');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:3000/instruments', {
        instrument_name: newInstrument
      });
      message.success('Instrument added successfully');
      setNewInstrument('');
      fetchInstruments();
    } catch (error) {
      if (error.response?.status === 400) {
        message.error('Instrument name must be unique');
      } else {
        message.error('Failed to add instrument');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInstrument = async (instrumentName) => {
    setLoading(true);
    try {
      await axios.delete('http://localhost:3000/instruments', {
        data: { instrument_name: instrumentName }
      });
      message.success('Instrument deleted successfully');
      fetchInstruments();
    } catch (error) {
      if (error.response?.status === 404) {
        message.error('Instrument not found');
      } else {
        message.error('Failed to delete instrument');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await axios.get('http://localhost:3000/technicians');
      setTecnicians(response.data);
    } catch (error) {
      message.error("Failed to fetch approved tasks: " + error.message);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);


  const fetchDocuments = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/documents`);
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);



  const fetchCustomerData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/get-customers');
      setData(response.data);
    } catch (error) {
      message.error("Failed to fetch customer data: " + error.message);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  console.log("data:",data2);

  const fetchTasks = async () =>{
    try {
      const response = await axios.get('http://localhost:3000/get-tasks');
       setTaskData(response.data);
    } catch (error) {
      message.error("Failed to fetch task data: " + error.message);
    }
  }

  useEffect(()=>{
    fetchTasks();
  },[])


  const handleReportModalOpen = (customer) => {
    setSelectedCustomer(customer);
    setIsReportModalVisible(true);
  };

  const handleReportModalClose = () => {
    setIsReportModalVisible(false);
    setSelectedCustomer(null);
  };

  const handleMenuClick = (e) => {
    setSelectedMenu(e.key);
  };

  const handleApproveReject = async (dc_po_number, action) => {
    setLoading(true);
    try {
      const response = await axios.put('http://localhost:3000/put-customers', {
        dc_po_number,
        status: action === 'approve' ? 'Approved' : 'Rejected'
      });

      if (response.status === 200) {
        message.success(`Successfully ${action === 'approve' ? 'approved' : 'rejected'}`);
        // Refresh the data
        await fetchCustomerData();
      }
    } catch (error) {
      message.error(`Failed to ${action} the request: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post('http://localhost:3000/add-task', values);
      message.success('Task Assigned successfully');
      setIsModalVisible(false);  // Close the modal
      await fetchTasks();
    } catch (error) {
      message.error("Failed to assign task")
      console.error("Error adding task:", error);
    }
  };

  const handleAdd = (setState, state) => {
    setState([...state, '']);
  };
  
  const handleDelete = (setState, state, index) => {
    const updatedState = [...state];
    updatedState.splice(index, 1);
    setState(updatedState);
  };
  
  const handleInputChange = (setState, state, index, value) => {
    const updatedState = [...state];
    updatedState[index] = value;
    setState(updatedState);
  };

  const updateTaskStatus = async (dc_po_number, report, technician, status) => {
    try {
      const response = await axios.put('http://localhost:3000/put-tasks', {
        dc_po_number: dc_po_number,
        report,
        technician,
        status,
      });
      if (response.status === 200) {
        await fetchTasks();
        message.success('Task status updated successfully!');
      } else {
        message.error('Failed to update task status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating task status:', error.message);
      message.error('Error occurred while updating task status.');
    }
  };

  const handleStatusChange = (key, status) => {
    const task = taskData.find((item) => item.sl_no === key);
    if (!task) return;
  
    const { dc_po_number, report , technician} = task;
  
    // Update status locally
    setTaskData((prevData) =>
      prevData.map((item) =>
        item.key === key ? { ...item, status } : item
      )
    );
  
    // Update status on the server
    updateTaskStatus(dc_po_number, report, technician, status);
  };


  const handleResultDocumentClick = async (dc_po_number, title) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL2}/documents/${dc_po_number}/${title}`);
      setDocumentData(response.data);
      setisResultModal(true);
    } catch (error) {
      message.error("Result not found!");
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemarksModalOpen = (record) => {
    setSelectedCustomer(record);
    setRemarks(record.authorizer_remarks || ""); // Initialize the textarea with existing remarks
    setRemarksModalVisible(true);
  };
  
  const handleRemarksModalClose = () => {
    setRemarksModalVisible(false);
    setSelectedCustomer(null);
  };

  const handleRemarksSubmit = async () => {
    if (!selectedCustomer) return;
    const { dc_po_number, report, technician } = selectedCustomer;
    try {
      const response = await axios.put("http://localhost:3000/put-authorizer-remarks", {
        dc_po_number,
        report,
        technician,
        remarks,
      });
      if (response.status === 200) {
        message.success("Remarks updated successfully!");
        await fetchTasks(); // Refresh the table data
        handleRemarksModalClose();
      } else {
        message.error("Failed to update remarks.");
      }
    } catch (error) {
      console.error("Error updating remarks:", error.message);
      message.error("Error occurred while updating remarks.");
    }
  };

  const columnsHome = [
    {
      title: "Sl. No",
      dataIndex: "key",
      key: "key",
      align:'center',
      render: (text, record, index) => index + 1, // This will display the row number
    },   
    {
      title: "DC/PO Numbers",
      dataIndex: "dc_po_number",
      key: "dc_po_number",
      align:'center',
      render: (text) => text || "N/A", // Safeguard for missing data
    },
     {
      title: "Customer Details",
      dataIndex: "customerDetails",
      key: "customerDetails",
      align:'center',
      render: (_, record) => (
        <Button type="link" onClick={() => handleReportModalOpen(record)}>
          View
        </Button>
      ),
    },   
    { title: 'Result', dataIndex: 'result', key: 'result' ,align:'center',
      render: (_, record) => {
        // Find all approved tasks for this dc_po_number
        const relatedTasks = approvedTasks.filter(
          task => task.dc_po_number === record.dc_po_number
        );
        
        if (relatedTasks.length > 0) {
          return (
            <span>
              {relatedTasks.map((task, index) => (
                <React.Fragment key={task.sl_no}>
                  <Button
                    type="link"
                    onClick={() => handleResultDocumentClick(task.dc_po_number, task.report)}
                  >
                    {task.report}
                  </Button>
                  {index < relatedTasks.length - 1 && ", "}
                </React.Fragment>
              ))}
            </span>
          );
        }
        return "Pending";
      },
     },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align:'center',
      render: (text) => {
        const color = text === "Approved" ? "#34A853" : text === "Rejected" ? "#EA4335" : "grey";
        return <span style={{ color, fontWeight: "bold" }}>{text || "Pending"}</span>;
      },
    },    {
      title: 'Action',
      key: 'action',
      align:'center',
      render: (_, record) => (
        <div>
          <Button 
            style={{ marginRight: 8 , color:'#34A853' , borderColor:'#34A853'}}
            onClick={() => handleApproveReject(record.dc_po_number, 'approve')}
            loading={loading}
          >
            Approve
          </Button>
          <Button 
            style={{ color:'#EA4335' , borderColor:'#EA4335'}}
            onClick={() => handleApproveReject(record.dc_po_number, 'reject')}
            loading={loading}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  const orderColumns = [
    {
      title: "Sl. No",
      dataIndex: "key",
      key: "key",
      render: (text, record, index) => index + 1, // This will display the row number
    },
    {
      title: "Item Description",
      dataIndex: "item_description",
      key: "item_description",
    },
    {
      title: "Quantity",
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: "Specification",
      dataIndex: "specification",
      key: "specification",
    },
    {
      title: "Test Type",
      dataIndex: "type_of_test_required_with_std",
      key: "type_of_test_required_with_std",
    },
  ];


  const columnsAssignTasks = [
    { title: 'Sl. No', dataIndex: 'sl_no', key: 'sl_no' , align:'center',},
    { title: 'Task Name', dataIndex: 'task_name', key: 'task_name',align:'center', },
    { title: 'DC/PO Number', dataIndex: 'dc_po_number', key: 'dc_po_number' , align:'center', },
    { title: 'Report', dataIndex: 'report', key: 'report', align:'center' ,},
    { title: 'Instrument', dataIndex: 'instrument', key: 'instrument',align:'center', },
    { title: 'Technician', dataIndex: 'technician', key: 'technician' ,align:'center',},
    { title: 'Due Date', dataIndex: 'due_date', key: 'due_date' ,align:'center',},
    {
      title: 'Result', dataIndex: 'result', key: 'result', align: 'center',
      render: (_, record) => (
        <Space>
        <Button
          type="link"
          onClick={() => handleResultDocumentClick(record.dc_po_number, record.report)}
        >
          View
        </Button>
        <Button type="link" style={{color:'red'}} onClick={() => handleRemarksModalOpen(record)}>
          Remarks
        </Button>
        </Space>
      ),
    },
    { title: 'Authorizer Status', dataIndex: 'authorizer_status', key: 'authorizer_status' ,align:'center',
      render: (text) => {
        const color = text == "Approved" ? "green" : text == "Rejected" ? "red" : "grey";
        return <span style={{ color, fontWeight: "bold" }}>{text || "Pending"}</span>;
      }, 
     },
     { title: 'Reviewer Status', dataIndex: 'reviewer_status', key: 'reviewer_status' ,align:'center',
      render: (text) => {
        const color = text == "Approved" ? "green" : text == "Rejected" ? "red" : "grey";
        return <span style={{ color, fontWeight: "bold" }}>{text || "Pending"}</span>;
      }, 
     },
     {
      title:'Reviewer Remarks', dataIndex:'reviewer_remarks' , key:'reviewer_remarks',align:'center',
     },
     {
      title: 'Action',
      key: 'action',
      align:'center',
      render: (_, record) => (
        <Space>
          <Button
            style={{borderColor:"#34A853", color:'#34A853'}}
            type="default"
            icon={<CheckCircleOutlined />}
            onClick={() => handleStatusChange(record.sl_no, 'Approved')}
          >
            Approve
          </Button>
          <Button
            style={{borderColor:'#EA4335' , color:'#EA4335'}}
            type="default"
            icon={<CloseCircleOutlined />}
            onClick={() => handleStatusChange(record.sl_no, 'Rejected')}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  const columnsReports = [
    {
      title: 'Sl. No',
      dataIndex: 'sl_no',
      key: 'sl_no',
      align:'center',
    },
    {
      title: 'Report',
      dataIndex: 'report',
      key: 'report',
      align:'center',
    },
    {
      title: 'Modified Date',
      dataIndex: 'modified_date',
      key: 'modified_date',
      align:'center',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      align:'center',
    },
  ];

  const data = documents.map((doc, index) => ({
    key: doc._id,
    sl_no: index + 1,
    report: doc.title,
    modified_date: new Date(doc.lastModified).toLocaleString(),
    actions: (
      <Button
        icon={<DeleteOutlined />}
        onClick={(e) => handleDeleteReport(doc._id, e)}
        danger
        size="small"
      />
    ),
  }));

  const handleDeleteReport = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/documents/${id}`);
      fetchDocuments();
      if (selectedDoc?._id === id) {
        setSelectedDoc(null);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleDocumentClick = (doc) => {
    setSelectedDoc(doc);
    setShowEditor(true);
  };

  const handleBackToReports = () => {
    setShowEditor(false);
    setSelectedDoc(null);
  };

  const handleCreateDocument = async () => {
    try {
      const selectedTemplateContent = DOCUMENT_TEMPLATES.find(
        (template) => template.id === selectedTemplate
      ).content;
  
      // Convert Markdown content to HTML
      const htmlContent = marked(selectedTemplateContent);
  
      const response = await axios.post(`${API_URL}/documents`, {
        title: newDocTitle,
        content: htmlContent, // Save HTML content instead of Markdown
      });
  
      setAddReportModal(false);
      setNewDocTitle('');
      setSelectedTemplate('blank');
      fetchDocuments();
      setSelectedDoc(response.data);
      setShowEditor(true);
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };


  const renderContent = () => {
    switch (selectedMenu) {
      case 'home':
        return (
            <>
              <h2>Customer Info</h2>
              <Button
                type="primary"
                style={{ marginBottom: '10px' }}
                onClick={() => setIsConfigModalVisible(true)}
              >
                +Config
              </Button>
              <Table columns={columnsHome} dataSource={data2} pagination="5" loading={loading} />
              <Modal
                        title="Customer Details"
                        visible={isReportModalVisible}
                        onCancel={handleReportModalClose}
                        footer={null}
                      >
                        {selectedCustomer && (
                          <div>
                            <p><strong>Company Name:</strong> {selectedCustomer.company_name}</p>
                            <p><strong>Address:</strong> {selectedCustomer.address}</p>
                            <p><strong>Contact Person:</strong> {selectedCustomer.contact_person}</p>
                            <p><strong>Mobile No:</strong> {selectedCustomer.mobile_number}</p>
                            <p><strong>DC/PO Number:</strong> {selectedCustomer.dc_po_number}</p>
                            <p><strong>DC/PO Date:</strong> {new Date(selectedCustomer.dc_po_date).toLocaleDateString()}</p>
                            <p><strong>Email ID:</strong> {selectedCustomer.email_id}</p>
                            <p><strong>Designation:</strong> {selectedCustomer.designation}</p>
                            <p><strong>GST Number:</strong> {selectedCustomer.gst_number}</p>
                            <p><strong>MSME Registration:</strong> {selectedCustomer.msme_registration}</p>
              
                            <h3>Items:</h3>
                            <Table
                              columns={orderColumns}
                              dataSource={selectedCustomer.customer_order}
                              pagination={false} // Disable pagination for better display of items
                              rowKey={(record, index) => index} // Use index as the unique key for rows
                            />
                          </div>
                        )}
                      </Modal>
                <Modal
                      title="General Configuration"
                      visible={isConfigModalVisible}
                      onCancel={()=>setIsConfigModalVisible(false)}
                      footer={null}
                    >
                      <div style={{ padding: '10px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '10px' }}>Instruments</h3>
                
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                          <Input
                            placeholder="New Instrument Name"
                            value={newInstrument}
                            onChange={(e) => setNewInstrument(e.target.value)}
                            onPressEnter={handleAdd}
                            style={{ flex: 1 }}
                          />
                          <Button 
                            type="primary"
                            onClick={handleAddInstrument}
                            disabled={loading}
                          >
                            Add
                          </Button>
                        </div>
                
                        {loading ? (
                          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                            <Spin />
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {instruments.map((instrument, index) => (
                              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Input
                                  value={instrument}
                                  readOnly
                                  style={{ flex: 1 }}
                                />
                                <Button 
                                  icon={<DeleteOutlined/>}
                                  danger 
                                  onClick={() => handleDeleteInstrument(instrument)}
                                  disabled={loading}
                                />
                                
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Modal>
              
              <Modal
              title="Result Document"
              open={isResultModel}
              onCancel={()=>setisResultModal(false)}
              footer={null}
              width={1200}
            >
              {loading ? (
                <Spin size="large" />
              ) : (
                documentData && (
                  <TechnicianTextEditor
                    dc_po_number={documentData.dc_po_number}
                    title={documentData.title}
                  />
                )
              )}
            </Modal>
            </>
          );
      case 'assignTasks':
        return (
          <>
            <h2>Tasks</h2>

            <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginBottom: 16 }}>
              + Assign Task
            </Button>
            <Table
              columns={columnsAssignTasks}
              dataSource={taskData}
              rowKey="sl_no"
              pagination={8}
              bordered
              scroll={{ x: 'max-content' }}
            />
            <Modal
              title="Assign New Task"
              visible={isModalVisible}
              onCancel={() => setIsModalVisible(false)}
              footer={null} 
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
              >
                <Form.Item
                  name="task_name"
                  label="Task Name"
                  rules={[{ required: true, message: 'Please enter the task name!' }]}
                >
                  <Input placeholder="Enter task name" />
                </Form.Item>

                <Form.Item
                  name="dc_po_number"
                  label="DC/PO Number"
                  rules={[{ required: true, message: 'Please select a DC/PO number!' }]}
                >
                  <Select placeholder="Select DC/PO number">
                  {data2
                        .filter(option => option.status === 'Approved')  // Filter for approved status
                        .map(option => (
                          <Option key={option.dc_po_number} value={option.dc_po_number}>
                            {option.dc_po_number}
                          </Option>
                        ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="report"
                  label="Report"
                  rules={[{ required: true, message: 'Please enter the report!' }]}
                >
                  <Select placeholder="Select reports">
                    {documents.map((doc)=>(
                       <Option key={doc.title} value={doc.title}>
                        {doc.title}
                       </Option>
                    )
                    )}
                  </Select>
                </Form.Item>

                <Form.Item
                    name="instrument"
                    label="Instrument"
                    rules={[{ required: true, message: 'Please enter the instrument!' }]}
                  >
                    <Select placeholder="Select instruments">
                      {instruments.map((instrument) => (
                        <Option key={instrument} value={instrument}>
                          {instrument}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                <Form.Item
                  name="technician"
                  label="Technician"
                  rules={[{ required: true, message: 'Please enter the technician!' }]}
                >
                  <Select placeholder="Select technicians">
                    {
                      technicians.map((technician)=>(
                        <Option key={technician} value={technician}>
                        {technician}
                        </Option>
                      ))
                    }
                  </Select>
                  </Form.Item>
                <Form.Item
                  name="due_date"
                  label="Due Date"
                  rules={[{ required: true, message: 'Please select the due date!' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
            <Modal
              title="Result Document"
              open={isResultModel}
              onCancel={()=>setisResultModal(false)}
              footer={null}
              width={1200}
            >
              {loading ? (
                <Spin size="large" />
              ) : (
                documentData && (
                  <TechnicianTextEditor
                    dc_po_number={documentData.dc_po_number}
                    title={documentData.title}
                  />
                )
              )}
            </Modal>
             <Modal
              title="Add Remarks"
              open={remarksModalVisible}
              onCancel={handleRemarksModalClose}
              onOk={handleRemarksSubmit}
            >
             <textarea
               rows={5}
               style={{ width: "100%" }}
               value={remarks}
               onChange={(e) => setRemarks(e.target.value)}
            />
            </Modal>
          </>
        );
      case 'report':
        return(
          <>
            {showEditor ? (
              <div>
                <Button 
                  type='primary'
                  onClick={handleBackToReports}
                  style={{ marginBottom: '16px' }}
                >
                  ← Back to Reports
                </Button>
                <TextEditor id={selectedDoc._id} />
              </div>
            ) : (
              <>
                <h2>Reports</h2>
                <Button type='primary' style={{marginBottom:'10px'}} onClick={()=> setAddReportModal(true)}>+ New Report</Button>
                <Table
                  columns={columnsReports}
                  dataSource={data}
                  pagination={{ pageSize: 8 }}
                  onRow={(record) => ({
                    onClick: () => handleDocumentClick(documents.find((doc) => doc._id === record.key)),
                    style: {
                      cursor: 'pointer',
                    },
                  })}
                />
                <Modal
                title="New Document"
                open={isAddResportModal}
                onOk={handleCreateDocument}
                onCancel={() => {
                  setAddReportModal(false);
                  setNewDocTitle('');
                  setSelectedTemplate('blank');
                }}
                okButtonProps={{ disabled: !newDocTitle.trim() }}
                >
                  <Input
                    placeholder="Document Title"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    onPressEnter={handleCreateDocument}
                    style={{ marginBottom: '16px' }}
                  />

                  <Select
                    style={{ width: '100%' }}
                    value={selectedTemplate}
                    onChange={(value) => setSelectedTemplate(value)}
                  >
                    {DOCUMENT_TEMPLATES.map((template) => (
                      <Select.Option key={template.id} value={template.id}>
                        {template.title} - {template.description}
                      </Select.Option>
                    ))}
                  </Select>
                </Modal>
              </>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
    <Sider
      width={220}
      style={{
        height: '100vh',
        backgroundColor: '#fff',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      {/* Logo Section */}
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
        }}
      >
        <img src={logo} style={{ width: '100px', height: '50px' }} />
      </div>

      {/* Menu Section */}
      <Menu
        mode="inline"
        selectedKeys={[selectedMenu]}
        onClick={handleMenuClick}
        style={{ height: 'calc(100% - 50px)', borderRight: 0 }}
      >
        <Menu.Item key="home" icon={<HomeOutlined />}>
          Home
        </Menu.Item>
        <Menu.Item key="assignTasks" icon={<FileDoneOutlined />}>
          Assign Tasks
        </Menu.Item>
        <Menu.Item key="report" icon={<FileSearchOutlined />}>
          Reports
        </Menu.Item>
      </Menu>

      {/* Footer Section with Logout Button */}
      <div style={{ position: 'absolute', bottom: 20, width: '100%' }}>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          block
          onClick={()=>navigate("/")}
          style={{color:'#1890ff'}}
        >
          Logout
        </Button>
      </div>
    </Sider>

    {/* Main Content Section */}
    <Layout style={{ marginLeft: 220 }}>
      <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
        {renderContent()}
      </Content>
    </Layout>
  </Layout>

  );
}

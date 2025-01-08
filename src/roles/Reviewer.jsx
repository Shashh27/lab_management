import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Table, Button, Modal, Input, Space, Tag, message , Badge , Spin} from 'antd';
import { LogoutOutlined, BellOutlined , CheckCircleOutlined , ArrowLeftOutlined , CloseCircleOutlined} from '@ant-design/icons';
import logo from '../assets/cmti.webp';
import TechnicianTextEditor from '../components/TechnicianTextEditor';

const { Header, Content } = Layout;

const API_URL = 'http://localhost:5000/api';
const API_URL2 = 'http://localhost:7000/api';

export default function Reviewer() {

    const [result , setResult] = useState([]);
    const [data2 , setData] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [isResultModel , setisResultModal] = useState(false);
    const [documentData, setDocumentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [remarksModalVisible, setRemarksModalVisible] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [showEditor , setShowEditor] = useState(false);

    const fetchResults = async()=>{
        try{
        const response = await axios.get('http://localhost:3000/reviewer')
        setResult(response.data);
        }
        catch(error){
             console.log(error);
        }
    }

    useEffect(()=>{
        fetchResults();
    })

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

      const handleReportModalOpen = (record) => {
        const customer = data2.find((item) => item.dc_po_number === record.dc_po_number);
        if (customer) {
          setSelectedCustomer(customer);
          setIsReportModalVisible(true);
        } else {
          message.error("Customer details not found.");
        }
      };

      const handleReportModalClose = () => {
        setIsReportModalVisible(false);
        setSelectedCustomer(null);
      };

      const updateTaskStatus = async (dc_po_number, report, technician, status) => {
        try {
          const response = await axios.put('http://localhost:3000/put-reviewer-tasks', {
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
    
      const handleStatusChange = (record, status) => {
        
        const { dc_po_number, report , technician} = record;
      
        updateTaskStatus(dc_po_number, report, technician, status);
      };

      const handleResultDocumentClick = async (dc_po_number, title) => {
        setLoading(true);
        try {
          const response = await axios.get(`${API_URL2}/documents/${dc_po_number}/${title}`);
          setDocumentData(response.data);
          setisResultModal(true);
          setShowEditor(true);
        } catch (error) {
          message.error("Result not found!");
          console.error('Error fetching document:', error);
        } finally {
          setLoading(false);
        }
      };


      const handleRemarksModalOpen = (record) => {
        setSelectedCustomer(record);
        setRemarks(record.reviewer_remarks || ""); // Initialize the textarea with existing remarks
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
          const response = await axios.put("http://localhost:3000/put-reviewer-remarks", {
            dc_po_number,
            report,
            technician,
            remarks,
          });
          if (response.status === 200) {
            message.success("Remarks updated successfully!");
            await fetchResults(); // Refresh the table data
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
      } ,
      {
            title: 'Result', dataIndex: 'result', key: 'result', align:'center',
            render: (_, record) => (
                <Space>
                <Button
                  type="link"
                  onClick={() => handleResultDocumentClick(record.dc_po_number, record.report)}
                >
                  {record.report}
                </Button>
                <Button type="link" style={{color:'red'}} onClick={() => handleRemarksModalOpen(record)}>
                  Remarks
                </Button>
              </Space>
            ),
          },
      {
          title:'Technician', dataIndex:'technician', key:'technician', align:'center',
      },
      {
        title: "Authorizer Status",
        dataIndex: "authorizer_status",
        key: "authorizer_status",
        align:'center',
        render: (text) => {
          const color = text === "Approved" ? "#34A853" : text === "Rejected" ? "#EA4335" : "grey";
          return <span style={{ color, fontWeight: "bold" }}>{text || "Pending"}</span>;
        },
      },   
      {
        title: "Reviewer Status",
        dataIndex: "reviewer_status",
        key: "reviewer_status",
        align:'center',
        render: (text) => {
          const color = text === "Approved" ? "#34A853" : text === "Rejected" ? "#EA4335" : "grey";
          return <span style={{ color, fontWeight: "bold" }}>{text || "Pending"}</span>;
        },
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
              onClick={() => handleStatusChange(record, 'Approved')}
            >
              Approve
            </Button>
            <Button
              style={{borderColor:'#EA4335' , color:'#EA4335'}}
              type="default"
              icon={<CloseCircleOutlined />}
              onClick={() => handleStatusChange(record, 'Rejected')}
            >
              Reject
            </Button>
          </Space>
        ),
      },
      
    ];

  const orderColumns = [
    {
      title: "Sl. No",
      dataIndex: "key",
      key: "key",
      render: (text, record, index) => index + 1,
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

  return (
    <Layout>
      <Header
        style={{
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <img src={logo} style={{ width: '100px', height: '50px', marginTop: '17px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          <Badge overflowCount={99}>
            <BellOutlined style={{ fontSize: '24px', cursor: 'pointer' }} />
          </Badge>
          <Button type="primary" onClick={()=>navigate("/")} icon={<LogoutOutlined />}>
            Log Out
          </Button>
        </div>
      </Header>
      <Content style={{ padding: '20px' }}>
        {
          showEditor ? (
            <div>
                   <Button
                    type="primary"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => setShowEditor(false)}
                    style={{ marginBottom: '20px' }}
                  >
                    Back to Tasks
                  </Button>
                  {
                    documentData && (
                      <TechnicianTextEditor
                        dc_po_number={documentData.dc_po_number}
                        title={documentData.title}
                      />
                    )
                  }
            </div>
          ) : (
            <div>
              <h2>Current tasks</h2>
        <Table columns={columnsHome} dataSource={result} pagination="5" loading={loading} />
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
            </div>
          )
        }
        
      </Content>
    </Layout>
  );
}
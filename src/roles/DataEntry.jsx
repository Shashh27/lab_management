import React, { useState, useEffect } from "react";
import { Layout, Table, Button, Modal, Form, Input, Switch, DatePicker, Row, Col , message, Spin } from "antd";
import logo from '../assets/cmti.webp';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import TechnicianTextEditor from "../components/TechnicianTextEditor";
import { useNavigate } from "react-router-dom";
import GeneralTextEditor from "../components/GeneralTextEditor";

const { Header, Content } = Layout;

const API_URL = 'http://localhost:5000/api';
const API_URL2 = 'http://localhost:7000/api';

export default function DataEntry() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [items, setItems] = useState([{ key: Date.now() }]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [data2, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor , setShowEditor] = useState(false);

  const navigate = useNavigate();

  const [isResultModel , setisResultModal] = useState(false);
  const [documentData, setDocumentData] = useState(null);

  const [approvedTasks, setApprovedTasks] = useState([]);

  const fetchApprovedTasks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/get-approved-tasks');
      setApprovedTasks(response.data);
    } catch (error) {
      message.error("Failed to fetch approved tasks: " + error.message);
    }
  };

  useEffect(() => {
    fetchApprovedTasks();
  }, []);
  

  useEffect(() => {
    // Fetch customer data when component mounts
    const fetchCustomerData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/get-customers');
        setData(response.data);
        console.log("data:",data2);
        setLoading(false);
      } catch (error) {
        message.error("Failed to fetch customer data: " + error.message);
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  console.log(data2);

  const handleModalOpen = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    form.resetFields();
    setItems([{ key: Date.now() }]); // Reset the items when closing the modal
  };

  const handleReportModalOpen = (customer) => {
    setSelectedCustomer(customer);
    setIsReportModalVisible(true);
  };

  const handleReportModalClose = () => {
    setIsReportModalVisible(false);
    setSelectedCustomer(null);
  };

  const handleFormSubmit = async (values) => {
    console.log("Form Values:", values);
  
    // Transform the data to match backend expectations
    const customerData = [{  // Wrap in array since backend expects array
      company_name: values.companyName,
      address: values.address,
      contact_person: values.contactPerson,
      mobile_number: values.mobileNo,
      dc_po_number: values.dcPoNumber,
      dc_po_date: values.dcPoDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      email_id: values.emailId,
      designation: values.designation,
      gst_number: values.gstNumber,
      msme_registration: values.msmeRegistration ? "YES" : "NO",
      customer_order: values.items.map(item => ({  // Transform items to customer_order format
        item_description: item.itemDescription,
        qty: parseInt(item.qty),
        specification: item.specification,
        type_of_test_required_with_std: item.testType
      }))
    }];
  
    try {
      const response = await axios.post('http://localhost:3000/add-customers', customerData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 201) {  // Note: Backend returns 201 for successful creation
        message.success("Customer Data Submitted Successfully");
        console.log("Customer Data Submitted Successfully:", response.data);
        handleModalClose();
      }
    } catch (error) {
      message.error("Failed to submit: " + error.response?.data?.error || error.message);
      console.error("Error submitting data:", error);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { key: Date.now() }]);
  };

  const handleDeleteItem = (key) => {
    setItems(items.filter(item => item.key !== key));
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

  const columns = [
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
      key: "dc_po_number", align:'center',
      render: (text) => text || "N/A", // Safeguard for missing data
    },
    {
      title: "Customer Details",
      dataIndex: "customerDetails",
      key: "customerDetails", align:'center',
      render: (_, record) => (
        <Button type="link" onClick={() => handleReportModalOpen(record)}>
          View
        </Button>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status", align:'center',
      render: (text) => {
        const color = text === "Approved" ? "green" : text === "Rejected" ? "red" : "grey";
        return <span style={{ color, fontWeight: "bold" }}>{text || "Pending"}</span>;
      },    
    },
    {
      title: "Result",
      dataIndex: "report",
      key: "report", align:'center',
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
    }
  ];


  const orderColumns = [
    {
      title: "Sl. No",
      dataIndex: "key",
      key: "key",
      align:'center',
      render: (text, record, index) => index + 1, // This will display the row number
    },
    {
      title: "Item Description",
      dataIndex: "item_description",
      key: "item_description", align:'center',
    },
    {
      title: "Quantity",
      dataIndex: "qty",
      key: "qty", align:'center',
    },
    {
      title: "Specification",
      dataIndex: "specification",
      key: "specification", align:'center',
    },
    {
      title: "Test Type",
      dataIndex: "type_of_test_required_with_std",
      key: "type_of_test_required_with_std", align:'center',
    },
  ];

  
  return (
    <Layout>
      <Header style={{
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", // Added to push items to both ends
      }}>
        <div>
          <img src={logo} style={{ width: '100px', height: '50px', marginTop: '17px' }} />
        </div>
        <Button type="primary" icon={<LogoutOutlined />} onClick={()=>navigate("/")}>Log Out</Button>
      </Header>

      <Content style={{ padding: "24px" }}>

        {
          showEditor ? (
            <div>
              <Button
                    type="primary"
                    icon={<ArrowLeftOutlined/>}
                    onClick={() => setShowEditor(false)}
                    style={{ marginBottom: '20px' }}
                  >
                    Back to Tasks
                  </Button>
                  {
                    documentData && (
                      <GeneralTextEditor
                        dc_po_number={documentData.dc_po_number}
                        title={documentData.title}
                      />
                    )
                  }
            </div>
          ) : (
            <div>
                <h1>Customer Info</h1>
        <Button type="primary" style={{ marginBottom: "16px" }} onClick={handleModalOpen}>
          + Add Customer Details
        </Button>
        <Table columns={columns} dataSource={data2} />

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
          title="Customer Details"
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
        >
          <Form form={form} onFinish={handleFormSubmit} layout="vertical">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Company Name" name="companyName" rules={[{ required: true, message: "Please enter company name!" }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Address" name="address" rules={[{ required: true, message: "Please enter address!" }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Contact Person" name="contactPerson" rules={[{ required: true, message: "Please enter contact person!" }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Mobile No" name="mobileNo" rules={[{ required: true, message: "Please enter mobile number!" }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="DC/PO Number" name="dcPoNumber" rules={[{ required: true, message: "Please enter DC/PO number!" }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="DC/PO Date" name="dcPoDate" rules={[{ required: true, message: "Please select a date!" }]}>
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Email ID" name="emailId" rules={[{ required: true, message: "Please enter email!", type: "email" }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="GST Number" name="gstNumber" rules={[{ required: true, message: "Please enter GST number!" }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Designation" name="designation" rules={[{ required: true, message: "Please enter designation!" }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="MSME Registration" name="msmeRegistration" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <h3>Item Details</h3>
            {items.map((item, index) => (
              <div key={item.key} style={{ marginBottom: "16px", border: "1px solid #ddd", padding: "16px" }}>
                <Form.Item label="Item Description" name={['items', index, 'itemDescription']} rules={[{ required: true, message: "Please enter item description!" }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Qty" name={['items', index, 'qty']} rules={[{ required: true, message: "Please enter quantity!" }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Specification" name={['items', index, 'specification']} rules={[{ required: true, message: "Please enter specification!" }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Type of Test Required" name={['items', index, 'testType']} rules={[{ required: true, message: "Please enter test type!" }]}>
                  <Input />
                </Form.Item>
                <Button type="link" onClick={() => handleDeleteItem(item.key)} style={{ color: 'red' }}>
                  Delete Item
                </Button>
              </div>
            ))}
            <Button type="dashed" onClick={handleAddItem} style={{ width: "100%" }}>
              + Add More Items
            </Button>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginTop: "16px" }}>
                Submit
              </Button>
              <Button onClick={handleModalClose} style={{ marginLeft: "8px", marginTop: "16px" }}>Cancel</Button>
            </Form.Item>
          </Form>
        </Modal>
            </div>
          )
        }
      </Content>
    </Layout>
  );
}

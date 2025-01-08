import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Table, Button, Modal, Space, Tag, message, Badge } from 'antd';
import { LogoutOutlined, BellOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import logo from '../assets/cmti.webp';
import TechnicianTextEditor from '../components/TechnicianTextEditor';
import { useNavigate, useParams } from 'react-router-dom';

const { Header, Content } = Layout;

const API_URL = 'http://localhost:5000/api';

export default function Technician() {
  const [showEditor, setShowEditor] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const navigate = useNavigate();
  const { name } = useParams();

  const totalPending = tableData.filter((task) => task.status === null).length;

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

  const handleDocumentClick = (reportName, dcPoNumber) => {
    const matchingDoc = documents.find((doc) => doc.title === reportName);
    if (matchingDoc) {
      setSelectedDoc({
        ...matchingDoc,
        dc_po_number: dcPoNumber
      });
      setShowEditor(true);
    } else {
      message.error('Document not found!');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/technician-task`, {
        params: { technician_name: name },
      });
      const formattedData = response.data.map((task, index) => ({
        key: index + 1,
        slno: index + 1,
        taskName: task.task_name,
        instrument: task.instrument,
        dcPoNo: task.dc_po_number,
        report: task.report,
        authorizer_status: task.authorizer_status,
        dueDate: task.due_date,
        authorizer_remarks: task.authorizer_remarks,
      }));
      setTableData(formattedData);
    } catch (error) {
      console.error('Error fetching tasks:', error.message);
      message.error('Failed to fetch tasks. Please try again later.');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleReportModalOpen = async (record) => {
    const { dcPoNo } = record;
    try {
      const response = await axios.get('http://localhost:3000/get-customers2', {
        params: { dc_po_number: dcPoNo },
      });
      const customerData = response.data[0];
      setSelectedCustomer(customerData);
      setIsReportModalVisible(true);
    } catch (error) {
      message.error(`Failed to fetch customer details: ${error.message}`);
    }
  };

  const columns = [
    {
      title: 'Sl. No',
      dataIndex: 'slno',
      key: 'slno',
      align: 'center',
    },
    {
      title: 'Task Name',
      dataIndex: 'taskName',
      key: 'taskName',
      align: 'center',
    },
    {
      title: 'Instrument',
      dataIndex: 'instrument',
      key: 'instrument',
      align: 'center',
    },
    {
      title: 'DC/PO No',
      dataIndex: 'dcPoNo',
      key: 'dcPoNo',
      align: 'center',
    },
    {
      title: 'Customer Details',
      dataIndex: 'customerDetails',
      align: 'center',
      key: 'customerDetails',
      render: (_, record) => (
        <Button type="link" onClick={() => handleReportModalOpen(record)}>
          View
        </Button>
      ),
    },
    {
      title: 'Report',
      dataIndex: 'report',
      key: 'report',
      align: 'center',
      render: (text, record) => (
        <Button type="link" onClick={() => handleDocumentClick(text, record.dcPoNo)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'authorizer_status',
      key: 'authorizer_status',
      align: 'center',
      render: (status) => (
        <Tag color={status === 'Approved' ? 'green' : status === "Rejected" ? 'red' : 'grey'}>
          {status || "Pending"}
        </Tag>
      ),
    },
    {
      title: 'Authorizer Remarks',
      dataIndex: 'authorizer_remarks',
      key: 'authorizer_remarks',
      align: 'center',
    }
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
          <Badge count={totalPending} overflowCount={99}>
            <BellOutlined style={{ fontSize: '24px', cursor: 'pointer' }} />
          </Badge>
          <Button type="primary" onClick={() => navigate("/")} icon={<LogoutOutlined />}>
            Log Out
          </Button>
        </div>
      </Header>
      <Content style={{ padding: '20px' }}>
        {showEditor ? (
          <div>
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => setShowEditor(false)}
              style={{ marginBottom: '20px' }}
            >
              Back to Tasks
            </Button>
            {selectedDoc && (
              <TechnicianTextEditor
                id={selectedDoc._id}
                dc_po_number={selectedDoc.dc_po_number}
                title={selectedDoc.title}
              />
            )}
          </div>
        ) : (
          <>
            <h2>Current tasks</h2>
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={{ pageSize: 10 }}
              bordered
            />
          </>
        )}

        <Modal
          title="Customer Details"
          open={isReportModalVisible}
          onCancel={() => setIsReportModalVisible(false)}
          footer={null}
        >
          {selectedCustomer ? (
            <div>
              <p><strong>Company Name:</strong> {selectedCustomer.company_name}</p>
              <p><strong>Address:</strong> {selectedCustomer.address}</p>
              <p><strong>Contact Person:</strong> {selectedCustomer.contact_person}</p>
              <p><strong>Mobile No:</strong> {selectedCustomer.mobile_number}</p>
              <p><strong>DC/PO Number:</strong> {selectedCustomer.dc_po_number}</p>
              <p><strong>DC/PO Date:</strong> {selectedCustomer.dc_po_date ? new Date(selectedCustomer.dc_po_date).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Email ID:</strong> {selectedCustomer.email_id}</p>
              <p><strong>Designation:</strong> {selectedCustomer.designation}</p>
              <p><strong>GST Number:</strong> {selectedCustomer.gst_number}</p>
              <p><strong>MSME Registration:</strong> {selectedCustomer.msme_registration}</p>

              <h3>Items:</h3>
              <Table
                columns={orderColumns}
                dataSource={selectedCustomer.customer_order}
                pagination={false}
                rowKey={(record, index) => index}
              />
            </div>
          ) : (
            <p>Loading customer details...</p>
          )}
        </Modal>
      </Content>
    </Layout>
  );
}
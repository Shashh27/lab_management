import React, { useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from './assets/cmti.webp'


const { Option } = Select;

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { username, password, role } = values;
      const response = await axios.post('http://localhost:3000/users', { username, password, role });
      message.success('Sign up successful!');
      navigate('/')
    } catch (error) {
      message.error('Sign up failed, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop:'100px' }}>
        <img src={logo} style={{ width: '100px', height: '50px' }} />
    </div>
    <div style={{ maxWidth: 400, margin: '0 auto' , marginTop:'10px' , border:'1px solid #d3d3d3' , padding:'20px', borderRadius:'10px'}}>
      <h2 style={{fontFamily:'sans-serif'}}>Sign Up</h2>
      <Form name="signup" onFinish={onFinish}>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please input your password!' }]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select your role!' }]}
        >
          <Select>
            <Option value="Data-Entry">Data-Entry</Option>
            <Option value="Authorizer">Authorizer</Option>
            <Option value="Technician">Technician</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign Up
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center' }}>
        <p>
          Already have an account? <Button type='link' onClick={()=> navigate('/')} >Login</Button>
        </p>
      </div>
    </div>
    </>
  );
};

export default SignUp;

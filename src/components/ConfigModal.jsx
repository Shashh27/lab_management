import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, message, Spin } from 'antd';
import { DeleteOutlined  } from '@ant-design/icons';

import axios from 'axios';

const ConfigModal = ({ isVisible, onClose, onInstrumentsUpdate }) => {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newInstrument, setNewInstrument] = useState('');

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

  const handleAdd = async () => {
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

  const handleDelete = async (instrumentName) => {
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

  return (
    <Modal
      title="General Configuration"
      open={isVisible}
      onCancel={onClose}
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
            onClick={handleAdd}
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
                  onClick={() => handleDelete(instrument)}
                  disabled={loading}
                />
                
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ConfigModal;

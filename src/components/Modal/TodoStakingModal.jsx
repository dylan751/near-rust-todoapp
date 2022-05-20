import React, { useCallback, useEffect, useState } from 'react';
import { Form, Modal, Select, Input, Button } from 'antd';

function TodoStakingModal({ handleCancel, visible, formData, hide }) {
  const [form] = Form.useForm();

  console.log('Visible:', visible);

  const onOk = () => {
    // formData.audioId = audioId;
    // formData.audioText = audioText;
    // formData.audioName = audioName;
    hide();
  };

  return (
    <Modal
      wrapClassName={'select-token-wrap'}
      centered
      width={400}
      className="bg-cardBg rounded-2xl"
      style={{ background: 'rgb(29, 41, 50)' }}
      visible={true}
      footer={false}
      onCancel={hide}
    >
      <div
        className={'w-full h-80 rounded-3xl '}
        style={{ background: 'rgb(29, 41, 50)' }}
      >
        <h1 className="font-bold text-lg text-white">Staking Confirm</h1>
        <div className="mt-10 flex flex-wrap items-center"></div>
        <Form layout="vertical" form={form} onFinish={onOk}>
          <Form.Item
            name="audio-file"
            label="contactFlow.chooseAudio"
            rules={[
              {
                required: true,
                message: 'contactFlow.requiredAudioFile',
              },
            ]}
            initialValue={0}
            style={{ margin: '0', padding: '0' }}
          ></Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={(e) => handleCreateAudioFile(isCreateAudioFile)}
            >
              contactFlow.createAudio
            </Button>
          </Form.Item>
          <Form.Item className="!justify-right !text-center">
            <Button
              type="primary"
              htmlType="submit"
              style={{ backgroundColor: '#605e5e', borderColor: '#605e5e' }}
            >
              button.Ok
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

export default TodoStakingModal;

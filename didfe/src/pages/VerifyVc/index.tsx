import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Alert, Spin, Input, Button, message } from 'antd';
import { useModel } from 'umi';
import { recoverPublicKey, publicKeyToAccount, queryVcEnabled } from '@/utils'
const { TextArea } = Input;

const VerifyVc: React.FC = () => {

  const { initialState, setInitialState } = useModel('@@initialState');
  const [vcContent, setVcContent] = useState<string>("");

  const [ spinState, setSpinState ] = useState<DID.SpinState>({spinning: false})

  const verifySig = (info: DID.VcInfo, proof: DID.VcProof): boolean => {

    
    
    const pubKey = recoverPublicKey(JSON.stringify(info), proof.signature, parseInt(proof.signature.slice(130, 132), 16) - 27);
    const recoverAccount = publicKeyToAccount(pubKey);
    console.log(proof.creator, recoverAccount);
    if(proof.creator.toLowerCase() === recoverAccount.toLowerCase()) 
      return true;

    return false;
  };


  const verifyVc = async () => {
    const jsonData: DID.VcDocument = JSON.parse(vcContent);
    const { info, proof } = jsonData;
    setSpinState({spinning: true, tip: "正在验证此 VC 是否启用"});
    if(verifySig(info, proof)){
      if(await queryVcEnabled(proof.signature, initialState?.web3, initialState?.didInfo?.address)) {

        message.success('验证成功');
      }
      else {
        message.error("此 VC 未启用")
      }  
    } else {
    message.error("验证 VC 签名失败");
    }
    setSpinState({spinning: false});
  };

  const { spinning, tip } = spinState;
  return (
    <PageContainer>
      <Card>
      <Alert 
        message="在输入框输入VC文档" 
        type="info" 
        showIcon 
        banner          
        style={{
          margin: -12,
          marginBottom: 24,
        }}
      />
      <Spin spinning={spinning} tip={tip}>
        <TextArea 
          rows={18} 
          autoSize={true}
          onChange={(e) => { 
            setVcContent(e.target.value); 
          }} 
        />
        <Button style={{marginTop: 24}} onClick={verifyVc} type="primary"> 验证 </Button>
      </Spin>
      </Card>
    </PageContainer>
  );
};

export default VerifyVc;

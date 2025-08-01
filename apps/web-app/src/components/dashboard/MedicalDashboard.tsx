import React, { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';

interface VitalSign {
  name: string;
  value: number;
  unit: string;
}

const MedicalDashboard: React.FC = () => {
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const { sendMessage, lastMessage } = useWebSocket('wss://medical-streams.example.com');

  useEffect(() => {
    if (lastMessage !== null) {
      const updatedVitalSigns = JSON.parse(lastMessage.data);
      setVitalSigns(updatedVitalSigns);
    }
  }, [lastMessage]);

  return (
    <div>
      <h1>Medical Dashboard</h1>
      <ul>
        {vitalSigns.map((sign, index) => (
          <li key={index}>
            {sign.name}: {sign.value} {sign.unit}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MedicalDashboard;

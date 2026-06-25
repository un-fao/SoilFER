import React, { useState } from 'react';
import styled from 'styled-components';

// Floating panel container for navigation
const FloatingNavPanel = styled.div`
  position: absolute;  
  display: flex;
  padding: 5px 10px;
  z-index: 100;
  width: fit-content;
  min-width: 700px;
  margin: 0;
`;

// Styled button for navigation
const NavButton = styled.button<{ active: boolean; status: string }>`
  background-color: ${(props) => (props.active ? '#fbb615' : props.status)};
  color: ${(props) => (props.active ? '#fff' : '#6e431d')};
  font-weight: bold;
  border: 1px solid #6e431d;
  padding: 0;
  margin: 0 3px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 8pt;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  &:hover {
    background-color: orange;
    color: #fff;
  }
`;

export const FloatingNav = (props) => {
  const {rerender,setRerender,historicalClimate,setHistoricalClimate,details,setDetails,show,setShow,soil,crop,irrigation,input} = props;
  const [activeTab, setActiveTab] = useState(show);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setShow(tab);
  };

  const tabs = ['Soil', 'Crop', 'Irrigation & Farm Management', 'Results & Report', 'Technical Documentation'];
  let status = {'Soil': '#fefffb', 'Crop': '#fefffb', 'Irrigation & Farm Management': '#fefffb', 'Results & Report': '#fefffb', 'Technical Documentation': 'orange'};

  soil != ''? status['Soil'] = "#c8ae8d": status['Soil'] = "#fefffb";
  crop != ''? status['Crop'] = "#c8ae8d": status['Crop'] = "#fefffb";
  (irrigation != '' && input != '')? status['Irrigation & Farm Management'] = "#c8ae8d": status['Irrigation & Farm Management'] = "#fefffb";
  (soil != '' && crop != '' && (irrigation != '' && input != ''))? status['Results & Report'] = "#c8ae8d": status['Results & Report'] = "#fefffb";
  show == 'Technical Documentation'? status['Soil'] = "#c8ae8d":status['Soil'] = "#c8ae8d";
  
  return (
    <FloatingNavPanel>
      <i className="pi pi-window-minimize p-0 m-0 cursor-pointer" onClick={()=>{document.getElementById('showFloater').style.display='none';document.getElementById('hideFloater').style.display='block'}} style={{ color: '#6e431d' }}></i>
      {tabs.map(
        (tab) => (
          <NavButton
            key={tab}
            active={show === tab}
            onClick={() => handleTabClick(tab)}
            status={status[tab]}
            disabled={(status[tab] != "#c8ae8d" && status[tab] != "orange")}
          >
            <img src={"images/"+tab+"Button.png"} alt={tab} style={{ height: '25px' }} />
          </NavButton>
        )
      )}
      
    </FloatingNavPanel>    
  );
};

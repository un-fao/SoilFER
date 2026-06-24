import React, { useRef,useState } from "react";
import { Panel, Info, SubmitButton, CancelButton } from '../App';
import { Card } from 'primereact/card';
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import { InputSwitch, InputSwitchChangeEvent } from "primereact/inputswitch";
import { RadioButton, RadioButtonChangeEvent } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";

export const Input = (props) => {
    const {setShow,input,setInput,inputCode,setInputCode,irrigation} = props;
    interface Item {
        name: string;
        value: number;
    }
    
    const [dontKnow,setDontKnow] = useState<boolean>(false);
    const infoHandler = () => {
        setDontKnow(true);
    };
    const infoDisHandler = () => {
        setDontKnow(false);
    };
    const [goal, setGoal] = useState<Item>(null);
    const goals: Item[] = [
        {name: 'Subsistence farming (growing mainly for household use)', value: 1},
        {name: 'Market-oriented farming (commercial production is the main goal)', value: 2}
    ];
    const [variety, setVariety] = useState<Item>(null);
    const varieties: Item[] = [
        {name: 'Traditional, local varieties', value: 1},
        {name: 'High-yielding or fully improved varieties', value: 2}
    ];
    const [labour, setLabour] = useState<Item>(null);
    const labours: Item[] = [
        {name: 'High labour intensity (manual work)', value: 1},
        {name: 'Low labour intensity (fully mechanized)', value: 2}
    ];
    const [fertilizer, setFertilizer] = useState<Item>(null);
    const fertilizers: Item[] = [
        {name: 'No application of nutrients or fertilizers', value: 1},
        {name: 'Optimum application of fertilizers/nutrients', value: 2}
    ];
    const [chemical, setChemical] = useState<Item>(null);
    const chemicals: Item[] = [
        {name: 'No chemical pest or disease control', value: 1},
        {name: 'Regular and optimal chemical use for pest, disease, and weed control', value: 2}
    ];
    const [fertility, setFertility] = useState<Item>(null);
    const fertilities: Item[] = [
        {name: 'Rely on fallows to restore soil fertility', value: 1},
        {name: 'Use advanced soil management practices and no reliance on fallows', value: 2}
    ];

    const [calculatedFarmManagement,setCalculatedFarmManagement] = useState<boolean>(false);
    const calculateFarmManagement = ()=> {
        setCalculatedFarmManagement(true);
        if(labour?.value === 2){            
            setInput("High");
            setInputCode("H");
        }
        else if((variety?.value === 2) && (fertilizer?.value === 2 || chemical?.value === 2)){
            setInput("High");
            setInputCode("H");
        }
        else{
            setInput("Low");
            setInputCode("L");
        }
    }

  return (
    <>
        {!dontKnow && <div className="card">
            <div className="card">
                <h2>How do you manage your farm?</h2>
                <div className="flex flex-row p-0 m-0 col-12">
                    <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}><RadioButton inputId="input" name="input" value="Low" onChange={(e: RadioButtonChangeEvent) => {setInput(e.value);setInputCode('L');}} checked={input === 'Low'} /></div>
                    <div className="card p-1 m-0 col-10">Low input (small workforce, traditional local crops, little to no fertiliser use or pest control)<hr/></div>
                </div>
                <div className="flex flex-row p-0 m-0 col-12">
                    <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}><RadioButton inputId="input" name="input" value="High" onChange={(e: RadioButtonChangeEvent) => {setInput(e.value);setInputCode('H');}} checked={input === 'High'} /></div>
                    <div className="card p-1 m-0 col-10">High input (mid - large workforce, high-yield improved crop varieties, use of fertilisers and pest control)</div>                    
                </div>
                <Divider />
                <div className="flex flex-row">
                    <div className="flex col-6"><b>If you are not able to distinguish between the two input management levels, please reply to the following questionnaire</b></div>
                    <div className="flex col-6"><CancelButton onClick={infoHandler} style={{ fontSize: '11pt' }}>QUESTIONNAIRE</CancelButton></div>
                </div>
            </div>            
        </div>}
        {dontKnow && <>
            <div className="card" style={{ width: '700px' }}>
                <h2 className="m-0 p-0">
                    <div className="m-0 p-0 flex flex-row justify-content-start"><img src="images/QuestionnaireIcon.png" alt="Questionnaire Icon" style={{ height: '30px', marginRight: '10px' }} /> QUESTIONNAIRE</div>
                </h2>
                <div className="flex flex-row p-0 m-0">                    
                    <div className="card p-1 m-0">What is your primary farming goal?</div>
                </div>
                <div className="flex flex-row p-0 m-0">
                    <div className="card p-1 m-0 w-full">
                        <div className="p-0 m-0 flex flex-row gap-1">
                            {goals.map((category) => {
                                return (
                                    <div key={category.name} className="flex align-items-center w-full">
                                        <RadioButton inputId={category.name} name="variety" value={category} onChange={(e: RadioButtonChangeEvent) => setVariety(e.value)} checked={variety?.value === category.value} />
                                        <label htmlFor={category.name} className="ml-2">{category.name} </label>
                                    </div>
                                );
                            })}
                        </div><hr/>
                    </div>
                </div>
                <div className="flex flex-row p-0 m-0">                    
                    <div className="card p-1 m-0">What kind of crop varieties do you use?</div>
                </div>
                <div className="flex flex-row p-0 m-0">                    
                    <div className="card p-1 m-0 w-full">
                        <div className="p-0 m-0 flex flex-row gap-1">
                            {varieties.map((category) => {
                                return (
                                    <div key={category.name} className="flex align-items-center w-full">
                                        <RadioButton inputId={category.name} name="goal" value={category} onChange={(e: RadioButtonChangeEvent) => setGoal(e.value)} checked={goal?.value === category.value} />
                                        <label htmlFor={category.name} className="ml-2">{category.name} </label>
                                    </div>
                                );
                            })}
                        </div><hr/>
                    </div>                    
                </div>
                <div className="flex flex-row p-0 m-0">
                    <div className="card p-1 m-0">How much labour do you use on your farm?</div>
                </div>
                <div className="flex flex-row p-0 m-0">                    
                    <div className="card p-1 m-0 w-full">
                        <div className="p-0 m-0 flex flex-row gap-1">
                            {labours.map((category) => {
                                return (
                                    <div key={category.name} className="flex align-items-center w-full">
                                        <RadioButton inputId={category.name} name="labour" value={category} onChange={(e: RadioButtonChangeEvent) => setLabour(e.value)} checked={labour?.value === category.value} />
                                        <label htmlFor={category.name} className="ml-2">{category.name} </label>
                                    </div>
                                );
                            })}
                        </div><hr/>
                    </div>                    
                </div>
                <div className="flex flex-row p-0 m-0">                    
                    <div className="card p-1 m-0">Do you use fertilizers and nutrients on your farm?</div>
                </div>
                <div className="flex flex-row p-0 m-0">
                    <div className="card p-1 m-0 w-full">
                        <div className="p-0 m-0 flex flex-row gap-1">
                            {fertilizers.map((category) => {
                                return (
                                    <div key={category.name} className="flex align-items-center w-full">
                                        <RadioButton inputId={category.name} name="fertilizer" value={category} onChange={(e: RadioButtonChangeEvent) => setFertilizer(e.value)} checked={fertilizer?.value === category.value} />
                                        <label htmlFor={category.name} className="ml-2">{category.name} </label>
                                    </div>
                                );
                            })}
                        </div><hr/>
                    </div>
                </div>
                <div className="flex flex-row p-0 m-0">
                    <div className="card p-1 m-0">Do you use chemicals for pest, disease, and weed control?</div>
                </div>
                <div className="flex flex-row p-0 m-0">
                    <div className="card p-1 m-0 w-full">
                        <div className="p-0 m-0 flex flex-row gap-1">
                            {chemicals.map((category) => {
                                return (
                                    <div key={category.name} className="flex align-items-center w-full">
                                        <RadioButton inputId={category.name} name="chemical" value={category} onChange={(e: RadioButtonChangeEvent) => setChemical(e.value)} checked={chemical?.value === category.value} />
                                        <label htmlFor={category.name} className="ml-2">{category.name} </label>
                                    </div>
                                );
                            })}
                        </div><hr/>
                    </div>
                </div>
                <div className="flex flex-row p-0 m-0">
                    <div className="card p-1 m-0">How do you manage soil fertility on your farm?</div>                    
                </div>
                <div className="flex flex-row p-0 m-0">
                    <div className="card p-1 m-0 w-full">
                        <div className="p-0 m-0 flex flex-row gap-1">
                            {fertilities.map((category) => {
                                return (
                                    <div key={category.name} className="flex align-items-center w-full">
                                        <RadioButton inputId={category.name} name="fertility" value={category} onChange={(e: RadioButtonChangeEvent) => setFertility(e.value)} checked={fertility?.value === category.value} />
                                        <label htmlFor={category.name} className="ml-2">{category.name} </label>
                                    </div>
                                );
                            })}
                        </div><hr/>
                    </div>
                </div>
            </div>
            <div className="flex align-items-center justify-content-center" style={{ width: '100%' }}><CancelButton onClick={()=>{infoDisHandler();calculateFarmManagement();}} style={{ width: '80%', fontSize: '11pt' }}>Return to farm management</CancelButton></div>
        </>}
        <SubmitButton onClick={()=>{setShow('Results & Report')}} disabled={input === '' || irrigation === ''}  style={{ fontSize: '11pt' }} >VIEW YOUR CROP SUITABILITY RESULTS</SubmitButton>
    </>
  )
}

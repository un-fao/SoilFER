import { RadioButton, RadioButtonChangeEvent } from "primereact/radiobutton";

export const Water = (props) => {
  const {irrigation,setIrrigation,waterCode,setWaterCode} = props;
  return (
    <div className="card">
        <div className="flex flex-row p-0 m-0">          
          <h2>Do you use irrigation?</h2>
        </div>
        <div className="flex flex-row p-0 m-1">
            <div className="p-0 ml-3 flex flex-row gap-2">
                <div key="irrigationYes" className="flex align-items-center">
                    <RadioButton inputId="irrigationYes" name="irrigation" value="Yes" onChange={(e: RadioButtonChangeEvent) => {setIrrigation(e.value);setWaterCode('IW');}} checked={irrigation === "Yes"} />
                    <label htmlFor="irrigationYes" className="ml-2">Yes </label>
                </div>
                <div key="irrigationNo" className="flex align-items-center">
                    <RadioButton inputId="irrigationNo" name="irrigation" value="No" onChange={(e: RadioButtonChangeEvent) => {setIrrigation(e.value);setWaterCode('RW');}} checked={irrigation === "No"} />
                    <label htmlFor="irrigationNo" className="ml-2">No </label>
                </div>
            </div>          
        </div>
    </div>
  )
}

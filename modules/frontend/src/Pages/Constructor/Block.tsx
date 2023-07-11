import { LiquidDto } from 'sharedlib/dto/liquid.dto';
import './Block.css'
import { getRequest } from 'common/util';
import React, { useEffect, useState } from 'react';
import SVG_Icon, { CustomSelect } from 'common/components';
import { ReagentStep, StepDTO, TemperatureStep, WashStep } from 'sharedlib/dto/step.dto';
import { StepType } from 'sharedlib/dto/stepType';

const liquids = (await getRequest<LiquidDto[]>("/blockly/liquids")).data;
//console.log(liquids)

interface BlockFields {
    getContent(params: StepDTO["params"]): JSX.Element;
    getStepContent(params: StepDTO["params"]): JSX.Element;
    getClass(): string;
}

// class Washing implements BlockFields {
//     getContent(params: Insertable[]): JSX.Element {
        
//         const initialParams = { 
//             liquid: (params.find(i => i.name == 'liquid'))?.value, 
//             iters: (params.find(i => i.name == 'iters'))?.value  == undefined ? '' : (params.find(i => i.name == 'iters'))?.value, 
//             time: (params.find(i => i.name == 'time'))?.value == undefined ? '' : (params.find(i => i.name == 'time'))?.value
//         };

//         const [washParams, setWashParams] = useState(initialParams);
//         //const liquid = (params.find(i => i.name == 'liquid'))?.value
//         //const iters = (params.find(i => i.name == 'iters'))?.value
//         //const time = (params.find(i => i.name == 'time'))?.value

//         // const handleChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
//         //     const { target } = event;
//         //     setWashParams((prevState) => ({
//         //         ...prevState,
//         //         [target.name]: target.value,
//         //     }));
//         // };

//         const handleChange = (target: HTMLInputElement | HTMLSelectElement) => {
//             setWashParams((prevState) => ({
//                 ...prevState,
//                 [target.name]: target.value,
//             }));
//         };

//         useEffect(() => {   
//             console.log("wash params changed")
//             console.log(washParams);
//         }, [washParams]);

//         return (
//             <>
//                 <div className="block-body">
//                     <div className="block-body-row">
//                         <div className="block-inp">
//                             <label>Reagent:</label>
//                             {/*onChange={handleChange} */}
//                             {/* <select name="liquid" id="wash-sel-liquid" value={washParams.liquid} onChange={handleChange}>
//                                 {liquids.map((liq, index) => {
//                                     return (
//                                         <option value={liq.name} key={index}>{liq.name}</option>
//                                     )
//                                 })}
//                             </select> 
//                             */}
//                             <CustomSelect options={liquids} opt_name={'liquid'} inputChange={handleChange}></CustomSelect>
//                         </div>
//                     </div>

//                     <div className="block-body-row col">

//                         <div className="block-inp">
//                             <label htmlFor="wash-inp-iters">Iterations:</label>
//                             <input id="wash-inp-iters" type="number" name="iters" 
//                                 value={washParams.iters} onChange={(e)=>{handleChange(e.target)}}/>
//                         </div>

//                         <div className="block-inp">
//                             <label htmlFor="wash-inp-time">Inc. time{initialParams.time}: </label>
//                             <input id="wash-inp-time" type="number" name="time" 
//                                 value={washParams.time} onChange={(e)=>{handleChange(e.target)}}/>
//                         </div>

//                     </div>
//                 </div>
//             </>
//         );
//     }

//     getStepContent(params: Insertable[]): JSX.Element {
//         const liquid = (params.find(i => i.name == 'liquid'))?.value
//         const iters = (params.find(i => i.name == 'iters'))?.value
//         const time = (params.find(i => i.name == 'time'))?.value
//         const temp = (params.find(i => i.name == 'temp'))?.value
//         return (
//             <>
//                 <h3>Washing</h3>
//                 <div>
//                     <p>With {liquid}</p>
//                     <p>for {iters} times </p>
//                     <p>x {time} minutes</p>
//                     <p>at {temp} degrees</p>
//                 </div>
//             </>
//         )
//     }

//     getClass(): string {
//         return "block-washing";
//     }
// }

// class Reagent implements BlockFields {
//     getContent(params: Insertable[]): JSX.Element {
//         const liquid = (params.find(i => i.name == 'liquid'))?.value
//         const time = (params.find(i => i.name == 'time'))?.value
//         return (
//             <>
//                 <p className="block-header">Reagent step</p>
//                 <div className="block-body">

//                     <div className="block-body-row">
//                         <div className="block-inp">
//                             <label>Category:</label>
//                             <CustomSelect options={liquids} opt_name={'reag-sel-cat'}></CustomSelect>
//                         {/*   <select id='reag-sel-categ'>
//                                 <option value="a">Category 1</option>
//                                 <option value="b">Category 2</option>
//                                 <option value="c">Category 3</option>
//                             </select> */}
//                         </div>
//                     </div>

//                     <div className="block-body-row">
//                         <div className="block-inp">
//                             <label>Liquid:</label>
//                             <CustomSelect options={liquids} opt_name={'reag-sel-liquid'}></CustomSelect>
//                             {/* <select id='reag-sel-liquid' defaultValue={liquid}>
//                                 {liquids.map((liq, index) => {
//                                     return (
//                                         <option value={liq.name} key={index}>{liq.name}</option>
//                                     )
//                                 })}
//                             </select> */}
//                         </div>
//                     </div>
                    
//                     <div className="block-body-row">
//                         <div className="block-inp">
//                             <label htmlFor="reag-inp-min">Inc. time:</label>
//                             <input id="reag-inp-min" type="number" defaultValue={time} />
//                         </div>
//                     </div>
//                 </div>
//             </>
//         );
//     }

//     getStepContent(params: Insertable[]): JSX.Element {
//         const liquid = (params.find(i => i.name == 'liquid'))?.value
//         const time = (params.find(i => i.name == 'time'))?.value
//         const temp = (params.find(i => i.name == 'temp'))?.value
//         return (
//             <>
//                 <h3>Reagent</h3>
//                 <div>
//                     <p>With {liquid}</p>
//                     <p>for {time} minutes</p>
//                     <p>at {temp} degrees</p>
//                 </div>
//             </>
//         )
//     }

//     getClass(): string {
//         return "block-reagent";
//     }
// }

// class Temperature implements BlockFields {
//     getContent(params: Insertable[]): JSX.Element {
//         const fromTemp = (params.find(i => i.name == 'from'))?.value
//         const target = (params.find(i => i.name == 'targetTemp'))?.value

//         return (
//             <>
//                 <p className="block-header">Temperature change</p>
//                 <div className="block-body">
//                     <div className="block-inp">
//                         <label>From: </label>
//                         <p id="fromTemp">{fromTemp}</p>
//                     </div>
//                     <div className="block-inp">
//                         <label htmlFor="temper-inp-target">Passed target: {target}</label>
//                         <input id="temper-inp-target" type="number" defaultValue={target} />
//                     </div>
//                 </div>
//             </>
//         );
//     }

//     getStepContent(params: Insertable[]): JSX.Element {
//         const fromTemp = (params.find(i => i.name == 'from'))?.value
//         const target = (params.find(i => i.name == 'targetTemp'))?.value
//         return (
//             <>
//                 <h3>Temperature</h3>
//                 <div>
//                     <p>From {fromTemp}</p>
//                     <p>To {target}</p>
//                 </div>
//             </>
//         )
//     }

//     getClass(): string {
//         return "block-temperat";
//     }
// }


function WashInputs(props: { stepData: StepDTO; change: (arg0: WashStep) => void; }){

    const initialParams = props.stepData.params as WashStep;
    const [washParams, setWashParams] = useState(initialParams);

    const handleChange = (target: HTMLInputElement | HTMLSelectElement) => {

        setWashParams((prevState) => ({
            ...prevState,
            [target.name]: target.value,
        }));
        
    };

    useEffect(()=>{
        props.change(washParams);
    },[washParams])

    return(
        <>
        <div className="block-body">
            <div className="block-body-row">
                <div className="block-inp">
                    <label>Reagent:</label>
                    <CustomSelect options={liquids} opt_name={'liquidID'} inputChange={handleChange} selected={washParams.liquidID || null}></CustomSelect>
                </div>
            </div>

            <div className="block-body-row col">

                <div className="block-inp">
                    <label htmlFor="wash-inp-iters">Iterations:</label>
                    <input id="wash-inp-iters" type="number" name="iters" value={washParams.iters || ''}
                        onChange={(e)=>handleChange(e.target as HTMLInputElement)}/>
                </div>

                <div className="block-inp">
                    <label htmlFor="wash-inp-time">Inc. time{initialParams.incubation}: </label>
                    <input id="wash-inp-time" type="number" name="incubation"  value={washParams.incubation || ''} 
                        onChange={(e)=>handleChange(e.target as HTMLInputElement)}/>
                </div>

            </div>
        </div>
        </>
    )
}

function ReagentInputs(props: { stepData: StepDTO; change: (arg0: ReagentStep) => void; }){

    const initialParams = props.stepData.params as ReagentStep;
    const [reagParams, setReagParams] = useState(initialParams);

    const handleChange = (target: HTMLInputElement | HTMLSelectElement) => {

        setReagParams((prevState) => ({
            ...prevState,
            [target.name]: target.value,
        }));
        //let a = {iters:1, incubation: 10, liquidID:13} ;
        props.change(reagParams);
    };

    useEffect(()=>{
        props.change(reagParams);
    },[reagParams])

    const filterLiquids = (target: HTMLInputElement | HTMLSelectElement) => {
        //console.log("filterLiquids");
    }

    return(
        <>
        <div className="block-body">
            <div className="block-body-row">
                <div className="block-inp">
                    <label>Category:</label>
                    <CustomSelect options={liquids} opt_name={'reag-sel-cat'} inputChange={filterLiquids} selected={null}></CustomSelect>
                </div>
            </div>

            <div className="block-body-row">
                <div className="block-inp">
                    <label>Liquid:</label>
                    <CustomSelect options={liquids} opt_name={'liquidID'} inputChange={handleChange} selected={reagParams.liquidID || null}></CustomSelect>
                    {/* <select id='reag-sel-liquid' defaultValue={liquid}>
                        {liquids.map((liq, index) => {
                            return (
                                <option value={liq.name} key={index}>{liq.name}</option>
                            )
                        })}
                    </select> */}
                </div>
            </div>

            <div className="block-body-row">
                <div className="block-inp">
                    <label htmlFor="reag-inp-min">Inc. time:</label>
                    <input id="reag-inp-min" type="number" name="incubation" value={reagParams.incubation || ''} onChange={(e)=>handleChange(e.target as HTMLInputElement)}/>
                </div>
            </div>
        </div>
        </>
    )
}

function TemperatureInputs(props: { stepData: StepDTO; change: (arg0: TemperatureStep) => void; }){

    const initialParams = props.stepData.params as TemperatureStep;
    const [temperParams, setTemperParams] = useState(initialParams);

    const handleChange = (target: HTMLInputElement | HTMLSelectElement) => {

        setTemperParams((prevState) => ({
            ...prevState,
            [target.name]: target.value,
        }));
        //let a = {iters:1, incubation: 10, liquidID:13} ;
        //props.change(temperParams);
    };

    useEffect(()=>{
        props.change(temperParams);
    },[temperParams])

    return(
        <>

        <div className="block-body">
            <div className="block-body-row">
                <div className="block-inp">
                    <label>From: </label>
                    <input id="temper-inp-source" type="number" value={temperParams.source} name="source" disabled />
                </div>
            </div>
            <div className="block-body-row">
                <div className="block-inp">
                    <label htmlFor="temper-inp-target">Target temperature:</label>
                    <input id="temper-inp-target" type="number" name="target" value={temperParams.target==-1? "": temperParams.target} onChange={(e)=>handleChange(e.target)} />
                </div>
            </div>
        </div>
        </>
    )
}
export interface WorkBlockProps {
    block: StepDTO;
    addBlock: (block: StepDTO) => void
    editBlock: (block: StepDTO) => void
}

export const WorkBlock: React.FC<WorkBlockProps> = ({ block, addBlock, editBlock }) => {

    let newBlock = block;
    const [params, setParams] = useState<{[key: string]: any}>({});

    const updateParams = (step_params: any) =>{
        setParams(params => ({
            ...params,
            ...step_params
        }))
    }

    const addBlockToParent = () => {
        
        block.params = params as typeof block.params;
        block.id == -1 ? addBlock(block) : editBlock(block);
    }

    // useEffect(() => {   
    //     console.log("Work block params changed:")
    //     console.log(params);
    // }, [params]);


    return (
        <>
            <div className="inputs">
                {block.type==StepType.Washing && <WashInputs stepData={block} change={updateParams}></WashInputs>}
                {block.type==StepType.Reagent && <ReagentInputs stepData={block} change={updateParams}></ReagentInputs>}
                {block.type==StepType.Temperature && <TemperatureInputs stepData={block} change={updateParams}></TemperatureInputs>}
            </div>
            <div className='block-footer'>
                <button id="constr-settings">
                    <div>
                        <SVG_Icon size_x={20} size_y={20} 
                            path="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z">
                        </SVG_Icon>
                        <p>Workspace Settings</p>
                    </div>
                    <SVG_Icon size_x={20} size_y={20} 
                        path="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"></SVG_Icon>
                </button>
            </div>
            <div className='workspace-footer'>
                <button id="info-btn">
                    <SVG_Icon size_x={20} size_y={20} path="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"></SVG_Icon>
                </button>
                <button className={`save-btn ${block.type}`} onClick={() => addBlockToParent()}>Add Step</button>
            </div>
        </>
    )
}

export interface StepBlockProps {
    block: StepDTO;
    removeBlock: (block: StepDTO) => void;
    editToggle: (block: StepDTO) => void
}
export const StepBlock: React.FC<StepBlockProps> = ({ block, removeBlock, editToggle }) => {

    return (
        <div className={`step ${block.type}`}>
            <div className='step-header'>
                <h3>{block.type}</h3>
                <div>
                    <button className='step-btn' onClick={() => editToggle(block)}>
                        <SVG_Icon size_x={15} size_y={15} path="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/>
                        Edit
                    </button>
                    <button className='step-btn' onClick={() => removeBlock(block)}>
                        <SVG_Icon size_x={15} size_y={15} path="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"/>
                        Delete
                    </button>
                </div>
            </div>
            <div className='step-params'>
                {block.type==StepType.Washing &&
                <>
                <div className='param-row'>
                    <div className='param-cell'>
                        <span>With:</span>
                        <p>{(block.params as WashStep).liquidID}</p>
                    </div>
                    <div className='param-cell'>
                        <span>At:</span>
                        <p>{(block.params as WashStep).temperature}°C</p>
                    </div>
                </div>

                <div className='param-row'>
                    <div className='param-cell'>
                        <span>For:</span>
                        <p>{(block.params as WashStep).iters} times</p>
                    </div>
                    <div className='param-cell'>
                        <span>For:</span>
                        <p>{(block.params as WashStep).incubation} seconds</p>
                    </div>
                </div>

                </>
                }

                {block.type==StepType.Reagent &&
                <>
                <div className='param-row'>
                    <div className='param-cell'>
                        <span>With:</span>
                        <p>{(block.params as ReagentStep).liquidID}</p>
                    </div>
                    <div className='param-cell'>
                        <span>At:</span>
                        <p>{(block.params as ReagentStep).temperature}°C</p>
                    </div>
                </div>

                <div className='param-row'>
                    <div className='param-cell'>
                        <span>For:</span>
                        <p>{(block.params as ReagentStep).incubation} seconds</p>
                    </div>
                    <div></div>
                </div>
                </>
                }

                {block.type==StepType.Temperature &&
                <>
                <div className='param-row'>
                    <div className='param-cell'>
                        <span>Change from:</span>
                        <p>{(block.params as TemperatureStep).source}°C</p>
                    </div>
                    <div className='param-cell'>
                        <span>To:</span>
                        <p>{(block.params as TemperatureStep).target}°C</p>
                    </div>
                </div>
                </>
                }
            </div>
        </div>
    )
}
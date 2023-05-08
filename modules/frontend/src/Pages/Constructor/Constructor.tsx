import NavigationBar from "NavigationBar/NavigationBar";
import { useEffect, useState } from 'react';
import './Constructor.css'
import { WorkBlock, BlockProps, BlockType, StepBlock } from './Block';
import { DragDropContext, Draggable, DraggableStateSnapshot, DragUpdate, Droppable, DropResult } from 'react-beautiful-dnd'

//TODO: optimize getStyle()
const getStyle = (isDragging: boolean, active: boolean, draggableStyle: any) => ({
    margin: `0 0 10px 0`,
    border: active ? `5px solid #ff4c4f` : `none`,
    ...draggableStyle
})

export default function Constructor() {
    const [blocks, setBlocks] = useState<BlockProps[]>([]);
    const [workBlock, setWorkBlock] = useState<BlockProps>();
    const [currentPosition, setCurrentPosition] = useState(null);

    const addWorkBlock = (block: BlockProps) =>{
        setWorkBlock(block)
    } 

    const addBlock = (props: BlockProps) => {
        //new ID = maxID+1
        let id = blocks.length == 0 ? 0 : ((blocks.reduce(function(prev, current) {
            return (prev.id > current.id) ? prev : current
        })).id +1) // reduce() returns object
        
        setBlocks([...blocks, { type: props.type, id: props.id == -1? id : props.id, other: 'test', params:props.params }])
    }

    const removeBlock = (id: number) => {
        setBlocks((current) =>
            current.filter((block) => block.id !== id)
        )
    }

    const editBlock = (block:BlockProps) =>{
        let index = blocks.findIndex(x=>x.id==block.id);
        let newBlocks = [...blocks]

        let editedBlock = {...newBlocks[index]}
        editedBlock.params=block.params;
        editedBlock.type=block.type;

        newBlocks[index] = editedBlock;
        setBlocks([...newBlocks])
    }

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result

        if (!destination) return

        const steps = Array.from(blocks)
        const [newSteps] = steps.splice(source.index, 1)
        steps.splice(destination.index, 0, newSteps)

        setBlocks(steps)
    }

    const test = ()=>{
        let steps = document.body
        console.log(steps)
        console.log("Offset width: ", steps?.offsetWidth)
    }


    useEffect(() => {
        setWorkBlock(undefined); // Nullifying working block when added to timeline
    }, [blocks]);


    return (
        <>
            <NavigationBar />
            <div className="font-rb" id="main">
                <div id='container'>
                    <div id="workspace">
                        <div className="options">
                            <button className="construct-btn" id="cb-washing" onClick={() => addWorkBlock(({type:BlockType.Washing, id:-1, params:[]} as BlockProps))}><span className="fas fa-water"></span></button>
                            <button className="construct-btn" id="cb-reagent" onClick={() => addWorkBlock(({type:BlockType.Reagent, id:-1, params:[]} as BlockProps))}><span className="fas fa-flask"></span></button>
                            <button className="construct-btn" id="cb-temperat" onClick={() => addWorkBlock(({type:BlockType.Temperature, id:-1, params:[]} as BlockProps))}><span className="fas fa-temperature-low"></span></button>
                        </div>
                        <div id="block-edit">
                            {workBlock != undefined &&
                                <WorkBlock block={workBlock} addBlock={addBlock} editBlock={editBlock}></WorkBlock>
                            }
                        </div>
                        <div className="options">
                            <button className="construct-btn" id="cb-save"><span className="fas fa-download"></span></button>
                            <button className="construct-btn" id="cb-settings"><span className="fas fa-wrench"></span></button>
                            <button className="construct-btn" id="cb-info"><span className="fas fa-info"></span></button>
                        </div>
                    </div>
                    <div id="timeline">
                        <div>Protocol name: <b>Test prt</b></div>
                        <DragDropContext onDragEnd={onDragEnd} onDragUpdate={test}>
                            <Droppable droppableId="item">
                                {(provided) => (
                                    <div id="steps" {...provided.droppableProps} ref={provided.innerRef}>
                                        {
                                            blocks.map((block, index) =>{
                                                let active = block.id==workBlock?.id? true : false
                                                return (
                                                    <Draggable key={String(block.id)} draggableId={String(block.id)} index={index} 
                                                    >
                                                        {(provided, snapshot)=>(
                                                            <div ref={provided.innerRef} 
                                                                {...provided.dragHandleProps} 
                                                                {...provided.draggableProps} 
                                                                onClick={() => addWorkBlock(block)}
                                                                style={getStyle(snapshot.isDragging, active, provided.draggableProps.style)}>
                                                                <StepBlock  key={index} type={block.type} id={block.id} params={block.params} removeBlock={removeBlock} ></StepBlock>
                                                                
                                                            </div>
                                                        )}
                                                    </Draggable> 
                                                )
                                            })
                                        }
                                        {provided.placeholder}
                                    </div>
                                    
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>
            </div>
        </>
    )
}
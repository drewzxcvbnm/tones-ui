import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { ProtocolDto } from 'sharedlib/dto/protocol.dto'

interface ProtocolState {
    protocol: ProtocolDto
    progress: number //percents
    status: Status
}

interface SystemState {
    protocols: ProtocolState[]
    isRunning: boolean //true if at least one protocol (of any current status) is deployed 
}

export const enum Status {
    Ongoing = "ONGOING",
    Error = "ERROR",
    Finished = "FINISHED",
}
const initialState: SystemState = {
    protocols: [],
    isRunning: false
}

export const progressSlice = createSlice({
    name: 'progress',
    initialState,
    reducers: {
        run: (state, action: PayloadAction<ProtocolDto>) => {
            let newLaunchedProtocol: ProtocolState = {
                protocol: action.payload,
                progress: 0,
                status: Status.Ongoing
            };
            state.protocols.push(newLaunchedProtocol);
            state.isRunning = true;
        },

        moveProgress: (state, action) => {
            state.protocols[action.payload.protocolToMove].progress = action.payload.progressToAdd
        },

        finish: (state, action: PayloadAction<number>) => {
            state.protocols[action.payload].status = Status.Finished;
        },

        discard: (state, action: PayloadAction<number>) => {
            state.protocols = state.protocols.filter((e) => {
                return e.protocol.id !== action.payload;
            })
            if(state.protocols.length == 0) state.isRunning = false;
        },

        error: (state, action: PayloadAction<number>) => {
            state.protocols[action.payload].status = Status.Error;
        },
    },
})

export const { run, moveProgress, finish, discard, error } = progressSlice.actions;

export default progressSlice.reducer
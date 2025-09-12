import {configureStore} from "@reduxjs/toolkit";
import authReducer,  { loadFromStorage }  from "./authSlice";

export const store = configureStore({
    reducer : {
        auth:authReducer,
    },
});
store.dispatch(loadFromStorage());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
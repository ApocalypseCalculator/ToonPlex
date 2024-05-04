import * as React from 'react';

export interface SessionData {
    username: string,
    token: string,
    ready: boolean
}
export interface Session {
    data: SessionData,
    updateToken: (token: string) => void
}

export const SessionContext = React.createContext<Session>({} as any);

export const SessionProvider = (props: { children: React.ReactNode }) => {
    let [data, setData] = React.useState({
        username: "",
        token: "",
        ready: false
    } as SessionData);
    function updateToken(token: string) {
        setData({
            username: "",
            token: token,
            ready: true
        });
        localStorage.setItem("token", token);
    }
    React.useEffect(() => {
        let storagetoken = localStorage.getItem("token");
        if (storagetoken && storagetoken !== "") {
            updateToken(storagetoken);
        }
        else {
            setData({
                username: "",
                token: "",
                ready: true
            });
        }
    }, []);
    return (
        <SessionContext.Provider value={{ data, updateToken}}>
            {props.children}
        </SessionContext.Provider>
    )
}
import * as React from 'react';

export interface SessionData {
    username: string,
    token: string,
    ready: boolean
}
export interface Session {
    data: SessionData,
    updateData: (data: {username: string, token: string}) => void
}

export const SessionContext = React.createContext<Session>({} as any);

export const SessionProvider = (props: { children: React.ReactNode }) => {
    let [data, setData] = React.useState({
        username: "",
        token: "",
        ready: false
    } as SessionData);
    function updateData(data: { username: string, token: string}) {
        setData({
            username: data.username,
            token: data.token,
            ready: true
        });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", data.username);
    }
    React.useEffect(() => {
        let storagetoken = localStorage.getItem("token");
        let storageuser = localStorage.getItem("user");
        if (storagetoken && storagetoken !== "" && storageuser && storageuser !== "") {
            setData({
                username: storageuser,
                token: storagetoken,
                ready: true
            });
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
        <SessionContext.Provider value={{ data, updateData}}>
            {props.children}
        </SessionContext.Provider>
    )
}
import * as React from 'react';

export interface Session {
    token: string,
    updateToken: (token: string) => void
}

export const SessionContext = React.createContext<Session>({
    token: "",
    updateToken: (token: string) => { }
});

export const SessionProvider = (props: { children: React.ReactNode }) => {
    let [token, setToken] = React.useState("");
    function updateToken(token: string) {
        setToken(token);
        localStorage.setItem("token", token);
    }
    React.useEffect(() => {
        let storagetoken = localStorage.getItem("token");
        if (storagetoken) {
            updateToken(storagetoken);
        }
    }, []);
    return (
        <SessionContext.Provider value={{ token, updateToken }}>
            {props.children}
        </SessionContext.Provider>
    )
}
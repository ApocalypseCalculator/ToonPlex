import * as React from 'react';
import { default as axios } from 'axios';

export interface SessionData {
    username: string,
    token: string,
    ready: boolean
}
export interface Session {
    data: SessionData,
    favourites: any[],
    updateData: (data: { username: string, token: string }) => void
}

export const SessionContext = React.createContext<Session>({} as any);

export const SessionProvider = (props: { children: React.ReactNode }) => {
    let [data, setData] = React.useState({
        username: "",
        token: "",
        ready: false
    } as SessionData);
    function updateData(data: { username: string, token: string }) {
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

    const [favourites, setFavourites] = React.useState([] as any[]);
    React.useEffect(() => {
        // fetch favourites
        if (data.ready && data.token !== "") {
            axios.get("/api/user/favourite/get", {
                headers: {
                    Authorization: data.token
                }
            }).then((response) => {
                setFavourites(response.data.favourites);
            });
        }
    }, [data]);

    return (
        <SessionContext.Provider value={{ data, updateData, favourites }}>
            {props.children}
        </SessionContext.Provider>
    )
}
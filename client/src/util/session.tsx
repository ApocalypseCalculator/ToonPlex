import * as React from 'react';
import { default as axios } from 'axios';

export interface FavouritesData {
    favourites: any[],
    ready: boolean
}
export interface SessionData {
    username: string,
    token: string,
    ready: boolean
}
export interface Session {
    data: SessionData,
    favourites: FavouritesData,
    updateData: (data: { username: string, token: string }) => void,
    updateFavourites: (slug: string, todelete: boolean) => void
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

    const [favourites, setFavourites] = React.useState({favourites: [], ready: false} as FavouritesData);
    React.useEffect(() => {
        // fetch favourites
        if (data.ready && data.token !== "") {
            axios.get("/api/user/favourite/get", {
                headers: {
                    Authorization: data.token
                }
            }).then((response) => {
                setFavourites({favourites: response.data.favourites, ready: true});
            });
        }
        else if(data.ready) {
            setFavourites({favourites: [], ready: true});
        }
    }, [data]);

    function updateFavourites(slug: string, todelete: boolean) {
        if (data.token === "") {
            return;
        }
        if (todelete) {
            axios.post(`/api/user/favourite/record/${slug}`, {
                delete: true
            }, {
                headers: {
                    Authorization: data.token
                }
            }).then((response) => {
                setFavourites({favourites: favourites.favourites.filter((fav) => fav.slug !== slug), ready: true});
            });
        }
        else {
            axios.post(`/api/user/favourite/record/${slug}`, {}, {
                headers: {
                    Authorization: data.token
                }
            }).then((response) => {
                setFavourites({favourites: [...favourites.favourites, {slug: slug, date: Date.now()}], ready: true});
            });
        }
    }

    return (
        <SessionContext.Provider value={{ data, updateData, favourites, updateFavourites }}>
            {props.children}
        </SessionContext.Provider>
    )
}
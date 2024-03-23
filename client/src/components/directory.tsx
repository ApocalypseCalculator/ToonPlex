import * as React from 'react';
import {default as axios} from 'axios';
import { SessionContext } from "../util/session";

export const Directory = () => {
    const session = React.useContext(SessionContext);
    const [toons, setToons] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        axios.get('/api/toon/list', {
            headers: {
                Authorization: session.token
            }
        }).then(res => {
            if(res.data.status == 200) {
                setToons(res.data.toons);
            }
            setLoading(false);
        });
    }, [session.token]);
    
    return (
        <>
            <section>
                <div className="container">
                    <div className='row'>
                        
                    </div>
                </div>
            </section>
        </>
    )
}
import * as React from 'react';
import { default as axios } from 'axios';
import { SessionContext } from "../util/session";
import { Link } from 'react-router-dom';

export const Directory = () => {
    const session = React.useContext(SessionContext);
    const [toons, setToons] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        axios.get('/api/toon/list', {
            headers: {
                Authorization: session.token
            }
        }).then(res => {
            if (res.data.status == 200) {
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
                    {
                        loading ?
                            <>Loading... </>
                            :
                            toons.length == 0 ? 
                            <>No toons at this time</> : 
                            toons.map((toon) => {
                                return <div className='col-lg-3 col-sm-6 col-12'>
                                    <div className='webtoon-gridview'>
                                        <Link to={`/toon/${toon.slug}`} className='webtoon-gridimg'>
                                            <img src={`/api/image/get/${toon.cover.transport}`}></img>
                                        </Link>
                                        <div className='d-flex justify-content-between'>
                                            <p className='text'>
                                                {toon.status}
                                            </p>
                                        </div>
                                        <Link to={`/toon/${toon.slug}`}>
                                            <p>{toon.title}</p>
                                        </Link>
                                    </div>
                                </div>
                            })
                    }
                    </div>
                </div>
            </section>
        </>
    )
}
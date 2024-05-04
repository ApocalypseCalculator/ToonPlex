import * as React from 'react';
import { default as axios } from 'axios';
import { SessionContext } from "../util/session";
import { Link, useSearchParams } from 'react-router-dom';

export const Directory = () => {
    const session = React.useContext(SessionContext);
    const [toons, setToons] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    React.useEffect(() => {
        if (session.data.ready) {
            axios.get('/api/toon/list', {
                headers: {
                    Authorization: session.data.token
                }
            }).then(res => {
                if (res.data.status == 200) {
                    setToons(res.data.toons);
                }
                setLoading(false);
            });
        }
    }, [session.data, searchParams]);

    return (
        <>
            <section>
                <div className="container toondirectory">
                    <div className='row'>
                        {
                            loading ?
                                <>Loading... </>
                                :
                                toons.length == 0 ?
                                    <>No toons at this time</> :
                                    toons.map((toon) => {
                                        return <div className='col-6 col-sm-3 col-lg-2'>
                                            <div className='webtoon-gridview'>
                                                <Link to={`/toon/${toon.slug}`} className='webtoon-gridimg'>
                                                    <img className='gridimg-preview' src={`/api/image/get/${toon.cover.transport}`}></img>
                                                </Link>
                                                <div className='d-flex justify-content-between'>
                                                    <p className='text'>
                                                        {toon.status}
                                                    </p>
                                                </div>
                                                <h5 className='dir-toontitle'>
                                                    <Link to={`/toon/${toon.slug}`} className='dir-toonurl'>
                                                        {toon.title}
                                                    </Link>
                                                </h5>
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
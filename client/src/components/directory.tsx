import * as React from 'react';
import { default as axios } from 'axios';
import { SessionContext } from "../util/session";
import { Link, useSearchParams } from 'react-router-dom';

const VALIDPARAMS = ['page', 'author', 'artist', 'genre', 'tag', 'status'];

export const Directory = () => {
    const session = React.useContext(SessionContext);
    const [toons, setToons] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    React.useEffect(() => {
        if (session.data.ready) {
            let queries = [] as string[];
            searchParams.forEach((value, key) => {
                if (VALIDPARAMS.includes(key)) {
                    queries.push(`${key}=${value}`);
                }
            });
            let append = queries.length > 0 ? `?${queries.join("&")}` : "";
            axios.get(`/api/toon/list${append}`, {
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

    function updateSearchParams(func: (oldparams: URLSearchParams) => URLSearchParams) {
        setSearchParams(func);
        setLoading(true);
    }

    return (
        <>
            <section>
                <div className="container toondirectory">
                    {
                        <SearchParamBadges searchParams={searchParams} setSearchParams={updateSearchParams} />
                    }
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

function SearchParamBadges(props: any) {
    const [curvalids, setCurvalids] = React.useState([] as any[]);
    React.useEffect(() => {
        setCurvalids(VALIDPARAMS.filter((param) => props.searchParams.has(param)));
    }, [props.searchParams]);
    return <>
        {
            curvalids.length > 0 ? <div className='searchparamarea'>
                <div className='row'><h4 className='searchquerytitle'>Filters Applied</h4></div>
                <div className='row'>
                    {
                        curvalids.map((param) => {
                            return <span className="badge badge-pill badge-primary searchqueryparam dirparampill">
                                {param}: {props.searchParams.get(param)} &nbsp;
                                <button type="button" className="close searchqueryparam" onClick={() => {
                                    props.setSearchParams((oldparams : URLSearchParams) => {
                                        oldparams.delete(param);
                                        return oldparams;
                                    });
                                }}>
                                    <span>×</span>
                                </button>
                            </span>
                        })
                    }
                </div>
            </div> : <></>
        }
    </>
}

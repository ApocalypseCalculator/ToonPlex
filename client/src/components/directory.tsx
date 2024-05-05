import * as React from 'react';
import { default as axios } from 'axios';
import { SessionContext } from "../util/session";
import { Link, useSearchParams } from 'react-router-dom';

const VALIDPARAMS = ['page', 'author', 'artist', 'genre', 'tag', 'status', 'amount'];

export const Directory = () => {
    const session = React.useContext(SessionContext);
    const [toons, setToons] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [pagination, setPagination] = React.useState({
        curpage: 1,
        totalpages: 1
    });

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
                    setPagination({
                        curpage: parseInt(res.data.page),
                        totalpages: Math.ceil(parseInt(res.data.total) / parseInt(res.data.pagesize))
                    });
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
                                                    <img className='gridimg-preview' src={toon.cover.transport ?
                                                        `/api/image/get/${toon.cover.transport}` :
                                                        // we piggyback off of wikipedia's placeholder image
                                                        'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg'
                                                    }></img>
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
                    <div className='toondir-pagination'>
                        <ul className='pagination justify-content-center'>
                            <li className={`page-item${pagination.curpage == 1 ? ' disabled' : ''}`}>
                                {
                                    pagination.curpage == 1 ?
                                        <span className="page-link">{`<<`}</span> : <a className="page-link" onClick={() => {
                                            updateSearchParams((oldparams: URLSearchParams) => {
                                                oldparams.set('page', '1');
                                                return oldparams;
                                            });
                                        }}>{`<<`}</a>
                                }
                            </li>
                            {
                                Array.from(Array(pagination.totalpages).keys()).map((i) => {
                                    if (i == 0 && pagination.curpage > 3) {
                                        // show ellipsis at first page if we're more than 3 pages in
                                        return <li className={`page-item disabled`}>
                                            <span className="page-link">...</span>
                                        </li>
                                    }
                                    else if (i == pagination.totalpages - 1 && pagination.curpage < pagination.totalpages - 2) {
                                        return <li className={`page-item disabled`}>
                                            <span className="page-link">...</span>
                                        </li>
                                    }
                                    else if (i < pagination.curpage - 2 && pagination.curpage > 3) {
                                        // hide these if we have preceding ellipsis already
                                        return <></>
                                    }
                                    else if (i > pagination.curpage + 2 && pagination.curpage < pagination.totalpages - 2) {
                                        // hide these if we have trailing ellipsis already
                                        return <></>
                                    }
                                    else {
                                        return <li className={`page-item${pagination.curpage == i + 1 ? ' active' : ''}`}>
                                            {
                                                pagination.curpage == i + 1 ?
                                                    <span className="page-link">{i + 1}</span> : <a className="page-link" onClick={() => {
                                                        updateSearchParams((oldparams: URLSearchParams) => {
                                                            oldparams.set('page', (i + 1).toString());
                                                            return oldparams;
                                                        });
                                                    }}>{i + 1}</a>
                                            }
                                        </li>
                                    }
                                })
                            }
                            <li className={`page-item${pagination.curpage == pagination.totalpages ? ' disabled' : ''}`}>
                                {
                                    pagination.curpage == pagination.totalpages ?
                                        <span className="page-link">{`>>`}</span> : <a className="page-link" onClick={() => {
                                            updateSearchParams((oldparams: URLSearchParams) => {
                                                oldparams.set('page', (pagination.totalpages).toString());
                                                return oldparams;
                                            });
                                        }}>{`>>`}</a>
                                }
                            </li>
                        </ul>
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
                                    props.setSearchParams((oldparams: URLSearchParams) => {
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

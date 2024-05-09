import * as React from 'react';
import { default as axios } from 'axios';
import { SessionContext } from "../util/session";
import { Link, useParams } from 'react-router-dom';

export const Toon = () => {
    const session = React.useContext(SessionContext);
    const [toon, setToon] = React.useState({} as any);
    const [loading, setLoading] = React.useState(true);
    const { toonslug } = useParams();

    React.useEffect(() => {
        if (toonslug !== "" && session.data.ready) {
            axios.get(`/api/toon/get/${toonslug}`, {
                headers: {
                    Authorization: session.data.token
                }
            }).then(res => {
                if (res.data.status == 200 && res.data.toon) {
                    if (session.data.token) {
                        axios.get(`/api/user/history/toon/${toonslug}`, {
                            headers: {
                                Authorization: session.data.token
                            }
                        }).then(res2 => {
                            if (res2.data.status == 200) {
                                for (let i = 0; i < res.data.toon.chapters.length; i++) {
                                    let read = res2.data.history.find((e: any) => e.chapterid == res.data.toon.chapters[i].id);
                                    if (read) {
                                        res.data.toon.chapters[i].read = true;
                                    }
                                }
                                setToon(res.data.toon);
                                setLoading(false);
                            }
                        });
                    }
                    else {
                        setToon(res.data.toon);
                        setLoading(false);
                    }
                }
            });
        }
    }, [session.data, toonslug]);

    return (
        <>
            <section className='toondetails'>
                <div className="container">
                    <div className='row'>
                        {
                            loading ?
                                <>
                                    Loading...
                                </> :
                                <>
                                    <div className='col-lg-9 col-12'>
                                        <div className='row'>
                                            <div className='col-lg-6 col-md-7 col-12'>
                                                <div className='cover-art-box'>
                                                    <img src={toon.cover.transport ?
                                                        `/api/image/get/${toon.cover.transport}` :
                                                        `https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg`
                                                    } />
                                                </div>
                                            </div>
                                            <div className='col-lg-6 col-md-5 col-12'>
                                                <div className='toon-details'>
                                                    <h2>{toon.title}</h2>
                                                    <p className='summary'>
                                                        {toon.summary}
                                                    </p>
                                                    {
                                                        toon.chapters && toon.chapters.length > 0
                                                            ?
                                                            <div className='d-flex pt-4'>
                                                                <Link to={`/reader/${toonslug}/1`} className='anime-btn btn btn-primary mr-3'>
                                                                    Read First
                                                                </Link>
                                                                <Link to={`/reader/${toonslug}/${toon.chapters.length}`} className='anime-btn btn btn-primary'>
                                                                    Read Last
                                                                </Link>
                                                                {
                                                                    toon.chapters.reverse().find((e: any) => e.read) ?
                                                                        <Link to={`/reader/${toonslug}/${toon.chapters.reverse().find((e: any) => e.read).order}`} className='anime-btn btn btn-primary ml-3'>
                                                                            Continue Reading
                                                                        </Link> : <></>
                                                                }
                                                            </div> : <></>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-lg-3 col-sm-6 col-12'>
                                        <h3>Details</h3>
                                        <p>
                                            <span>Author(s): </span>
                                            {
                                                toon.authors.map((e: any, i: number) => {
                                                    return <>
                                                        <b><Link to={`/directory?author=${encodeURIComponent(e.name)}`}>{e.name}</Link></b>
                                                        {i < toon.authors.length - 1 ? ', ' : ''}
                                                    </>
                                                })
                                            }
                                        </p>
                                        <p>
                                            <span>Artist(s): </span>
                                            {
                                                toon.artists.map((e: any, i: number) => {
                                                    return <>
                                                        <b><Link to={`/directory?artist=${encodeURIComponent(e.name)}`}>{e.name}</Link></b>
                                                        {i < toon.artists.length - 1 ? ', ' : ''}
                                                    </>
                                                })
                                            }
                                        </p>
                                        <p>
                                            <span>Genres: </span>
                                            {
                                                toon.genres.map((e: any, i: number) => {
                                                    return <>
                                                        <b><Link to={`/directory?genre=${encodeURIComponent(e.name)}`}>{e.name}</Link></b>
                                                        {i < toon.genres.length - 1 ? ', ' : ''}
                                                    </>
                                                })
                                            }
                                        </p>
                                        <p>
                                            <span>Tags: </span>
                                            {
                                                toon.tags.map((e: any, i: number) => {
                                                    return <>
                                                        <b><Link to={`/directory?tag=${encodeURIComponent(e.name)}`}>{e.name}</Link></b>
                                                        {i < toon.tags.length - 1 ? ', ' : ''}
                                                    </>
                                                })
                                            }
                                        </p>
                                        <p>
                                            <span>Alt title: </span>
                                            <b>{toon.alttitle}</b>
                                        </p>
                                        <p>
                                            <span>Status: </span>
                                            <b><Link to={`/directory?status=${toon.status}`}>{toon.status}</Link></b>
                                        </p>
                                    </div>
                                </>
                        }
                    </div>
                </div>
            </section>
            {
                !loading
                    ?
                    <section className='release sec-mar'>
                        <div className='container'>
                            <div className='row chapterlist'>
                                <div className='col-md-12 overflow-auto'>
                                    {
                                        toon.chapters.reverse().map((chapter: any) => {
                                            return <><h5>
                                                <Link to={`/reader/${toonslug}/${chapter.order}`}>
                                                    {chapter.name ?? `Chapter ${chapter.order}`}
                                                </Link>
                                                {
                                                    chapter.read ? <>&nbsp; <span className='badge badge-pill badge-info'>Read</span></> : <></>
                                                }
                                                <span className='releasedate'>{new Date(chapter.date).toDateString()}</span>
                                            </h5><hr /></>
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </section> : <> </>
            }
        </>
    )
}
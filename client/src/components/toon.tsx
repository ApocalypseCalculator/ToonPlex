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
        if (toonslug !== "") {
            axios.get(`/api/toon/get/${toonslug}`, {
                headers: {
                    Authorization: session.token
                }
            }).then(res => {
                if (res.data.status == 200) {
                    setToon(res.data.toon);
                }
                setLoading(false);
            });
        }
    }, [session.token, toonslug]);

    return (
        <>
            <section>
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
                                                <img src={`/api/image/get/${toon.cover.transport}`}>
                                                </img>
                                            </div>
                                        </div>
                                        <div className='col-lg-6 col-md-5 col-12'>
                                            <div className='toon-details'>
                                                <h2>{toon.title}</h2>
                                                <p className='summary'>
                                                    {toon.summary}
                                                </p>
                                                {
                                                    toon.chapters.length > 0 
                                                    ?? 
                                                    <div className='d-flex pt-4'>
                                                        <Link to={`/reader/${toonslug}/1`} className='anime-btn btn-dark border-change me-3'>
                                                            Read First
                                                        </Link>
                                                        <Link to={`/reader/${toonslug}/${toon.chapters.length}`} className='anime-btn btn-dark'>
                                                            Read Last
                                                        </Link>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-lg-3 col-sm-6 col-12'>
                                    <h3>Details</h3>
                                    <p>
                                        <span>Author(s): </span>
                                        <b>{toon.authors.map((e: any) => {return e.name}).join(', ')}</b>
                                    </p>
                                    <p>
                                        <span>Artist(s): </span>
                                        <b>{toon.artists.map((e: any) => {return e.name}).join(', ')}</b>
                                    </p>
                                    <p>
                                        <span>Genres: </span>
                                        <b>{toon.genres.map((e: any) => {return e.name}).join(', ')}</b>
                                    </p>
                                    <p>
                                        <span>Tags: </span>
                                        <b>{toon.tags.map((e: any) => {return e.name}).join(', ')}</b>
                                    </p>
                                    <p>
                                        <span>Alt title: </span>
                                        <b>{toon.alttitle}</b>
                                    </p>
                                    <p>
                                        <span>Status: </span>
                                        <b>{toon.status}</b>
                                    </p>
                                </div>
                                </>
                        }
                    </div>
                </div>
            </section>
            {
                !loading
                ?? 
                <section className='relese sec-mar'>
                    <div className='container'>
                        <div className='row'>
                            <div className='col-md-12 overflow-auto'>
                                {
                                    toon.chapters.map((chapter : any) => {
                                        return <h5>
                                            <Link to={`/reader/${toonslug}/${chapter.order}`}>
                                                Chapter {chapter.order}
                                            </Link>
                                            <span>{new Date(chapter.date).toDateString()}</span>
                                        </h5>
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </section>
            }
        </>
    )
}
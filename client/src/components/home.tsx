import * as React from 'react';
import { default as axios } from 'axios';
import { SessionContext } from "../util/session";
import { Link } from 'react-router-dom';

const AMOUNT_PER_SECTION = 6;

export const Home = () => {
    const session = React.useContext(SessionContext);
    const [newtoons, setNewtoons] = React.useState([]);
    const [readhistory, setReadhistory] = React.useState([]);

    React.useEffect(() => {
        if (session.data.ready && session.data.token !== "") {
            Promise.all([
                axios.get(`/api/toon/list?amount=${AMOUNT_PER_SECTION}&orderby=id&order=desc`, {
                    headers: {
                        Authorization: session.data.token
                    }
                }),
                axios.get(`/api/user/history/aggregate`, {
                    headers: {
                        Authorization: session.data.token
                    }
                })
            ]).then(([toonlist, history]) => {
                setNewtoons(toonlist.data.toons);
                setReadhistory(history.data.history);
            });
        }
    }, [session.data.ready]);

    return (
        <>
            <div className="jumbotron jumbotron-fluid">
                <div className="container">
                    {
                        session.data.ready && session.data.token !== "" ?
                            <>
                                <h3>Welcome back, {session.data.username}</h3>
                                <br />
                                <h5>Browse your personal, curated library of premium content</h5>
                            </> : <h1>ToonPlex</h1>
                    }
                </div>
            </div>
            {
                session.data.ready && session.data.token !== "" ?
                    <>
                        <div className='container'>
                            <div className='row mx-lg-n5'>
                                <div className='col-sm px-lg-5'>
                                    <section>
                                        <div className='toonlist-heading'>
                                            <h3>Continue Reading</h3>
                                        </div>
                                    </section>
                                    <div className='row'>
                                        {
                                            readhistory.map((history: any, i) => (
                                                <div className='col-6' key={i}>
                                                    <div className='toonlist-item webtoon-gridview'>
                                                        <Link to={`/toon/${history.toonslug}`} className='webtoon-gridimg'>
                                                            <img className='gridimg-preview' src={history.cover.transport ?
                                                                `/api/image/get/${history.cover.transport}` :
                                                                // we piggyback off of wikipedia's placeholder image
                                                                'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg'
                                                            }></img>
                                                        </Link>
                                                        <div className='d-flex justify-content-between'>
                                                            <p className='text dir-toontitle'>
                                                                Reading: {history.name}
                                                            </p>
                                                        </div>
                                                        <h5 className='dir-toontitle'>
                                                            <Link to={`/toon/${history.toonslug}`} className='dir-toonurl'>
                                                                {history.toontitle}
                                                            </Link>
                                                        </h5>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                                <div className='col-sm px-lg-5'>
                                    <section>
                                        <div className='toonlist-heading'>
                                            <h3>New Uploads</h3>
                                        </div>
                                    </section>
                                    <div className='row'>
                                        {
                                            newtoons.map((toon: any, i) => (
                                                <div className='col-6' key={i}>
                                                    <div className='toonlist-item webtoon-gridview'>
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
                                            ))
                                        }
                                    </div>
                                </div>
                                { /*
                                I will implement favouriting soon fr fr
                                <div className='col-sm px-lg-5'>
                                    <section>
                                        <div className='toonlist-heading'>
                                            <h3>Reread Favourites</h3>
                                        </div>
                                    </section>
                                    <div className='row'>
                                        {
                                            newtoons.map((toon: any, i) => (
                                                <div className='col-6' key={i}>
                                                    <div className='toonlist-item webtoon-gridview'>
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
                                            ))
                                        }
                                    </div>
                                    </div> */}
                            </div>
                        </div>
                    </>
                    : <div className="container">
                        <h4>View your favourite webtoons, on your own server</h4>
                        <p>Scrape and upload your webtoons, and view them without
                            the ads or slow loading times
                        </p>
                    </div>
            }
        </>
    )
}
import * as React from 'react';
import { default as axios } from 'axios';
import { SessionContext } from "../util/session";
import { Link, useParams } from 'react-router-dom';

export const Reader = () => {
    const session = React.useContext(SessionContext);
    const [chapterdet, setChapterdet] = React.useState({ pages: [] } as any);
    const [loading, setLoading] = React.useState(true);

    const { toonslug, chapter } = useParams();

    React.useEffect(() => {
        if (toonslug !== "" && chapter !== "" && session.data.ready) {
            axios.get(`/api/chapter/get/${toonslug}/${chapter}`, {
                headers: {
                    Authorization: session.data.token
                }
            }).then(res => {
                if (res.data.status == 200 && res.data.chapter) {
                    setChapterdet(res.data.chapter);
                    setLoading(false);
                    if(session.data.token) {
                        axios.post(`/api/user/history/record/${toonslug}/${chapter}`, {}, {
                            headers: {
                                Authorization: session.data.token
                            }
                        });
                    }
                }
            });
        }
    }, [session.data, toonslug, chapter]);

    return (
        <>
            <section>
                <div className="container readerpage">
                    {
                        !loading ? <>
                            <h3 className='chapter-title'>{chapterdet.name}</h3>
                            <div className='chapter-info mt-3'>
                                <p><Link to={`/toon/${toonslug}`}>Back to Toon</Link></p>
                                <p>{chapterdet.toon.title}, chapter {chapterdet.order} of {chapterdet.toon._count.chapters}</p>
                                <p>Date published: {new Date(chapterdet.date).toDateString()}</p>
                            </div>
                            <PaginationSelector toonslug={toonslug} chapterdet={chapterdet} />
                        </> : <></>
                    }
                    <div className='read-container'>
                        {
                            loading ?
                                <>Loading... </>
                                :
                                <>
                                    <div className='reading-content'>
                                        {
                                            chapterdet.pages.map((page: any, i: number) => {
                                                return <PageImage key={`page-${i + 1}`} url={page.image.transport} />
                                            })
                                        }
                                    </div></>
                        }
                    </div>
                    {
                        !loading ? <PaginationSelector toonslug={toonslug} chapterdet={chapterdet} /> : <></>
                    }
                </div>
            </section>
        </>
    )
}

function PageImage(props: any) {
    const [loadmsg, setLoadmsg] = React.useState("Loading...");
    return <div className='page-break no-gaps' key={props.key}>
        <img
            style={loadmsg === "" ? {} : { display: 'none' }}
            src={`/api/image/get/${props.url}`}
            className='chapter-img'
            onLoad={() => { setLoadmsg("") }}
            onError={() => setLoadmsg("An error occurred loading this page")} />
        <p style={loadmsg === "" ? { display: 'none' } : {}}>{loadmsg}</p>
    </div>
}

function PaginationSelector(props: any) {
    // paginator offers next/prev buttons as available
    // button clicks also triggers scroll to top
    function scrollToTop() {
        setTimeout(() => {
            window.scrollTo({ top: -1, left: 0, behavior: 'smooth' });
        }, 10);
    }
    return <div className='pagination-selector'>
        {
            props.chapterdet.order > 1
            &&
            <Link to={`/reader/${props.toonslug}/${props.chapterdet.order - 1}`} className={`prev-chapter btn btn-primary${props.chapterdet.toon._count.chapters > props.chapterdet.order ? ' mr-3' : ''}`} 
                onClick={scrollToTop}>Previous Chapter</Link>
        }
        {
            props.chapterdet.toon._count.chapters > props.chapterdet.order
            &&
            <Link to={`/reader/${props.toonslug}/${props.chapterdet.order + 1}`} className='next-chapter btn btn-primary' 
                onClick={scrollToTop}>Next Chapter</Link>
        }
    </div>
}

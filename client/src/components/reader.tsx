import * as React from 'react';
import { default as axios } from 'axios';
import { SessionContext } from "../util/session";
import { Link, useParams } from 'react-router-dom';

export const Reader = () => {
    const session = React.useContext(SessionContext);
    const [chapterdet, setChapterdet] = React.useState({pages: []} as any);
    const [loading, setLoading] = React.useState(true);

    const { toonslug, chapter } = useParams();

    React.useEffect(() => {
        if (toonslug !== "" && chapter !== "") {
            axios.get(`/api/chapter/get/${toonslug}/${chapter}`, {
                headers: {
                    Authorization: session.token
                }
            }).then(res => {
                if (res.data.status == 200 && res.data.chapter) {
                    setChapterdet(res.data.chapter);
                    setLoading(false);
                }
            });
        }
    }, [session.token, toonslug, chapter]);

    return (
        <>
            <section>
                <div className="container">
                    {
                        !loading ? <PaginationSelector toonslug={toonslug} chapterdet={chapterdet} /> : <></>
                    }
                    <div className='read-container'>
                        {
                            loading ?
                                <>Loading... </>
                                :
                                <>
                                <h3>{chapterdet.name}</h3><br/>
                                <div className='reading-content'>
                                    {
                                        chapterdet.pages.map((page: any, i: number) => {
                                            return <div className='page-break no-gaps' key={`page-${i + 1}`}>
                                                <img src={`/api/image/get/${page.image.transport}`} className='chapter-img'></img>
                                            </div>
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

function PaginationSelector(props: any) {
    // paginator offers next/prev buttons as available
    // button clicks also triggers scroll to top
    return <div className='pagination-selector'>
        {
            props.chapterdet.order > 1
            &&
            <Link to={`/reader/${props.toonslug}/${props.chapterdet.order - 1}`} className='prev-chapter' onClick={() => {window.scrollTo({top: 0, behavior: 'smooth'})}}>Previous Chapter</Link>
        }
        {
            props.chapterdet.toon._count.chapters > props.chapterdet.order
            &&
            <Link to={`/reader/${props.toonslug}/${props.chapterdet.order + 1}`} className='next-chapter' onClick={() => {window.scrollTo({top: 0, behavior: 'smooth'})}}>Next Chapter</Link>
        }
    </div>
}
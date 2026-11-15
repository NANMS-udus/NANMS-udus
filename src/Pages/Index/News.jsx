import { useContext } from 'react';
import './News.css';
import { GenContext } from '../../MyContexts/GenContexts'
import dayjs from 'dayjs';
import { Link } from 'react-router';

export default function News() {

  const { news } = useContext(GenContext)

  const newsSrtd = news.sort((a, b) => dayjs(b).valueOf() - dayjs(b).valueOf())

  console.log(newsSrtd);


  return (
    <section id="news">
      <div className="home-section-header">
        <h2 className="text-headline-lg">Latest News</h2>
        <p className="text-secondary text-body-md">Stay updated with our recent activities, announcements, and
          health outreach programs.</p>
      </div>
      {
        news.length
          ? <div className="news-grid">
            {
              newsSrtd.map((n) => {
                return (
                  <article className="index-news-card" key={n.id}>
                    <img alt={n.headline} className="news-img"
                      src={n.cover_pic_url} />
                    <div className="news-content">
                      <span className="news-date">{dayjs(n.date).format('MMM D, YYYY')}</span>
                      <h3 className="news-title">{n.headline}</h3>
                      <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="news-excerpt">{n.body}</p>
                    </div>
                  </article>
                )
              })
            }
          </div>



          : <h2 style={{
            color: 'grey',
            textAlign: 'center'
          }}>
            No news found
          </h2>
      }
      <Link
        to={'/news'}
        style={{
          color: 'var(--primary)',
          textDecoration: 'underline',
          textAlign: 'center',
          display: 'block',
          marginTop: '24px'
        }}
      >
        See all news
      </Link>
    </section>

  );
};
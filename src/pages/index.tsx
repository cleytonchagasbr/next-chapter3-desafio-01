import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { FaRegCalendar, FaRegUser } from 'react-icons/fa';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const formattedPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  const [posts, setPosts] = useState<Post[]>(formattedPost);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [currentPage, setCurrentPage] = useState(1);

  async function handleCarregarMaisItens() {
    if (currentPage !== 1 && nextPage === null) {
      return;
    }

    const response = await fetch(`${nextPage}`).then(result => {
      return result.json();
    });
    setNextPage(response.next_page);
    setCurrentPage(response.page);

    const newPosts = response.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts([...posts, ...newPosts]);
  }
  return (
    <>
      <div className={styles.container}>
        <Header />
        <div>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <ul key={post.uid} className={styles.content}>
                <h1 className={commonStyles.title}>{post.data.title}</h1>
                <h2 className={commonStyles.subTitle}>{post.data.subtitle}</h2>
                <div className={styles.contentInfo}>
                  <div>
                    <FaRegCalendar />
                    <time>{post.first_publication_date}</time>
                  </div>
                  <div>
                    <FaRegUser />
                    <h3>{post.data.author}</h3>
                  </div>
                </div>
              </ul>
            </Link>
          ))}
        </div>
        {nextPage ? (
          <button
            type="button"
            onClick={() => handleCarregarMaisItens()}
            className={styles.btnCarregarMais}
          >
            Carregar mais posts
          </button>
        ) : null}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 1,
    }
  );

  const posts = response.results.map(post => ({
    data: {
      author: post.data.author,
      subtitle: post.data.subtitle,
      title: post.data.title,
    },
    first_publication_date: post.first_publication_date,
    uid: post.uid,
  }));

  const postsPagination = {
    next_page: response.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
